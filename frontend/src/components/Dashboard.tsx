import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { User } from "@/hooks/useAuth";

export default function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-semibold">Dashboard</div>
        <button className="button" onClick={onLogout}>Log out</button>
      </div>
      {user.role === "ADMIN" ? <AdminView /> : user.role === "OWNER" ? <OwnerView /> : <UserView />}
    </div>
  );
}

function AdminView() {
  const { data } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await api.get("/api/admin/stats")).data as { users: number; stores: number; ratings: number },
  });
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="card-glass rounded-lg p-4">
        <div className="text-2xl font-bold">{data?.users ?? "…"}</div>
        <div className="text-gray-600">Total Users</div>
      </div>
      <div className="card-glass rounded-lg p-4">
        <div className="text-2xl font-bold">{data?.stores ?? "…"}</div>
        <div className="text-gray-600">Total Stores</div>
      </div>
      <div className="card-glass rounded-lg p-4">
        <div className="text-2xl font-bold">{data?.ratings ?? "…"}</div>
        <div className="text-gray-600">Total Ratings</div>
      </div>
    </div>
  );
}

function OwnerView() {
  const { data } = useQuery({
    queryKey: ["owner", "ratings"],
    queryFn: async () => (await api.get("/api/owner/ratings")).data as { items: any[] },
  });
  return (
    <div>
      <div className="mb-3 text-lg">Your stores</div>
      <div className="grid md:grid-cols-2 gap-4">
        {data?.items?.map((s: any) => (
          <div key={s.id} className="card-glass rounded-lg p-4">
            <div className="font-semibold">{s.name}</div>
            <div className="text-sm text-gray-600 mb-2">{s.address}</div>
            <div className="text-sm">
              Average: <span className="font-semibold">{s.averageRating}</span> / 5 ★ ({s.ratingsCount} ratings)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserView() {
  return (
    <div className="card-glass rounded-lg p-6 text-center">
      <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
      <p className="text-gray-600">Explore stores below and share your feedback with the community.</p>
    </div>
  );
}