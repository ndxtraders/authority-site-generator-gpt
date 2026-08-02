export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Roof Repair Modesto
          </h2>
          <p className="text-sm text-slate-500">
            Roofing Professionals
          </p>
        </div>

        <nav className="hidden gap-8 text-sm font-medium md:flex">
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>

        <button className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700">
          Free Estimate
        </button>
      </div>
    </header>
  );
}
