import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './experience.css'

const Blog = React.lazy(() => import('./Blog'))
const onBlog = /^\/blog(?:\/|$)/.test(location.pathname)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {onBlog ? <React.Suspense fallback={<div className="journal-loading">Opening the journal…</div>}><Blog /></React.Suspense> : <App />}
  </React.StrictMode>,
)
