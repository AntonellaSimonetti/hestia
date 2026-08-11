import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Search, SlidersHorizontal, X, ChefHat, Sparkles } from "lucide-react";

import RecipeCard from "../components/recipes/RecipeCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const FILTER_TAGS = [
  "Económico",
  "Saludable",
  "Rápido",
  "Pocos Ingredientes",
  "Vegetariano",
  "Sin Gluten",
  "Latinoamericana",
  "Italiana",
];

const SORT_OPTIONS = [
  {
    value: "match",
    label: "Mayor coincidencia",
  },
  {
    value: "time",
    label: "Más rápidas",
  },
  {
    value: "az",
    label: "A – Z",
  },
];

function normalizeIngredientName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/gi, " ")
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
      : (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map(
          (name) => ({
            name,
            quantity: "",
          }),
        );

  const pantryNames = pantryItems
    .filter((item) => Number(item.quantity) > 0 && item.status !== "expired")
    .map((item) => normalizeIngredientName(item.displayName || item.name))
    .filter(Boolean);

  const comparedIngredients = sourceIngredients.map((ingredient) => {
    const rawName = ingredient?.name || ingredient;

    const ingredientName = normalizeIngredientName(rawName);

    const available = pantryNames.some(
      (pantryName) =>
        pantryName === ingredientName ||
        pantryName.includes(ingredientName) ||
        ingredientName.includes(pantryName),
    );

    return {
      ...(typeof ingredient === "object" && ingredient !== null
        ? ingredient
        : {
            name: String(ingredient || ""),
            quantity: "",
          }),

      name: rawName,
      available,
    };
  });

  const availableIngredients = comparedIngredients
    .filter((ingredient) => ingredient.available)
    .map((ingredient) =>
      ingredient.quantity
        ? `${ingredient.name} — ${ingredient.quantity}`
        : ingredient.name,
    );

  const missingIngredients = comparedIngredients
    .filter((ingredient) => !ingredient.available)
    .map((ingredient) =>
      ingredient.quantity
        ? `${ingredient.name} — ${ingredient.quantity}`
        : ingredient.name,
    );

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

function normalizeRecipe(recipe) {
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

  const calculatedMatchPercent =
    ingredientDetails.length > 0
      ? Math.round(
          (availableFromDetails.length / ingredientDetails.length) * 100,
        )
      : 0;

  return {
    ...recipe,

    id: recipe.id || recipe._id,

    image: recipe.image || "/imgs/logo.png",

    tags: Array.isArray(recipe.tags) ? recipe.tags : [],

    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],

    availableIngredients: Array.isArray(recipe.availableIngredients)
      ? recipe.availableIngredients
      : availableFromDetails,

    missingIngredients: Array.isArray(recipe.missingIngredients)
      ? recipe.missingIngredients
      : ingredientDetails.length > 0
        ? missingFromDetails
        : Array.isArray(recipe.ingredients)
          ? recipe.ingredients
          : [],

    matchPercent:
      recipe.matchPercent === null
        ? null
        : typeof recipe.matchPercent === "number"
          ? recipe.matchPercent
          : calculatedMatchPercent,
  };
}

async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return {};
  }

  return response.json();
}

