export default function Footer() {
  return (
    <footer className="mt-24 border-t bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h3 className="text-xl font-bold">
          Roof Repair Modesto
        </h3>

        <p className="mt-3 max-w-xl text-slate-300">
          Professional roof repair, leak repair, roof replacement,
          inspections, and emergency roofing services throughout
          Modesto, California.
        </p>

        <p className="mt-8 text-sm text-slate-400">
          © {new Date().getFullYear()} Roof Repair Modesto
        </p>
      </div>
    </footer>
  );
}
