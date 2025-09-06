import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/50 border-b border-white/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-[var(--brand-500)]">Store Ratings</div>
          <nav className="text-sm text-gray-600">A friendly way to share feedback</nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/40 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-600">
          © {new Date().getFullYear()} Store Ratings. Be kind and constructive.
        </div>
      </footer>
    </div>
  );
}