import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import { Camera, Star, ChefHat } from "lucide-react";

function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-(--hestia-bg)">
      <Header />

      <main>
        <section className="py-16 md:py-20 bg-(--hestia-card)">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center space-y-3 mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-(--hestia-text)">
                ¿Cómo funciona?
              </h2>

              <p className="text-(--hestia-muted) max-w-lg mx-auto">
                En tres pasos sencillos transforma los ingredientes de tu
                despensa en platos deliciosos.
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

                  <p className="text-sm text-(--hestia-muted)">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;