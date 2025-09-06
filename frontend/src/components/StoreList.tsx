import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import RateWidget from "./RateWidget";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

type Store = { id: number; name: string; address: string; averageRating: number; ratingsCount: number };

export default function StoreList() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["stores", q],
    queryFn: async () => {
      const res = await api.get(`/api/stores`, { params: q ? { q } : {} });
      return res.data.items as Store[];
    },
  });

  return (
    <section className="my-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <input
          aria-label="Search stores"
          className="w-full md:w-80 px-3 py-2 rounded-md border"
          placeholder="Search by name or address"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid md:grid-cols-2 gap-4"
        >
          {data?.map((s) => (
            <motion.div
              key={s.id}
              variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
              className="card-glass rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-sm text-gray-600">{s.address}</div>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">{s.averageRating.toFixed(1)}</span> / 5 ★
                </div>
              </div>
              {user && (
                <div className="mt-3">
                  <RateWidget storeId={s.id} />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}