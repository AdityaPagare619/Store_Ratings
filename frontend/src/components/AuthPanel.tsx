import { useState } from "react";
import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPanel({ onLogin }: { onLogin: (t: string, u: any) => void }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", address: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const mutate = useMutation({
    mutationFn: async () => {
      setError(null);
      if (mode === "login") {
        const res = await api.post("/api/auth/login", { email: form.email, password: form.password });
        return res.data;
      } else {
        const res = await api.post("/api/auth/signup", form);
        return res.data;
      }
    },
    onSuccess: (data: any) => {
      onLogin(data.token, data.user);
    },
    onError: async (e: any) => {
      setError(e.response?.data?.message || "Something went wrong");
    },
  });

  if (user) return null;

  return (
    <div className="card-glass rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">{mode === "login" ? "Welcome back" : "Create your account"}</div>
        <button className="text-[var(--brand-500)] text-sm" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Need an account?" : "Have an account?"}
        </button>
      </div>
      {mode === "signup" && (
        <>
          <label className="block text-sm mb-1">Name (20–60)</label>
          <input className="w-full mb-2 px-3 py-2 border rounded-md" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="block text-sm mb-1">Address (≤ 400)</label>
          <input className="w-full mb-2 px-3 py-2 border rounded-md" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </>
      )}
      <label className="block text-sm mb-1">Email</label>
      <input className="w-full mb-2 px-3 py-2 border rounded-md" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <label className="block text-sm mb-1">Password</label>
      <input type="password" className="w-full mb-2 px-3 py-2 border rounded-md" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <div className="text-sm text-gray-600 mb-2">Demo accounts: admin@example.com / Admin@123, owner@example.com / Owner@123, user@example.com / User@123</div>
      <button className="button" onClick={() => mutate.mutate()} disabled={mutate.isPending}>
        {mutate.isPending ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
      </button>
    </div>
  );
}