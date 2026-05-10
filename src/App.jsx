import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CursorGlow from './components/CursorGlow'
import Home from './pages/Home'
import './index.css'

const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const PostsPage    = lazy(() => import('./pages/PostsPage'))
const PostPage     = lazy(() => import('./pages/PostPage'))
const ContactPage  = lazy(() => import('./pages/ContactPage'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
    </div>
  )
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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"            element={<Home />} />
                <Route path="/projects"    element={<ProjectsPage />} />
                <Route path="/posts"       element={<PostsPage />} />
                <Route path="/posts/:slug" element={<PostPage />} />
                <Route path="/contact"     element={<ContactPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </HelmetProvider>
  )
}
