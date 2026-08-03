import { useEffect, useState } from "react";
import { Link } from "react-router";

import { Camera, Star, ChefHat, ArrowRight, Clock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function normalizeRecipe(recipe) {
  return {
    ...recipe,
    id: recipe.id || recipe._id,
    image: recipe.image || "/imgs/logo.png",
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
  };
}

function HomePage() {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFeaturedRecipes() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/recipes`);

        const contentType = response.headers.get("content-type");

        const data = contentType?.includes("application/json")
          ? await response.json()
          : [];

        if (!response.ok) {
          throw new Error(data.message || "No se pudieron cargar las recetas.");
        }

        const recipes = Array.isArray(data) ? data : data.recipes || [];

        setFeaturedRecipes(recipes.map(normalizeRecipe).slice(0, 3));
      } catch (requestError) {
        setError(requestError.message || "No se pudieron cargar las recetas.");
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedRecipes();
  }, []);

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

      {/* FEATURED RECIPES */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-(--hestia-text)">
                Recetas destacadas
              </h2>

              <p className="text-(--hestia-muted)">
                Algunas ideas para empezar a cocinar
              </p>
            </div>

            <Link
              to="/recetas"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-(--hestia-accent) hover:underline"
            >
              Ver todas
              <ArrowRight size={14} />
            </Link>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-center text-(--hestia-muted)">
              Cargando recetas...
            </p>
          ) : featuredRecipes.length === 0 ? (
            <div className="py-10 text-center">
              <ChefHat
                size={32}
                className="mx-auto mb-3 text-(--hestia-muted)"
              />

              <p className="text-(--hestia-muted)">
                Todavía no hay recetas disponibles.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  to={`/recetas/${recipe.id}`}
                  className="group block bg-(--hestia-card) rounded-2xl overflow-hidden border border-(--hestia-border) transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative overflow-hidden h-44">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm text-white text-xs">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-serif text-lg font-bold text-(--hestia-text)">
                      {recipe.title}
                    </h3>

                    <p className="text-sm text-(--hestia-muted) line-clamp-2">
                      {recipe.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-(--hestia-muted)">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {recipe.time} min
                      </span>

                      <span className="flex items-center gap-1">
                        <ChefHat size={12} />
                        {recipe.difficulty}
                      </span>

                      {recipe.tags[0] && (
                        <span className="flex items-center gap-1">
                          <Star size={12} />
                          {recipe.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
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
                desc: "Ingresa los alimentos a tu despensa.",
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
