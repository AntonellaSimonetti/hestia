import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router";

import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  ChefHat,
  CheckCircle2,
  Circle,
  ShoppingCart,
  BookOpen,
  Flame,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function normalizeRecipe(recipe) {
  if (!recipe) {
    return null;
  }

  const ingredientDetails = Array.isArray(recipe.ingredientDetails)
    ? recipe.ingredientDetails
    : [];

  const availableFromDetails = ingredientDetails
    .filter((ingredient) => ingredient.available)
    .map((ingredient) =>
      ingredient.quantity
        ? `${ingredient.name} — ${ingredient.quantity}`
        : ingredient.name,
    );

  const missingFromDetails = ingredientDetails
    .filter((ingredient) => !ingredient.available)
    .map((ingredient) =>
      ingredient.quantity
        ? `${ingredient.name} — ${ingredient.quantity}`
        : ingredient.name,
    );

  const totalIngredientDetails = ingredientDetails.length;

  const availableIngredientCount = ingredientDetails.filter(
    (ingredient) => ingredient.available,
  ).length;

  const calculatedMatchPercent =
    totalIngredientDetails > 0
      ? Math.round((availableIngredientCount / totalIngredientDetails) * 100)
      : null;

  return {
    ...recipe,
    id: recipe.id || recipe._id,
    image: recipe.image || "/imgs/logo.png",

    tags: Array.isArray(recipe.tags) ? recipe.tags : [],

    steps: Array.isArray(recipe.steps) ? recipe.steps : [],

    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],

    nutrition: recipe.nutrition || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },

    matchPercent:
      recipe.matchPercent === null
        ? null
        : typeof recipe.matchPercent === "number"
          ? recipe.matchPercent
          : calculatedMatchPercent,

    availableIngredients: Array.isArray(recipe.availableIngredients)
      ? recipe.availableIngredients
      : availableFromDetails,

    missingIngredients: Array.isArray(recipe.missingIngredients)
      ? recipe.missingIngredients
      : ingredientDetails.length > 0
        ? missingFromDetails
        : recipe.ingredients || [],
  };
}

