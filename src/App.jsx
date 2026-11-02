import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { hydrateFromDB } from './utils/storage'
import Legal from './pages/Legal'
import Home from './pages/site/Home'
import Services from './pages/site/Services'
import About from './pages/site/About'
import Contact from './pages/site/Contact'
import Interview from './pages/Interview'
import Paywall from './pages/Paywall'
import AIInterview from './pages/AIInterview'
import AIGenerate from './pages/AIGenerate'
import Editor from './pages/Editor'
import Preview from './pages/Preview'
import Export from './pages/Export'
import AuthCallback from './pages/AuthCallback'
import Diary from './pages/Diary'
import Box from './pages/Box'

export default function App() {
  useEffect(() => {
    hydrateFromDB()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/paywall" element={<Paywall />} />
        <Route path="/ai-interview" element={<AIInterview />} />
        <Route path="/generate" element={<AIGenerate />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/b/:token" element={<Box />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/export" element={<Export />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/terms" element={<Legal doc="terms" />} />
        <Route path="/privacy" element={<Legal doc="privacy" />} />
        <Route path="/refunds" element={<Legal doc="refunds" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
