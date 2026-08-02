import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 border-t bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-16 text-slate-300">
        <h3 className="text-2xl font-bold text-white">
          {site.business.name}
        </h3>

        <p className="mt-4 max-w-xl">
          Professional {site.business.primaryService.toLowerCase()} services
          throughout {site.business.region}.
        </p>

        <p className="mt-10 text-sm text-slate-500">
          © {new Date().getFullYear()} {site.business.name}
        </p>
      </div>
    </footer>
  );
}
