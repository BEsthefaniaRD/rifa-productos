export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-300/30 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center sm:py-32">
        <span className="mb-6 inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
          🎉 Miles de ganadores cada mes
        </span>

        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Gana el producto de tus sueños{' '}
          <span className="text-indigo-600">por una fracción de su precio</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Compra tu boleto desde solo el 7% del valor del producto y participa
          por celulares, tecnología, viajes y mucho más. Rápido, transparente
          y 100% online.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#rifas"
            className="rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700"
          >
            Ver rifas
          </a>
          <a
            href="#como-funciona"
            className="rounded-full border border-slate-300 px-8 py-3.5 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            ¿Cómo funciona?
          </a>
        </div>
      </div>
    </section>
  )
}
