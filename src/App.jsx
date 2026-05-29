import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Interview from './pages/Interview'
import Paywall from './pages/Paywall'
import AIInterview from './pages/AIInterview'
import AIGenerate from './pages/AIGenerate'
import Editor from './pages/Editor'
import Preview from './pages/Preview'
import Export from './pages/Export'

export default function App() {
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
