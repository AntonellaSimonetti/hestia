import { Routes, Route } from "react-router";
import Header from "./components/layout/Header";
import Footer from "./components/layout/footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AboutUsPage from "./pages/AboutUsPage";
import LoginPage from "./pages/LoginPage";
import PerfilPage from "./pages/PerfilPage";
import Despensa from "./pages/Despensa";
import RecetasPage from "./pages/RecetasPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import ColeccionesPage from "./pages/ColeccionesPage";


function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1">
        {children}
      </div>

      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        }
      />

      <Route
        path="/sobre-nosotros"
        element={
          <PublicLayout>
            <AboutUsPage />
          </PublicLayout>
        }
      />

      <Route
        path="/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
              <PerfilPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/despensa"
        element={
          <ProtectedRoute>
              <Despensa />
          </ProtectedRoute>
        }
      />

      <Route
        path="/colecciones"
        element={
          <ProtectedRoute>
              <ColeccionesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recetas"
        element={
            <RecetasPage />
        }
      />

      <Route
        path="/recetas/:id"
        element={
            <RecipeDetailPage />
        }
      />
    </Routes>
  )
}

export default App;
