import { useState } from "react";
import { useNavigate } from "react-router";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function LoginPage() {
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function changeMode() {
    setIsRegistering((currentMode) => !currentMode);

    setError("");
    setSuccess("");

    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const email = formData.email.trim().toLowerCase();

      const password = formData.password;

      if (!email || !password) {
        throw new Error(
          "El correo electrónico y la contraseña son obligatorios.",
        );
      }

      if (isRegistering && !formData.name.trim()) {
        throw new Error("El nombre es obligatorio.");
      }

      if (isRegistering && !formData.username.trim()) {
        throw new Error("El nombre de usuario es obligatorio.");
      }

      if (isRegistering && password.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres.");
      }

      if (isRegistering && password !== formData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden.");
      }

      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";

      const body = isRegistering
        ? {
            name: formData.name.trim(),
            username: formData.username.trim().toLowerCase().replace(/^@/, ""),
            email,
            password,
          }
        : {
            email,
            password,
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get("content-type");

      const data = contentType?.includes("application/json")
        ? await response.json()
        : {};

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isRegistering
              ? "No se pudo crear la cuenta."
              : "No se pudo iniciar sesión."),
        );
      }

      /*
       * Algunos backends devuelven:
       * { token, user }
       *
       * Otros:
       * { accessToken, user }
       */
      const token = data.token || data.accessToken;

      if (token) {
        localStorage.setItem("hestia_token", token);
      }

      if (data.user) {
        localStorage.setItem("hestia_user", JSON.stringify(data.user));
      }

      if (isRegistering && !token) {
        setSuccess("Cuenta creada correctamente. Ya podés iniciar sesión.");

        setIsRegistering(false);

        setFormData({
          name: "",
          username: "",
          email,
          password: "",
          confirmPassword: "",
        });

        return;
      }

      navigate("/perfil", {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-(--hestia-card-2) px-4 py-10">
      <img
        src="/imgs/logo.png"
        alt=""
        aria-hidden="true"
        className="block dark:hidden absolute w-120 max-w-full opacity-20"
      />

      <img
        src="/imgs/logo-dark.png"
        alt=""
        aria-hidden="true"
        className="hidden dark:block absolute w-120 max-w-full opacity-20"
      />

      <div className="relative z-10 w-full max-w-100 bg-(--hestia-accent)/15 backdrop-blur-lg border-2 border-(--hestia-border) rounded-2xl">
        <div className="flex items-center justify-center my-5 mx-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 w-full px-4 pb-5"
          >
            <div className="mb-4 text-center">
              <div>
                <img
                  src="/imgs/logo.png"
                  alt="Logo HestIA"
                  className="w-20 mx-auto dark:hidden"
                />

                <img
                  src="/imgs/logo-dark.png"
                  alt="Logo HestIA"
                  className="w-20 mx-auto hidden dark:block"
                />
              </div>

              <h1 className="text-2xl font-bold text-(--hestia-text)">
                {isRegistering
                  ? "Crea tu cuenta en HestIA"
                  : "Tu próxima receta te está esperando"}
              </h1>

              <p className="mt-2 text-(--hestia-muted)">
                {isRegistering
                  ? "Registrate para organizar tu despensa y descubrir recetas"
                  : "Inicia sesión para continuar"}
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {isRegistering && (
              <>
                <div>
                  <label
                    htmlFor="name"
                    className="block px-3 mb-2 text-sm font-medium text-(--hestia-text)"
                  >
                    Nombre
                  </label>

                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    autoComplete="name"
                    disabled={loading}
                    className="w-full rounded-xl border border-(--hestia-border) bg-(--hestia-bg) px-4 py-3 text-(--hestia-text) placeholder:text-(--hestia-muted) focus:outline-none focus:ring-1 focus:ring-(--hestia-accent) disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block px-3 mb-2 text-sm font-medium text-(--hestia-text)"
                  >
                    Nombre de usuario
                  </label>

                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="ejemplo"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full rounded-xl border border-(--hestia-border) bg-(--hestia-bg) px-4 py-3 text-(--hestia-text) placeholder:text-(--hestia-muted) focus:outline-none focus:ring-1 focus:ring-(--hestia-accent) disabled:opacity-60"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block px-3 mb-2 text-sm font-medium text-(--hestia-text)"
              >
                Correo electrónico
              </label>

              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@email.com"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-(--hestia-border) bg-(--hestia-bg) px-4 py-3 text-(--hestia-text) placeholder:text-(--hestia-muted) focus:outline-none focus:ring-1 focus:ring-(--hestia-accent) disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block px-3 mb-2 text-sm font-medium text-(--hestia-text)"
              >
                Contraseña
              </label>

              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                autoComplete={
                  isRegistering ? "new-password" : "current-password"
                }
                disabled={loading}
                className="w-full rounded-xl border border-(--hestia-border) bg-(--hestia-bg) px-4 py-3 text-(--hestia-text) placeholder:text-(--hestia-muted) focus:outline-none focus:ring-1 focus:ring-(--hestia-accent) disabled:opacity-60"
              />
            </div>

            {isRegistering && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block px-3 mb-2 text-sm font-medium text-(--hestia-text)"
                >
                  Confirmar contraseña
                </label>

                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-(--hestia-border) bg-(--hestia-bg) px-4 py-3 text-(--hestia-text) placeholder:text-(--hestia-muted) focus:outline-none focus:ring-1 focus:ring-(--hestia-accent) disabled:opacity-60"
                />
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary/70 px-6 py-2 text-sm font-semibold text-(--hestia-text) border-2 border-hestia-accent-2 transition-all duration-200 hover:bg-(--hestia-accent)/80 hover:shadow-md active:scale-[0.97] focus:outline-none focus:ring-1 focus:ring-card-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? isRegistering
                    ? "Creando cuenta..."
                    : "Ingresando..."
                  : isRegistering
                    ? "Registrarme"
                    : "Entrar"}
              </button>
            </div>

            <p className="mt-2 text-center text-sm text-(--hestia-muted)">
              {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta?"}

              <button
                type="button"
                onClick={changeMode}
                disabled={loading}
                className="ml-1 font-semibold text-(--hestia-accent) cursor-pointer hover:underline disabled:opacity-60"
              >
                {isRegistering ? "Inicia sesión" : "Regístrate"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
