import { Component } from 'react'

/*
 * Keeps one broken piece from blanking a whole page. `fallback` renders in its place (null hides it);
 * without one the page shows a calm night screen with a way back. Errors still reach the console.
 * Keyed by `resetKey`, so moving to another page or letter tries again.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, key: props.resetKey }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  static getDerivedStateFromProps(props, state) {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null
  }

  componentDidCatch(error, info) {
    console.error('[while-youre-away]', this.props.name || 'page', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    if ('fallback' in this.props) return this.props.fallback
    return (
      <main className="eb" role="alert" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px 16px', background: '#050A19', color: '#E9ECF2', fontFamily: "'Schibsted Grotesk', system-ui, sans-serif", textAlign: 'center' }}>
        <div style={{ maxWidth: '26em' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#F4F1E6' }}>Something on this page didn’t load.</h1>
          <p style={{ margin: '12px 0 24px', fontSize: 17, lineHeight: 1.5, color: '#C9D0DC' }}>Your letters are safe. Try again, and if it keeps happening, write to hello@getwhileyouareaway.com.</p>
          <button type="button" onClick={() => window.location.reload()} style={{ minHeight: 48, padding: '0 24px', border: 0, borderRadius: 999, background: '#F0B341', color: '#141B2E', fontSize: 17, fontWeight: 600, cursor: 'pointer' }}>Try again</button>
        </div>
      </main>
    )
  }
}
