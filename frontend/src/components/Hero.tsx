import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="bg-[var(--brand-100)]">
      <div className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Find great local stores</h1>
          <p className="text-gray-600">
            Browse community ratings, share quick feedback, and support shop owners.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-3 gap-3"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="aspect-square card-glass rounded-lg"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}