export default function RecetasPage() {
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);

  const [pantryItems, setPantryItems] = useState([]);

  const [query, setQuery] = useState("");

  const [activeFilters, setActiveFilters] = useState([]);

  const [sortBy, setSortBy] = useState("match");

  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
   * IA
   */
  const [showAiModal, setShowAiModal] = useState(false);

  const [aiInstructions, setAiInstructions] = useState("");

  const [generatingRecipe, setGeneratingRecipe] = useState(false);

  const [generatedRecipe, setGeneratedRecipe] = useState(null);

  const [savingGeneratedRecipe, setSavingGeneratedRecipe] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  function getToken() {
    return localStorage.getItem("hestia_token");
  }

  async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    if (!token) {
      navigate("/login");

      throw new Error("Debes iniciar sesión para generar recetas con IA.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await readJsonResponse(response);

    if (response.status === 401) {
      localStorage.removeItem("hestia_token");

      localStorage.removeItem("hestia_user");

      navigate("/login");

      throw new Error("Tu sesión expiró. Iniciá sesión nuevamente.");
    }

    if (!response.ok) {
      throw new Error(data.message || "No se pudo completar la solicitud.");
    }

    return data;
  }

  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        /*
         * Todas las recetas visibles.
         */
        const publicResponse = await fetch(`${API_URL}/api/recipes`);

        const publicData = await readJsonResponse(publicResponse);

        if (!publicResponse.ok) {
          throw new Error(
            publicData.message || "No se pudieron cargar las recetas.",
          );
        }

        const publicRecipes = Array.isArray(publicData)
          ? publicData
          : publicData.recipes || [];

        /*
         * Sin sesión:
         * mostramos las recetas sin match.
         */
        if (!token) {
          setPantryItems([]);

          const recipesWithoutPersonalMatch = publicRecipes.map((recipe) =>
            normalizeRecipe({
              ...recipe,
              matchPercent: null,
              availableIngredients: [],
              missingIngredients: [],
            }),
          );

          setRecipes(recipesWithoutPersonalMatch);

          return;
        }

        const authHeaders = {
          Authorization: `Bearer ${token}`,
        };

        /*
         * Con sesión:
         * cargamos despensa, match y recetas IA.
         */
        const [pantryResponse, pantryMatchResponse, aiResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/pantry`, {
              headers: authHeaders,
            }),

            fetch(`${API_URL}/api/recipes/from-pantry`, {
              headers: authHeaders,
            }),

            fetch(`${API_URL}/api/ai/recipes/saved`, {
              headers: authHeaders,
            }),
          ]);

        if (pantryResponse.status === 401) {
          localStorage.removeItem("hestia_token");

          localStorage.removeItem("hestia_user");

          setPantryItems([]);

          setRecipes(publicRecipes.map(normalizeRecipe));

          return;
        }

        const pantryData = pantryResponse.ok
          ? await readJsonResponse(pantryResponse)
          : {
              items: [],
            };

        const pantryMatchData = pantryMatchResponse.ok
          ? await readJsonResponse(pantryMatchResponse)
          : {
              recipes: [],
            };

        const aiData = aiResponse.ok
          ? await readJsonResponse(aiResponse)
          : {
              recipes: [],
            };

        const loadedPantryItems = Array.isArray(pantryData)
          ? pantryData
          : pantryData.items || [];

        setPantryItems(loadedPantryItems);

        const pantryRecipes = Array.isArray(pantryMatchData)
          ? pantryMatchData
          : pantryMatchData.recipes || [];

        const aiRecipes = Array.isArray(aiData) ? aiData : aiData.recipes || [];

        const pantryRecipeMap = new Map(
          pantryRecipes.map((recipe) => [recipe.id || recipe._id, recipe]),
        );

        const matchedPublicRecipes = publicRecipes.map((recipe) => {
          const recipeId = recipe.id || recipe._id;

          const matchedRecipe = pantryRecipeMap.get(recipeId);

          if (matchedRecipe) {
            return matchedRecipe;
          }

          return {
            ...recipe,

            matchPercent: 0,

            availableIngredients: [],

            missingIngredients: Array.isArray(recipe.ingredients)
              ? recipe.ingredients
              : [],
          };
        });

        /*
         * Las recetas IA se recalculan
         * contra la despensa actual.
         */
        const matchedAiRecipes = aiRecipes.map((recipe) =>
          calculateRecipeMatch(recipe, loadedPantryItems),
        );

        const combinedRecipes = [...matchedPublicRecipes, ...matchedAiRecipes];

        /*
         * Evitamos duplicados.
         */
        const uniqueRecipes = Array.from(
          new Map(
            combinedRecipes.map((recipe) => [recipe.id || recipe._id, recipe]),
          ).values(),
        );

        setRecipes(uniqueRecipes.map(normalizeRecipe));
      } catch (requestError) {
        setError(requestError.message || "No se pudieron cargar las recetas.");
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, []);

  /*
   * Generar receta IA
   */
  async function generateAiRecipe() {
    try {
      setGeneratingRecipe(true);
      setError("");
      setSuccessMessage("");

      const data = await apiRequest("/api/ai/recipes/generate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          extraIngredients: [],

          instructions: aiInstructions.trim(),
        }),
      });

      setGeneratedRecipe(data.recipe);

      setShowAiModal(false);

      setAiInstructions("");
    } catch (requestError) {
      setError(requestError.message || "No se pudo generar la receta.");
    } finally {
      setGeneratingRecipe(false);
    }
  }

  /*
   * Guardar receta IA
   */
  async function saveGeneratedRecipe() {
    if (!generatedRecipe) {
      return;
    }

    try {
      setSavingGeneratedRecipe(true);
      setError("");
      setSuccessMessage("");

      const data = await apiRequest("/api/ai/recipes/save", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          recipe: generatedRecipe,
        }),
      });

      const savedRecipe = data.recipe || generatedRecipe;

      /*
       * Calculamos el match de la receta
       * recién guardada contra la despensa.
       */
      const matchedSavedRecipe = calculateRecipeMatch(savedRecipe, pantryItems);

      const normalizedSavedRecipe = normalizeRecipe(matchedSavedRecipe);

      /*
       * La agregamos inmediatamente
       * al listado sin recargar la página.
       */
      setRecipes((currentRecipes) => {
        const withoutDuplicate = currentRecipes.filter(
          (currentRecipe) =>
            currentRecipe.id !== normalizedSavedRecipe.id &&
            currentRecipe._id !== normalizedSavedRecipe._id,
        );

        return [normalizedSavedRecipe, ...withoutDuplicate];
      });

      setGeneratedRecipe(normalizedSavedRecipe);

      setSuccessMessage(
        data.message || "Receta generada guardada correctamente.",
      );
    } catch (requestError) {
      setError(requestError.message || "No se pudo guardar la receta.");
    } finally {
      setSavingGeneratedRecipe(false);
    }
  }

  function openAiGenerator() {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setError("");
    setSuccessMessage("");
    setShowAiModal(true);
  }

  function toggleFilter(filter) {
    setActiveFilters((currentFilters) =>
      currentFilters.includes(filter)
        ? currentFilters.filter((item) => item !== filter)
        : [...currentFilters, filter],
    );
  }

  const filtered = useMemo(() => {
    let list = [...recipes];

    /*
     * Buscar.
     */
    if (query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();

      list = list.filter((recipe) => {
        const title = String(recipe.title || "").toLowerCase();

        const description = String(recipe.description || "").toLowerCase();

        const tags = Array.isArray(recipe.tags) ? recipe.tags : [];

        const ingredients = Array.isArray(recipe.ingredients)
          ? recipe.ingredients
          : [];

        return (
          title.includes(normalizedQuery) ||
          description.includes(normalizedQuery) ||
          tags.some((tag) =>
            String(tag).toLowerCase().includes(normalizedQuery),
          ) ||
          ingredients.some((ingredient) =>
            String(ingredient).toLowerCase().includes(normalizedQuery),
          )
        );
      });
    }

    /*
     * Filtros.
     */
    if (activeFilters.length > 0) {
      list = list.filter((recipe) =>
        activeFilters.some((filter) => recipe.tags.includes(filter)),
      );
    }

    /*
     * Orden.
     */
    if (sortBy === "match") {
      list.sort(
        (firstRecipe, secondRecipe) =>
          Number(secondRecipe.matchPercent || 0) -
          Number(firstRecipe.matchPercent || 0),
      );
    }

    if (sortBy === "time") {
      list.sort(
        (firstRecipe, secondRecipe) =>
          Number(firstRecipe.time || 0) - Number(secondRecipe.time || 0),
      );
    }

    if (sortBy === "az") {
      list.sort((firstRecipe, secondRecipe) =>
        String(firstRecipe.title || "").localeCompare(
          String(secondRecipe.title || ""),
          "es",
        ),
      );
    }

    return list;
  }, [recipes, query, activeFilters, sortBy]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <p className="text-center text-(--hestia-muted)">Cargando recetas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-(--hestia-text)">
            Recetas
          </h1>

          <p className="text-(--hestia-muted)">
            {filtered.length} receta
            {filtered.length !== 1 ? "s" : ""} disponible
            {filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Generar con IA */}
        <button
          type="button"
          onClick={openAiGenerator}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--hestia-accent) text-white text-sm font-semibold hover:opacity-90 transition-all shrink-0"
        >
          <Sparkles size={16} />

          <span className="hidden sm:inline">Generar con IA</span>

          <span className="sm:hidden">IA</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {/* Generated recipe preview */}
      {generatedRecipe && (
        <section className="rounded-2xl border border-(--hestia-accent)/30 bg-(--hestia-card) p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-(--hestia-accent)">
                <Sparkles size={14} />
                Receta generada
              </div>

              <h2 className="mt-2 font-serif text-2xl font-bold text-(--hestia-text)">
                {generatedRecipe.title}
              </h2>

              <p className="mt-1 text-sm text-(--hestia-muted)">
                {generatedRecipe.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setGeneratedRecipe(null);

                setSuccessMessage("");
              }}
              className="p-2 rounded-lg text-(--hestia-muted) hover:bg-(--hestia-chip-bg)"
              aria-label="Cerrar receta generada"
            >
              <X size={16} />
            </button>
          </div>

          {/* Datos */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-(--hestia-chip-bg) px-3 py-1 text-(--hestia-chip-text)">
              {generatedRecipe.time} min
            </span>

            <span className="rounded-full bg-(--hestia-chip-bg) px-3 py-1 text-(--hestia-chip-text)">
              {generatedRecipe.difficulty}
            </span>

            <span className="rounded-full bg-(--hestia-chip-bg) px-3 py-1 text-(--hestia-chip-text)">
              {generatedRecipe.servings} porciones
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Ingredientes */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-(--hestia-text)">
                Ingredientes
              </h3>

              <ul className="space-y-2">
                {(
                  generatedRecipe.ingredientDetails ||
                  generatedRecipe.ingredients ||
                  []
                ).map((ingredient, index) => {
                  const ingredientName =
                    typeof ingredient === "string"
                      ? ingredient
                      : ingredient.name;

                  const quantity =
                    typeof ingredient === "object" ? ingredient.quantity : "";

                  const available =
                    typeof ingredient === "object" &&
                    typeof ingredient.available === "boolean"
                      ? ingredient.available
                      : null;

                  return (
                    <li key={`${ingredientName}-${index}`} className="text-sm">
                      <span className="font-medium text-(--hestia-text)">
                        {ingredientName}
                      </span>

                      {quantity && (
                        <span className="text-(--hestia-text)/75">
                          {" "}
                          · {quantity}
                        </span>
                      )}

                      {available === true && (
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {" "}
                          · Disponible
                        </span>
                      )}

                      {available === false && (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {" "}
                          · Falta comprar
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Preparación */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-(--hestia-text)">
                Preparación
              </h3>

              <ol className="space-y-3 text-sm">
                {(generatedRecipe.steps || []).map((step, index) => (
                  <li
                    key={`${index}-${step}`}
                    className="flex gap-2 leading-relaxed text-(--hestia-text)"
                  >
                    <span className="font-bold text-(--hestia-accent) shrink-0">
                      {index + 1}.
                    </span>

                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveGeneratedRecipe}
              disabled={savingGeneratedRecipe}
              className="rounded-xl bg-(--hestia-accent) px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {savingGeneratedRecipe ? "Guardando..." : "Guardar receta"}
            </button>

            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              disabled={generatingRecipe}
              className="rounded-xl border border-(--hestia-border) px-4 py-2 text-sm font-medium text-(--hestia-muted) hover:border-(--hestia-accent) hover:text-(--hestia-accent)"
            >
              Generar otra
            </button>
          </div>
        </section>
      )}

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--hestia-muted)"
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, categoría o ingrediente..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) placeholder:text-(--hestia-muted) outline-none focus:border-(--hestia-accent) transition-colors"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--hestia-muted)"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="px-3 py-2.5 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) outline-none focus:border-(--hestia-accent) transition-colors"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showFilters || activeFilters.length > 0
                ? "bg-(--hestia-accent) border-(--hestia-accent) text-white"
                : "bg-(--hestia-input) border-(--hestia-border) text-(--hestia-muted)"
            }`}
          >
            <SlidersHorizontal size={16} />
            Filtros
            {activeFilters.length > 0 && (
              <span className="bg-white text-(--hestia-accent) rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-(--hestia-card) border border-(--hestia-border)">
          {FILTER_TAGS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => toggleFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                activeFilters.includes(filter)
                  ? "bg-(--hestia-accent) border-(--hestia-accent) text-white"
                  : "border-(--hestia-border) text-(--hestia-muted) hover:border-(--hestia-accent) hover:text-(--hestia-accent)"
              }`}
            >
              {filter}
            </button>
          ))}

          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilters([])}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-(--hestia-accent) hover:bg-(--hestia-chip-bg) transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Recipe grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-(--hestia-card) border border-(--hestia-border) flex items-center justify-center">
            <ChefHat size={28} className="text-(--hestia-muted)" />
          </div>

          <div>
            <p className="font-semibold text-(--hestia-text)">
              No encontramos recetas
            </p>

            <p className="text-sm text-(--hestia-muted) mt-1">
              Intenta con otros términos o elimina los filtros activos
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setQuery("");

              setActiveFilters([]);
            }}
            className="px-4 py-2 rounded-xl bg-(--hestia-accent) text-white text-sm font-medium"
          >
            Restablecer búsqueda
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {/* AI MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!generatingRecipe) {
                setShowAiModal(false);
              }
            }}
          />

          <div className="relative w-full sm:max-w-md bg-(--hestia-card) border border-(--hestia-border) rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--hestia-chip-bg)">
                  <Sparkles size={19} className="text-(--hestia-accent)" />
                </div>

                <div>
                  <h2 className="font-serif text-xl font-bold text-(--hestia-text)">
                    Generar receta
                  </h2>

                  <p className="text-xs text-(--hestia-muted)">
                    Usaremos los ingredientes de tu despensa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                disabled={generatingRecipe}
                className="p-2 rounded-lg hover:bg-(--hestia-chip-bg) transition-colors disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X size={18} className="text-(--hestia-muted)" />
              </button>
            </div>

            {/* Pantry ingredients */}
            <div className="rounded-2xl bg-(--hestia-bg) border border-(--hestia-border) p-4">
              <p className="text-xs font-semibold text-(--hestia-muted) uppercase tracking-wide">
                Ingredientes disponibles
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {pantryItems.filter(
                  (item) =>
                    item.status !== "expired" && Number(item.quantity) > 0,
                ).length === 0 ? (
                  <p className="text-xs text-(--hestia-muted)">
                    No hay ingredientes disponibles en tu despensa.
                  </p>
                ) : (
                  pantryItems
                    .filter(
                      (item) =>
                        item.status !== "expired" && Number(item.quantity) > 0,
                    )
                    .slice(0, 12)
                    .map((item) => (
                      <span
                        key={item._id || item.id}
                        className="rounded-full bg-(--hestia-chip-bg) px-2.5 py-1 text-xs text-(--hestia-chip-text)"
                      >
                        {item.icon && `${item.icon} `}
                        {item.displayName || item.name}
                      </span>
                    ))
                )}
              </div>

              {pantryItems.filter(
                (item) =>
                  item.status !== "expired" && Number(item.quantity) > 0,
              ).length > 12 && (
                <p className="mt-2 text-xs text-(--hestia-muted)">
                  +
                  {pantryItems.filter(
                    (item) =>
                      item.status !== "expired" && Number(item.quantity) > 0,
                  ).length - 12}{" "}
                  ingredientes más
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-1.5">
              <label
                htmlFor="aiInstructions"
                className="text-xs text-(--hestia-muted)"
              >
                ¿Qué te gustaría cocinar? Opcional
              </label>

              <textarea
                id="aiInstructions"
                value={aiInstructions}
                onChange={(event) => setAiInstructions(event.target.value)}
                maxLength={500}
                rows={4}
                disabled={generatingRecipe}
                placeholder="Ej: Una cena rápida, sin horno y para dos personas..."
                className="w-full resize-none rounded-xl bg-(--hestia-input) border border-(--hestia-border) px-3 py-2.5 text-sm text-(--hestia-text) placeholder:text-(--hestia-muted) outline-none focus:border-(--hestia-accent) disabled:opacity-60"
              />

              <p className="text-right text-xs text-(--hestia-muted)">
                {aiInstructions.length}
                /500
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                disabled={generatingRecipe}
                className="flex-1 py-2.5 rounded-xl border border-(--hestia-border) text-sm font-medium text-(--hestia-muted) hover:border-(--hestia-accent) transition-all disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={generateAiRecipe}
                disabled={
                  generatingRecipe ||
                  pantryItems.filter(
                    (item) =>
                      item.status !== "expired" && Number(item.quantity) > 0,
                  ).length === 0
                }
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-(--hestia-accent) text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Sparkles size={15} />

                {generatingRecipe ? "Generando..." : "Generar receta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
