import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router";

import {
  User,
  ChefHat,
  BookOpen,
  ShoppingBasket,
  Star,
  Clock,
  Heart,
  UtensilsCrossed,
  Edit3,
  Check,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DIETARY_OPTIONS = [
  "Sin Gluten",
  "Sin Lactosa",
  "Vegetariana",
  "Vegana",
  "Baja en Sodio",
  "Baja en Azúcar",
  "Keto",
];

const CUISINE_OPTIONS = [
  "Casera",
  "Mediterránea",
  "Italiana",
  "Mexicana",
  "Española",
  "Asiática",
  "Argentina",
];

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
      <div className="w-10 h-10 rounded-xl bg-(--hestia-chip-bg) flex items-center justify-center">
        <Icon size={18} className="text-(--hestia-accent)" />
      </div>

      <p className="font-serif text-2xl font-bold text-(--hestia-text)">
        {value}
      </p>

      <p className="text-xs text-(--hestia-muted) text-balance">{label}</p>
    </div>
  );
}

function PrefChip({ label, active, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "bg-(--hestia-accent) border-(--hestia-accent) text-white"
          : "border-(--hestia-border) text-(--hestia-muted) hover:border-(--hestia-accent) hover:text-(--hestia-accent)"
      }`}
    >
      {label}
    </button>
  );
}

function EditNameModal({ currentName, onSave, onClose, saving }) {
  const [value, setValue] = useState(currentName);

  async function handleSave() {
    const newName = value.trim() || currentName;

    const saved = await onSave(newName);

    if (saved) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-sm bg-(--hestia-card) border border-(--hestia-border) rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-(--hestia-text)">
            Editar nombre
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-(--hestia-chip-bg) transition-colors"
          >
            <X size={16} className="text-(--hestia-muted)" />
          </button>
        </div>

        <input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={saving}
          className="w-full px-3 py-2 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) outline-none focus:border-(--hestia-accent) transition-colors disabled:opacity-60"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2 rounded-xl border border-(--hestia-border) text-sm font-medium text-(--hestia-muted) hover:border-(--hestia-accent) transition-all disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-xl bg-(--hestia-accent) text-white text-sm font-semibold hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditBioModal({ currentBio, onSave, onClose, saving }) {
  const [value, setValue] = useState(currentBio || "");

  async function handleSave() {
    const saved = await onSave(value.trim());

    if (saved) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-md bg-(--hestia-card) border border-(--hestia-border) rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-(--hestia-text)">
            Editar descripción
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-lg hover:bg-(--hestia-chip-bg) transition-colors"
          >
            <X size={16} className="text-(--hestia-muted)" />
          </button>
        </div>

        <textarea
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={160}
          rows={4}
          disabled={saving}
          placeholder="Contanos un poco sobre vos..."
          className="w-full resize-none px-3 py-2.5 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) placeholder:text-(--hestia-muted) outline-none focus:border-(--hestia-accent) transition-colors disabled:opacity-60"
        />

        <p className="text-right text-xs text-(--hestia-muted)">
          {value.length}/160
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2 rounded-xl border border-(--hestia-border) text-sm font-medium text-(--hestia-muted) hover:border-(--hestia-accent) transition-all disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-xl bg-(--hestia-accent) text-white text-sm font-semibold hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    avatar: "",
    bio: "",
    joinDate: "",
    dietaryPreferences: [],
    cuisinePreferences: [],
  });

  const [pantryItems, setPantryItems] = useState([]);

  const [collections, setCollections] = useState([]);

  const [savedRecipes, setSavedRecipes] = useState([]);

  const [recentRecipes, setRecentRecipes] = useState([]);

  const [generatedRecipes, setGeneratedRecipes] = useState([]);

  const [editingName, setEditingName] = useState(false);

  const [editingBio, setEditingBio] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [error, setError] = useState("");

  function getToken() {
    return localStorage.getItem("hestia_token");
  }

  async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    if (!token) {
      navigate("/login");
      throw new Error("Debes iniciar sesión para ver tu perfil.");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data = {};

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    }

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

  function formatJoinDate(date) {
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat("es-AR", {
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const [
          userResponse,
          pantryResponse,
          collectionsResponse,
          favoritesResponse,
          recentResponse,
          generatedResponse,
        ] = await Promise.all([
          apiRequest("/api/users/me"),
          apiRequest("/api/pantry"),
          apiRequest("/api/collections"),
          apiRequest("/api/users/me/favorites"),
          apiRequest("/api/users/me/recently-viewed"),
          apiRequest("/api/ai/recipes/saved"),
        ]);

        const user = userResponse.user;

        setProfile({
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          avatar: user.avatar || "",
          bio: user.bio || "",
          joinDate: formatJoinDate(user.createdAt),
          dietaryPreferences: user.dietaryPreferences || [],
          cuisinePreferences: user.cuisinePreferences || [],
        });

        setPantryItems(pantryResponse.items || []);

        setCollections(collectionsResponse.collections || []);

        setSavedRecipes(favoritesResponse.recipes || []);

        setRecentRecipes(recentResponse.recipes || []);

        setGeneratedRecipes(generatedResponse.recipes || []);
      } catch (requestError) {
        setError(requestError.message || "No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function updateProfile(updates) {
    try {
      setSaving(true);
      setError("");

      const data = await apiRequest("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const user = data.user;

      setProfile((currentProfile) => ({
        ...currentProfile,
        name: user.name ?? currentProfile.name,
        username: user.username ?? currentProfile.username,
        avatar: user.avatar ?? currentProfile.avatar,
        bio: user.bio ?? currentProfile.bio,
        dietaryPreferences:
          user.dietaryPreferences ?? currentProfile.dietaryPreferences,
        cuisinePreferences:
          user.cuisinePreferences ?? currentProfile.cuisinePreferences,
      }));

      localStorage.setItem("hestia_user", JSON.stringify(user));

      return true;
    } catch (requestError) {
      setError(requestError.message || "No se pudo actualizar el perfil.");

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function toggleDietaryPref(preference) {
    const nextPreferences = profile.dietaryPreferences.includes(preference)
      ? profile.dietaryPreferences.filter((item) => item !== preference)
      : [...profile.dietaryPreferences, preference];

    await updateProfile({
      dietaryPreferences: nextPreferences,
    });
  }

  async function toggleCuisinePref(preference) {
    const nextPreferences = profile.cuisinePreferences.includes(preference)
      ? profile.cuisinePreferences.filter((item) => item !== preference)
      : [...profile.cuisinePreferences, preference];

    await updateProfile({
      cuisinePreferences: nextPreferences,
    });
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingAvatar(true);
      setError("");

      const formData = new FormData();
      formData.append("avatar", file);

      const data = await apiRequest("/api/users/me/avatar", {
        method: "POST",
        body: formData,
      });

      setProfile((currentProfile) => ({
        ...currentProfile,
        avatar: data.user.avatar || "",
      }));

      localStorage.setItem("hestia_user", JSON.stringify(data.user));
    } catch (requestError) {
      setError(requestError.message || "No se pudo actualizar la foto.");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  }

  const stats = [
    {
      icon: UtensilsCrossed,
      label: "Recetas generadas",
      value: generatedRecipes.length,
    },
    {
      icon: Heart,
      label: "Recetas guardadas",
      value: savedRecipes.length,
    },
    {
      icon: ShoppingBasket,
      label: "Items en despensa",
      value: pantryItems.length,
    },
    {
      icon: BookOpen,
      label: "Colecciones",
      value: collections.length,
    },
  ];

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <p className="text-center text-(--hestia-muted)">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-(--hestia-text)">
        Mi Perfil
      </h1>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-3xl p-6">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="block rounded-2xl disabled:cursor-wait disabled:opacity-60"
              title="Cambiar foto de perfil"
            >
              <img
                src={profile.avatar || "/imgs/logo.png"}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-(--hestia-border)"
              />
            </button>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-(--hestia-accent) flex items-center justify-center">
              <ChefHat size={12} className="text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-2xl font-bold text-(--hestia-text)">
                {profile.name}
              </h2>

              <button
                type="button"
                onClick={() => setEditingName(true)}
                aria-label="Editar nombre"
                className="p-1.5 rounded-lg hover:bg-(--hestia-chip-bg) transition-colors text-(--hestia-muted) hover:text-(--hestia-accent)"
              >
                <Edit3 size={14} />
              </button>
            </div>

            <p className="text-sm text-(--hestia-muted)">@{profile.username}</p>

            <div className="flex items-start gap-2">
              <p className="text-sm text-(--hestia-text) leading-relaxed">
                {profile.bio || "Todavía no agregaste una biografía."}
              </p>

              <button
                type="button"
                onClick={() => setEditingBio(true)}
                aria-label="Editar descripción"
                title="Editar descripción"
                className="shrink-0 p-1 rounded-lg text-(--hestia-muted) hover:bg-(--hestia-chip-bg) hover:text-(--hestia-accent) transition-colors"
              >
                <Edit3 size={13} />
              </button>
            </div>

            <p className="text-xs text-(--hestia-muted) flex items-center gap-1 mt-1">
              <Star size={11} />
              Miembro desde {profile.joinDate}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-(--hestia-text) mb-4">
          Estadísticas
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </div>
      </div>

      <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-(--hestia-chip-bg) flex items-center justify-center">
            <User size={15} className="text-(--hestia-accent)" />
          </div>

          <div>
            <h2 className="font-serif text-lg font-bold text-(--hestia-text)">
              Preferencias alimentarias
            </h2>

            <p className="text-xs text-(--hestia-muted)">
              Selecciona las que apliquen a ti
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((preference) => (
            <PrefChip
              key={preference}
              label={preference}
              active={profile.dietaryPreferences.includes(preference)}
              disabled={saving}
              onClick={() => toggleDietaryPref(preference)}
            />
          ))}
        </div>

        {profile.dietaryPreferences.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-(--hestia-muted)">
            <Check size={12} className="text-(--hestia-accent)" />

            <span>Activo: {profile.dietaryPreferences.join(", ")}</span>
          </div>
        )}
      </div>

      <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-(--hestia-chip-bg) flex items-center justify-center">
            <ChefHat size={15} className="text-(--hestia-accent)" />
          </div>

          <div>
            <h2 className="font-serif text-lg font-bold text-(--hestia-text)">
              Cocinas favoritas
            </h2>

            <p className="text-xs text-(--hestia-muted)">
              ¿Qué tipo de cocina disfrutas más?
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map((preference) => (
            <PrefChip
              key={preference}
              label={preference}
              active={profile.cuisinePreferences.includes(preference)}
              disabled={saving}
              onClick={() => toggleCuisinePref(preference)}
            />
          ))}
        </div>

        {profile.cuisinePreferences.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-(--hestia-muted)">
            <Check size={12} className="text-(--hestia-accent)" />

            <span>Favoritas: {profile.cuisinePreferences.join(", ")}</span>
          </div>
        )}
      </div>

      {recentRecipes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-(--hestia-text)">
              Vistas recientemente
            </h2>

            <Link
              to="/recetas"
              className="text-sm text-(--hestia-accent) hover:underline"
            >
              Ver todas
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 stagger">
            {recentRecipes.slice(0, 4).map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recetas/${recipe.id}`}
                className="group flex items-center gap-3 p-3 bg-(--hestia-card) border border-(--hestia-border) rounded-2xl hover:border-(--hestia-accent) transition-all card-hover"
              >
                <img
                  src={recipe.image || "/imgs/logo.png"}
                  alt={recipe.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-(--hestia-text) group-hover:text-(--hestia-accent) line-clamp-2 transition-colors">
                    {recipe.title}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-(--hestia-muted)">
                    <Clock size={10} />

                    <span>{recipe.time} min</span>

                    {typeof recipe.matchPercent === "number" && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          recipe.matchPercent >= 85
                            ? "match-high"
                            : recipe.matchPercent >= 70
                              ? "match-medium"
                              : "match-low"
                        }`}
                      >
                        {recipe.matchPercent}%
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl p-5 space-y-4">
        <h2 className="font-serif text-lg font-bold text-(--hestia-text)">
          Actividad
        </h2>

        <div className="space-y-3">
          {[
            {
              label: "Recetas generadas con IA",
              value: generatedRecipes.length,
              max: 100,
              color: "var(--hestia-accent)",
            },
            {
              label: "Recetas guardadas",
              value: savedRecipes.length,
              max: 20,
              color: "#2d7a2d",
            },
            {
              label: "Ingredientes en despensa",
              value: pantryItems.length,
              max: 30,
              color: "#a0621a",
            },
          ].map(({ label, value, max, color }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-(--hestia-muted)">{label}</span>

                <span className="font-semibold text-(--hestia-text)">
                  {value}
                </span>
              </div>

              <div className="h-2 rounded-full bg-(--hestia-bg) border border-(--hestia-border) overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, (value / max) * 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingName && (
        <EditNameModal
          currentName={profile.name}
          saving={saving}
          onSave={(name) => updateProfile({ name })}
          onClose={() => setEditingName(false)}
        />
      )}
      {editingBio && (
        <EditBioModal
          currentBio={profile.bio}
          saving={saving}
          onSave={(bio) => updateProfile({ bio })}
          onClose={() => setEditingBio(false)}
        />
      )}
    </div>
  );
}
