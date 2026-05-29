import { useNavigate } from 'react-router-dom'
import { clearDraft } from '../utils/storage'

export default function Landing() {
  const navigate = useNavigate()

  const handleStart = () => {
    clearDraft()
    navigate('/interview')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-6xl mb-6">📮</div>
      <h1 className="font-serif text-3xl text-rose-dark mb-3 leading-snug">
        Letters for the one who waits
      </h1>
      <p className="text-text-muted text-sm leading-relaxed mb-10 max-w-xs">
        Even far away, you can still be there.
        <br />
        Build a personalized letter box just for them.
      </p>

      <div className="flex gap-3 mb-10 overflow-x-auto pb-2 max-w-sm">
        {['Week 1 Letter ✉️', 'When you miss me 💛', 'Celebrate with me 🎉'].map((label) => (
          <div
            key={label}
            className="bg-white border border-warm-200 rounded-2xl px-4 py-3 text-sm whitespace-nowrap shadow-sm"
          >
            {label}
          </div>
        ))}
      </div>

      <button
        onClick={handleStart}
        className="bg-rose text-white px-10 py-4 rounded-2xl text-base font-medium active:scale-95 transition-transform"
      >
        Create your letter box
      </button>
      <p className="text-text-muted text-xs mt-4">
        Takes about 5 minutes · Progress is saved
      </p>
    </div>
  )
}