function normalizeIngredientName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9áéíóúñü\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateRecipeMatch(recipe, pantryItems) {
  const ingredientDetails = Array.isArray(recipe.ingredientDetails)
    ? recipe.ingredientDetails
    : [];

  const sourceIngredients =
    ingredientDetails.length > 0
      ? ingredientDetails
      : (recipe.ingredients || []).map((name) => ({
          name,
          quantity: "",
        }));

  const usablePantryItems = pantryItems.filter(
    (item) => Number(item.quantity) > 0 && item.status !== "expired",
  );

  const pantryNames = usablePantryItems.map((item) =>
    normalizeIngredientName(item.displayName || item.name),
  );

  const comparedIngredients = sourceIngredients.map((ingredient) => {
    const ingredientName = normalizeIngredientName(
      ingredient.name || ingredient,
    );

    const available = pantryNames.some(
      (pantryName) =>
        pantryName === ingredientName ||
        pantryName.includes(ingredientName) ||
        ingredientName.includes(pantryName),
    );

    const displayText = ingredient.quantity
      ? `${ingredient.name} — ${ingredient.quantity}`
      : ingredient.name || ingredient;

    return {
      ...ingredient,
      available,
      displayText,
    };
  });

  const availableIngredients = comparedIngredients
    .filter((ingredient) => ingredient.available)
    .map((ingredient) => ingredient.displayText);

  const missingIngredients = comparedIngredients
    .filter((ingredient) => !ingredient.available)
    .map((ingredient) => ingredient.displayText);

  const matchPercent =
    comparedIngredients.length > 0
      ? Math.round(
          (availableIngredients.length / comparedIngredients.length) * 100,
        )
      : 0;

  return {
    ...recipe,
    ingredientDetails: comparedIngredients,
    availableIngredients,
    missingIngredients,
    matchPercent,
  };
}

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);

  const [collections, setCollections] = useState([]);

  const [saved, setSaved] = useState(false);

  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  function getToken() {
    return localStorage.getItem("hestia_token");
  }

  async function request(endpoint, options = {}) {
    const token = getToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type");

    const data =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : {};

    if (!response.ok) {
      throw new Error(data.message || "No se pudo completar la solicitud.");
    }

    return data;
  }

  useEffect(() => {
    async function loadRecipe() {
      try {
        setLoading(true);
        setError("");

        const token = getToken();
        let loadedRecipe;

        /*
         * Las recetas privadas creadas por IA se
         * consultan desde su ruta protegida.
         */
        if (id?.startsWith("ai-") && token) {
          const [recipeData, pantryData] = await Promise.all([
            request(`/api/ai/recipes/saved/${id}`),
            request("/api/pantry"),
          ]);

          const savedAiRecipe = recipeData.recipe || recipeData;

          const pantryItems = Array.isArray(pantryData)
            ? pantryData
            : pantryData.items || [];

          loadedRecipe = calculateRecipeMatch(savedAiRecipe, pantryItems);
        } else if (token) {
          const pantryData = await request("/api/recipes/from-pantry");

          const pantryRecipes = Array.isArray(pantryData)
            ? pantryData
            : pantryData.recipes || [];

          loadedRecipe = pantryRecipes.find(
            (item) => item.id === id || item._id === id,
          );

          if (!loadedRecipe) {
            const publicData = await request(`/api/recipes/${id}`);

            const publicRecipe = publicData.recipe || publicData;

            loadedRecipe = {
              ...publicRecipe,
              matchPercent: 0,
              availableIngredients: [],
              missingIngredients: publicRecipe.ingredients || [],
            };
          }
        } else {
          const publicData = await request(`/api/recipes/${id}`);

          loadedRecipe = {
            ...(publicData.recipe || publicData),
            matchPercent: null,
            availableIngredients: [],
            missingIngredients: [],
            ingredientDetails: [],
          };
        }

        const normalized = normalizeRecipe(loadedRecipe);

        if (!normalized) {
          throw new Error("La receta solicitada no fue encontrada.");
        }

        setRecipe(normalized);

        if (token) {
          const [favoritesData, collectionsData] = await Promise.all([
            request("/api/users/me/favorites"),
            request("/api/collections"),
          ]);

          setSaved(
            favoritesData.recipes?.some((item) => item.id === normalized.id) ||
              false,
          );

          setCollections(collectionsData.collections || []);

          /*
           * Guardamos la receta como vista recientemente.
           * Solo aplica a usuarios autenticados.
           */
          try {
            await request(`/api/users/me/recently-viewed/${normalized.id}`, {
              method: "POST",
            });
          } catch (recentError) {
            console.warn(
              "No se pudo registrar la receta como vista recientemente:",
              recentError.message,
            );
          }
        }
      } catch (requestError) {
        setError(requestError.message || "No se pudo cargar la receta.");
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

  async function toggleFavorite() {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!recipe) {
      return;
    }

    try {
      setBusy(true);
      setError("");

      await request(`/api/users/me/favorites/${recipe.id}`, {
        method: saved ? "DELETE" : "POST",
      });

      setSaved((current) => !current);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleCollection(collection) {
    if (!recipe) {
      return;
    }

    const included = collection.recipeIds?.includes(recipe.id);

    try {
      setBusy(true);
      setError("");

      const data = await request(
        `/api/collections/${collection._id}/recipes/${recipe.id}`,
        {
          method: included ? "DELETE" : "POST",
        },
      );

      setCollections((currentCollections) =>
        currentCollections.map((currentCollection) =>
          currentCollection._id === collection._id
            ? data.collection
            : currentCollection,
        ),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 px-6 text-center">
        <p className="text-(--hestia-muted)">Cargando receta...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 px-6 text-center">
        <ChefHat size={40} className="text-(--hestia-muted)" />

        <p className="font-serif text-2xl font-bold text-(--hestia-text)">
          Receta no encontrada
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Link
          to="/recetas"
          className="text-(--hestia-accent) hover:underline text-sm"
        >
          Volver a recetas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-(--hestia-muted) hover:text-(--hestia-accent) transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      {/* Hero image */}
      <div className="relative rounded-3xl overflow-hidden h-64 md:h-96 mb-8">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {recipe.matchPercent !== null && (
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm ${
                recipe.matchPercent >= 85
                  ? "match-high"
                  : recipe.matchPercent >= 70
                    ? "match-medium"
                    : "match-low"
              }`}
            >
              {recipe.matchPercent}% coincidencia
            </span>
          </div>
        )}

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={busy}
            aria-label={saved ? "Quitar de favoritos" : "Guardar receta"}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all disabled:opacity-60 ${
              saved
                ? "bg-(--hestia-accent) border-(--hestia-accent) text-white"
                : "bg-black/30 border-white/30 text-white hover:bg-(--hestia-accent)"
            }`}
          >
            <Heart size={18} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm text-white text-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="font-serif text-2xl md:text-4xl font-bold text-white leading-tight text-balance">
            {recipe.title}
          </h1>
        </div>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Clock,
            label: "Tiempo",
            value: `${recipe.time} min`,
          },
          {
            icon: ChefHat,
            label: "Dificultad",
            value: recipe.difficulty,
          },
          {
            icon: Users,
            label: "Porciones",
            value: `${recipe.servings} personas`,
          },
          {
            icon: Flame,
            label: "Calorías",
            value: `${recipe.nutrition.calories} kcal`,
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl px-4 py-3 text-center"
          >
            <Icon size={18} className="text-(--hestia-accent) mx-auto mb-1" />

            <p className="text-xs text-(--hestia-muted)">{label}</p>

            <p className="text-sm font-semibold text-(--hestia-text)">
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className="text-(--hestia-muted) leading-relaxed mb-8">
        {recipe.description}
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl p-5 space-y-4">
          <h2 className="font-serif text-xl font-bold text-(--hestia-text)">
            Tienes en casa
          </h2>

          {recipe.availableIngredients.length === 0 ? (
            <p className="text-sm text-(--hestia-muted)">
              {getToken()
                ? "No tenés ingredientes coincidentes en tu despensa para esta receta."
                : "Iniciá sesión y cargá tu despensa para calcular coincidencias."}
            </p>
          ) : (
            <ul className="space-y-2">
              {recipe.availableIngredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="flex items-center gap-3 text-sm"
                >
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />

                  <span className="text-(--hestia-text)">{ingredient}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-(--hestia-text)">
              Necesitas comprar
            </h2>

            {recipe.missingIngredients.length === 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold match-high">
                ¡Todo listo!
              </span>
            )}
          </div>

          {recipe.missingIngredients.length === 0 ? (
            <p className="text-sm text-(--hestia-muted)">
              Tienes todos los ingredientes necesarios para preparar esta
              receta.
            </p>
          ) : (
            <ul className="space-y-2">
              {recipe.missingIngredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="flex items-center gap-3 text-sm"
                >
                  <Circle
                    size={16}
                    className="text-(--hestia-accent) shrink-0"
                  />

                  <span className="text-(--hestia-text)">{ingredient}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Preparation */}
      <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl p-5 md:p-6 mb-8 space-y-5">
        <h2 className="font-serif text-2xl font-bold text-(--hestia-text)">
          Preparación
        </h2>

        <ol className="space-y-4">
          {recipe.steps.map((step, index) => (
            <li key={`${index}-${step}`} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-(--hestia-chip-bg) text-(--hestia-accent) text-sm font-bold flex items-center justify-center mt-0.5">
                {index + 1}
              </span>

              <p className="text-sm text-(--hestia-text) leading-relaxed pt-0.5">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Nutrition */}
      <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl p-5 md:p-6 mb-8 space-y-4">
        <h2 className="font-serif text-xl font-bold text-(--hestia-text)">
          Información nutricional
        </h2>

        <p className="text-xs text-(--hestia-muted)">Por porción aproximada</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            {
              label: "Calorías",
              value: recipe.nutrition.calories,
              unit: "kcal",
            },
            {
              label: "Proteínas",
              value: recipe.nutrition.protein,
              unit: "g",
            },
            {
              label: "Carbohidratos",
              value: recipe.nutrition.carbs,
              unit: "g",
            },
            {
              label: "Grasas",
              value: recipe.nutrition.fat,
              unit: "g",
            },
            {
              label: "Fibra",
              value: recipe.nutrition.fiber,
              unit: "g",
            },
          ].map(({ label, value, unit }) => (
            <div
              key={label}
              className="text-center p-3 rounded-xl bg-(--hestia-bg) border border-(--hestia-border)"
            >
              <p className="font-serif text-xl font-bold text-(--hestia-accent)">
                {value}
              </p>

              <p className="text-xs text-(--hestia-muted)">{unit}</p>

              <p className="text-xs text-(--hestia-muted) mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {recipe.tip && (
        <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl p-5 mb-8">
          <h2 className="font-serif text-lg font-bold text-(--hestia-text) mb-2">
            Consejo HestIA
          </h2>

          <p className="text-sm text-(--hestia-muted)">{recipe.tip}</p>
        </div>
      )}

      {/* Collections */}
      {getToken() && (
        <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-(--hestia-accent)" />

            <h2 className="font-serif text-lg font-bold text-(--hestia-text)">
              Guardar en colección
            </h2>
          </div>

          {collections.length === 0 ? (
            <p className="text-sm text-(--hestia-muted)">
              Todavía no creaste colecciones.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {collections.map((collection) => {
                const included = collection.recipeIds?.includes(recipe.id);

                return (
                  <button
                    key={collection._id}
                    type="button"
                    disabled={busy}
                    onClick={() => toggleCollection(collection)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all border-(--hestia-border) text-(--hestia-muted) hover:border-(--hestia-accent) hover:text-(--hestia-accent) hover:bg-(--hestia-chip-bg) disabled:opacity-60"
                  >
                    {collection.emoji} {collection.name}
                    {included && (
                      <CheckCircle2
                        size={13}
                        className="text-(--hestia-accent)"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={busy}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
            saved
              ? "bg-(--hestia-chip-bg) text-(--hestia-accent) border border-(--hestia-accent)"
              : "bg-(--hestia-accent) text-white"
          }`}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />

          {saved ? "Guardada en favoritos" : "Guardar receta"}
        </button>

        {recipe.missingIngredients.length > 0 && (
          <Link
            to="/despensa"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border border-(--hestia-border) text-(--hestia-muted) hover:border-(--hestia-accent) hover:text-(--hestia-accent) transition-all"
          >
            <ShoppingCart size={18} />
            Agregar faltantes a despensa
          </Link>
        )}
      </div>
    </div>
  );
}
