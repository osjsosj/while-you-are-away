import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { hydrateFromDB } from './utils/storage'
import Landing from './pages/Landing'
import Interview from './pages/Interview'
import Paywall from './pages/Paywall'
import AIInterview from './pages/AIInterview'
import AIGenerate from './pages/AIGenerate'
import Editor from './pages/Editor'
import Preview from './pages/Preview'
import Export from './pages/Export'
import AuthCallback from './pages/AuthCallback'

export default function App() {
  useEffect(() => {
    hydrateFromDB()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/paywall" element={<Paywall />} />
        <Route path="/ai-interview" element={<AIInterview />} />
        <Route path="/generate" element={<AIGenerate />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/export" element={<Export />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
