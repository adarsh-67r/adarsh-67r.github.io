import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { AnimatePresence, motion } from 'framer-motion'
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
const NotFound     = lazy(() => import('./pages/NotFound'))

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
      <div style={{ width: '20px', height: '20px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="spin" />
    </div>
  )
}

const pageVariants = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
  exit:     { opacity: 0, y: -6, transition: { duration: 0.18, ease: 'easeIn' } },
}

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <HelmetProvider>
      <ThemeProvider>
        <div className="grain" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
          <CursorGlow />
          <Navbar />
          <ScrollToTop />
          <main style={{ flex: 1 }}>
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/"            element={<PageWrapper><Home /></PageWrapper>} />
                  <Route path="/projects"    element={<PageWrapper><ProjectsPage /></PageWrapper>} />
                  <Route path="/posts"       element={<PageWrapper><PostsPage /></PageWrapper>} />
                  <Route path="/posts/:slug" element={<PageWrapper><PostPage /></PageWrapper>} />
                  <Route path="/contact"     element={<PageWrapper><ContactPage /></PageWrapper>} />
                  <Route path="*"            element={<PageWrapper><NotFound /></PageWrapper>} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </HelmetProvider>
  )
}
