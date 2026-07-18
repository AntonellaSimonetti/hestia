import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/footer'
import HomePage from './pages/HomePage'
import AboutUsPage from './pages/AboutUsPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sobre-nosotros" element={<AboutUsPage />} />
          <Route path="/perfil" element={<LoginPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}

export default App;