export default function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-16 text-center shadow-xl sm:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />

        <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
          ¿Listo para ganar tu próximo premio?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-indigo-100">
          Sumate a miles de personas que ya están participando en nuestras
          rifas. Tu boleto ganador te está esperando.
        </p>

        <a
          href="#rifas"
          className="relative mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
        >
          Ver rifas
        </a>
      </div>
    </section>
  )
}
