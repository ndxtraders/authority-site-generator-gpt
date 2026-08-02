import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="text-5xl font-bold text-gray-900">
          {site.business.name}
        </h1>

        <p className="mt-6 text-xl text-gray-600">
          {site.business.primaryService} in {site.business.city}, {site.business.state}
        </p>

        <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-2xl font-semibold">
            🎉 Lead Generation Framework
          </h2>

          <p className="mt-4 text-gray-700">
            Congratulations! Your homepage is loading data from
            <strong> content/site.json</strong>.
          </p>
        </div>
      </section>
    </main>
  );
}
