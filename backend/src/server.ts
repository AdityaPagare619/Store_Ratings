import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";
import { requireAuth, requireRole } from "./middleware/auth";
import { signupSchema, loginSchema, passwordSchema, ratingSchema } from "./middleware/validation";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "supersecretdevkey_change_me";
const TOKEN_TTL = "6h";

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "store-ratings-api" });
});

// Auth
app.post("/api/auth/signup", async (req, res) => {
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten() });
  }
  const { name, email, address, password } = parse.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: "Email already registered" });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, address: address ?? null, password: hashed, role: Role.USER },
    select: { id: true, name: true, email: true, address: true, role: true },
  });
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
  res.status(201).json({ token, user });
});

app.post("/api/auth/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten() });
  }
  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const safe = { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role };
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
  res.json({ token, user: safe });
});

app.post("/api/auth/password", requireAuth, async (req, res) => {
  const parse = passwordSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten() });
  }
  const hashed = await bcrypt.hash(parse.data.password, 10);
  await prisma.user.update({ where: { id: req.user!.userId }, data: { password: hashed } });
  res.json({ message: "Password updated" });
});
// Public stores list with search/sort and average rating
app.get("/api/stores", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const sort = String(req.query.sort || "name");
  const order = String(req.query.order || "asc");
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};
  const stores = await prisma.store.findMany({
    where,
    orderBy:
      sort === "address"
        ? { address: order === "desc" ? "desc" : "asc" }
        : { name: order === "desc" ? "desc" : "asc" },
    include: {
      ratings: true,
    },
  });
  const mapped = stores.map((s) => {
    const avg = s.ratings.length ? s.ratings.reduce((a, r) => a + r.score, 0) / s.ratings.length : 0;
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      averageRating: Number(avg.toFixed(2)),
      ratingsCount: s.ratings.length,
    };
  });
  res.json({ items: mapped });
});

// Store details with ratings and usernames
app.get("/api/stores/:id", async (req, res) => {
  const id = Number(req.params.id);
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      ratings: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!store) return res.status(404).json({ message: "Store not found" });
  const avg = store.ratings.length
    ? store.ratings.reduce((a, r) => a + r.score, 0) / store.ratings.length
    : 0;
  res.json({
    id: store.id,
    name: store.name,
    address: store.address,
    averageRating: Number(avg.toFixed(2)),
    ratings: store.ratings.map((r) => ({
      id: r.id,
      score: r.score,
      comment: r.comment,
      user: r.user,
      updatedAt: r.updatedAt,
    })),
  });
});

// Create/update rating
app.post("/api/ratings", requireAuth, async (req, res) => {
  const parse = ratingSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten() });
  }
  const { storeId, score, comment } = parse.data;
  const userId = req.user!.userId;

  // Ensure store exists
  const exists = await prisma.store.findUnique({ where: { id: storeId } });
  if (!exists) return res.status(404).json({ message: "Store not found" });

  const rating = await prisma.rating.upsert({
    where: { userId_storeId: { userId, storeId } },
    update: { score, comment: comment ?? null },
    create: { userId, storeId, score, comment: comment ?? null },
  });
  res.status(201).json({ rating });
});

// Owner endpoints: their stores + ratings
app.get("/api/owner/ratings", requireAuth, requireRole(Role.OWNER), async (req, res) => {
  const ownerId = req.user!.userId;
  const stores = await prisma.store.findMany({
    where: { ownerId },
    include: { ratings: true },
  });
  const data = stores.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    averageRating: s.ratings.length
      ? Number((s.ratings.reduce((a, r) => a + r.score, 0) / s.ratings.length).toFixed(2))
      : 0,
    ratingsCount: s.ratings.length,
  }));
  res.json({ items: data });
});
// Admin endpoints
app.get("/api/admin/stats", requireAuth, requireRole(Role.ADMIN), async (_req, res) => {
  const [users, stores, ratings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
  ]);
  res.json({ users, stores, ratings });
});

app.get("/api/admin/users", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  const q = String(req.query.q || "").trim();
  const role = String(req.query.role || "");
  const sort = String(req.query.sort || "name");
  const order = String(req.query.order || "asc");

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }
  if (role && ["ADMIN", "USER", "OWNER"].includes(role)) where.role = role;

  const users = await prisma.user.findMany({
    where,
    orderBy:
      sort === "email"
        ? { email: order === "desc" ? "desc" : "asc" }
        : { name: order === "desc" ? "desc" : "asc" },
    select: { id: true, name: true, email: true, address: true, role: true },
  });

  res.json({ items: users });
});

app.get("/api/admin/users/:id", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      stores: { include: { ratings: true } },
    },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  let ownerAverage: number | null = null;
  if (user.role === Role.OWNER) {
    const allRatings = user.stores.flatMap((s) => s.ratings);
    if (allRatings.length) {
      ownerAverage = Number((allRatings.reduce((a, r) => a + r.score, 0) / allRatings.length).toFixed(2));
    } else {
      ownerAverage = 0;
    }
  }
  const safe = { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role };
  res.json({ user: safe, ownerAverage });
});

app.post("/api/admin/stores", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  const { name, address, ownerId } = req.body as { name?: string; address?: string; ownerId?: number };
  if (!name || !address) return res.status(400).json({ message: "name and address are required" });
  if (ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: Number(ownerId) } });
    if (!owner || owner.role !== Role.OWNER) {
      return res.status(400).json({ message: "Invalid ownerId (must be an OWNER)" });
    }
  }
  const store = await prisma.store.create({
    data: { name, address, ownerId: ownerId ? Number(ownerId) : null },
  });
  res.status(201).json({ store });
});

app.post("/api/admin/users", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  const roleParam = String(req.query.role || "");
  if (!["ADMIN", "USER", "OWNER"].includes(roleParam)) {
    return res.status(400).json({ message: "role query param must be ADMIN|USER|OWNER" });
  }
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten() });
  }
  const { name, email, address, password } = parse.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: "Email already registered" });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, address: address ?? null, password: hashed, role: roleParam as Role },
    select: { id: true, name: true, email: true, address: true, role: true },
  });
  res.status(201).json({ user });
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});