import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";

export default function RateWidget({ storeId }: { storeId: number }) {
  const qc = useQueryClient();
  const [hover, setHover] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);

  const mutate = useMutation({
    mutationFn: async (score: number) => {
      setLocked(true);
      const res = await api.post("/api/ratings", { storeId, score });
      return res.data;
    },
    onSettled: async () => {
      setLocked(false);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["stores"] }),
        qc.invalidateQueries({ queryKey: ["store", storeId] }),
      ]);
    },
  });

  return (
    <div className="flex items-center gap-1" aria-label="Rate this store">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          className="text-2xl"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onClick={() => !locked && mutate.mutate(i)}
          disabled={locked}
          aria-label={`Give ${i} star${i > 1 ? "s" : ""}`}
        >
          <span style={{ color: (hover ?? 0) >= i ? "#ffd24d" : "#a4c2ff" }}>★</span>
        </button>
      ))}
    </div>
  );
}