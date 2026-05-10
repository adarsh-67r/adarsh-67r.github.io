import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CursorGlow from './components/CursorGlow'
import Home from './pages/Home'
import ProjectsPage from './pages/ProjectsPage'
import PostsPage from './pages/PostsPage'
import PostPage from './pages/PostPage'
import ContactPage from './pages/ContactPage'
import './index.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <div className="grain" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
          <CursorGlow />
          <Navbar />
          <ScrollToTop />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/"             element={<Home />} />
              <Route path="/projects"     element={<ProjectsPage />} />
              <Route path="/posts"        element={<PostsPage />} />
              <Route path="/posts/:slug"  element={<PostPage />} />
              <Route path="/contact"      element={<ContactPage />} />
              <Route path="/blog"         element={<PostsPage />} />
              <Route path="/blog/:slug"   element={<PostPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </HelmetProvider>
  )
}
