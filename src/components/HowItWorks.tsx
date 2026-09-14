const STEPS = [
  {
    number: '01',
    title: 'Elige tu producto',
    description:
      'Explora el catálogo de rifas activas y elegí el premio que más te guste.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    ),
  },
  {
    number: '02',
    title: 'Compra tus boletos',
    description:
      'Adquirí uno o varios boletos de forma simple y segura, desde solo el 7% del valor del producto.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 4.5h16.5a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5z"
      />
    ),
  },
  {
    number: '03',
    title: 'Participa en la rifa',
    description:
      'Cuando se completen los boletos, el sorteo se realiza de forma pública y transparente.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    number: '04',
    title: 'Si ganas, recibe tu premio',
    description:
      'Te contactamos de inmediato y coordinamos la entrega de tu premio donde estés.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35"
      />
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            ¿Cómo funciona?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Participar es fácil, rápido y 100% seguro. Así de simple.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <span className="text-sm font-bold text-indigo-200">
                {step.number}
              </span>
              <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-7 w-7"
                >
                  {step.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
