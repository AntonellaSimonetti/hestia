import { Link } from "react-router";

import { Camera, Star, ChefHat, ArrowRight } from "lucide-react";

function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1600&h=900&fit=crop&auto=format"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-(--hestia-bg)/88" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--hestia-chip-bg) border border-(--hestia-accent)/20">
                <span className="text-(--hestia-accent) text-xs font-semibold uppercase tracking-widest">
                  Asistente culinario inteligente
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight text-(--hestia-text)">
                  ¿Qué vamos a cocinar hoy?
                </h1>

                <p className="text-lg text-(--hestia-muted) leading-relaxed max-w-lg">
                  HestIA te ayuda a transformar los ingredientes que tenés en
                  casa en recetas prácticas y personalizadas.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/despensa"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-(--hestia-accent) text-white font-semibold hover:opacity-90 transition-all shadow-sm"
                >
                  Ir a mi despensa
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/recetas"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-(--hestia-accent) text-(--hestia-accent) font-semibold hover:bg-(--hestia-chip-bg) transition-all"
                >
                  <ChefHat size={16} />
                  Explorar recetas
                </Link>
              </div>

              <div className="flex gap-8 pt-4 border-t border-(--hestia-border)">
                {[
                  {
                    value: "Recetas",
                    label: "Desde la base de datos",
                  },
                  {
                    value: "Despensa",
                    label: "Organizada por usuario",
                  },
                  {
                    value: "IA",
                    label: "Generación personalizada",
                  },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="font-serif text-2xl font-bold text-(--hestia-accent)">
                      {value}
                    </span>

                    <span className="text-xs text-(--hestia-muted)">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden md:block">
              <Link
                to="/despensa"
                className="relative group w-full block rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=700&h=500&fit=crop&auto=format"
                  alt="Ingredientes frescos"
                  className="w-full h-100 object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <p className="text-white font-semibold text-lg">
                      Organizá tu despensa
                    </p>

                    <p className="text-white/70 text-sm">
                      Descubrí qué recetas podés preparar
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-(--hestia-accent) flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Camera size={22} className="text-white" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-27 md:py-31 bg-(--hestia-card)">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-(--hestia-text)">
              ¿Cómo funciona?
            </h2>

            <p className="text-(--hestia-muted) max-w-lg mx-auto">
              En tres pasos sencillos transforma los ingredientes de tu despensa
              en platos deliciosos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Agrega ingredientes",
                desc: "Introduce manualmente o toma una foto de tu despensa.",
                icon: Camera,
              },
              {
                step: "02",
                title: "Genera recetas",
                desc: "Analizamos tus ingredientes y sugerimos recetas.",
                icon: ChefHat,
              },
              {
                step: "03",
                title: "Cocina y guarda",
                desc: "Guarda tus recetas favoritas en colecciones.",
                icon: Star,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-(--hestia-chip-bg) border border-(--hestia-accent) flex items-center justify-center">
                  <Icon size={24} className="text-(--hestia-accent)" />
                </div>

                <span className="block text-xs font-bold text-(--hestia-accent) tracking-widest">
                  {step}
                </span>

                <h3 className="font-serif text-xl font-bold text-(--hestia-text)">
                  {title}
                </h3>

                <p className="text-sm text-(--hestia-muted)">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
