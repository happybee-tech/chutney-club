import { Header } from '@/components/Header';
import { Footer } from '@/components/sections/Footer';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F5EBDD_0%,#F2E6D7_100%)] text-[#1F1B17]">
      <Header scrolled />

      <section className="px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/60 bg-white/35 p-6 shadow-[0_20px_60px_rgba(33,19,12,0.12)] backdrop-blur-xl sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8E6D4F]">About Chutney Club</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#1E1A15] sm:text-5xl">
            Indian taste, healthy routine.
          </h1>
          <p className="mt-5 text-base leading-7 text-[#4F3F32]">
            Chutney Club helps busy people eat better without sacrificing flavor. We build fresh, nutrient-balanced
            salads and pair them with bold Indian chutneys so healthy food feels familiar, satisfying, and easy to
            repeat every day.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-[#E6D8C9] bg-white/70 p-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#6D553F]">Fresh First</h2>
              <p className="mt-2 text-sm text-[#4F3F32]">Small-batch prep and same-day dispatch for better freshness.</p>
            </article>
            <article className="rounded-2xl border border-[#E6D8C9] bg-white/70 p-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#6D553F]">Taste Consistency</h2>
              <p className="mt-2 text-sm text-[#4F3F32]">Signature chutneys and dressings designed for Indian palate.</p>
            </article>
            <article className="rounded-2xl border border-[#E6D8C9] bg-white/70 p-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#6D553F]">Simple Ordering</h2>
              <p className="mt-2 text-sm text-[#4F3F32]">Quick add-to-cart and smooth checkout for daily usage.</p>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
