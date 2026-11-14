import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Clock3, GitBranch, Search, Sparkles } from 'lucide-react'
import type { Gesture, Pose } from './characterTypes'
import { posts } from './blogPosts'
import { profile } from './content'
import useMascotActivity from './useMascotActivity'
import './blog.css'

const Companion = lazy(() => import('./Companion'))
const categories = ['All', 'AI', 'Android', 'Open source', 'Workflow', 'SEO', 'SaaS'] as const
type Category = typeof categories[number]
type Post = (typeof posts)[number]
const appearance: Record<Exclude<Category, 'All'>, { cover: string; pose: Pose; reaction: string }> = {
  AI: { cover: 'ai', pose: 'think', reaction: 'Let’s look at how this AI system works.' },
  Android: { cover: 'android', pose: 'explore', reaction: 'Let’s see how this works on a real device.' },
  'Open source': { cover: 'open-source', pose: 'read', reaction: 'I’m checking the source before drawing a conclusion.' },
  SEO: { cover: 'seo', pose: 'explore', reaction: 'I’m checking what a crawler can see.' },
  SaaS: { cover: 'saas', pose: 'explain', reaction: 'The best place to start is the first useful action.' },
  Workflow: { cover: 'workflow', pose: 'read', reaction: 'Here’s where the tools fit, and where I check the work.' },
}
const urlFor = (post: Post) => `/blog/${post.slug}/`
const coverFor = (post: Post) => `/blog/${post.cover ?? appearance[post.category].cover}.svg`
const pageSize = 6
const formatDate = (date: string) => new Intl.DateTimeFormat('en', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
}).format(new Date(date))

function Author({ date }: { date?: string }) {
  return <div className="journal-author"><span className="journal-author-mark" aria-hidden="true">m✳</span><div><strong>{profile.name}</strong>{date && <time dateTime={date}>{formatDate(date)}</time>}</div></div>
}

function Card({ post }: { post: Post }) {
  return <article className="journal-card">
    <a className="journal-card-link" href={urlFor(post)}>
      <div className="journal-card-art"><img src={coverFor(post)} alt="" loading="lazy" width={600} height={400}/><span className="journal-card-arrow"><ArrowUpRight size={20}/></span></div>
      <div className="journal-card-copy">
        <div className="journal-meta"><span className="journal-tag">{post.category}</span><span>{post.readingTime}</span></div>
        <h3>{post.title}</h3><p>{post.excerpt}</p><Author date={post.date}/>
      </div>
    </a>
  </article>
}

function ArticleDiagram({ post }: { post: Post }) {
  const workflow = post.diagramType !== 'comparison'
  return <figure className={`journal-diagram ${workflow ? 'diagram-flow' : 'diagram-compare'} ${post.diagram.length > 3 ? 'diagram-stacked' : ''}`}>
    <figcaption><GitBranch size={17}/> {post.diagramTitle ?? 'The idea at a glance'}</figcaption>
    <ol>{post.diagram.map((step, i) => <li key={step.title}>
      <span className="journal-diagram-number">{String(i+1).padStart(2, '0')}</span>
      <strong>{step.title}</strong><span>{step.description}</span>
    </li>)}</ol>
    {post.diagramBranches && <div className="diagram-alternatives"><span>WHAT IF SOMETHING GOES WRONG?</span><ul>{post.diagramBranches.map(branch => <li key={branch.title}><strong>{branch.title}</strong><span>{branch.description}</span></li>)}</ul></div>}
  </figure>
}

export default function Blog() {
  const slug = location.pathname.split('/').filter(Boolean)[1]
  const post = posts.find(entry => entry.slug === slug)
  const missing = Boolean(slug && !post)
  const initialCategory = new URLSearchParams(location.search).get('topic')
  const [category, setCategory] = useState<Category>(() => categories.find(item => item === initialCategory) ?? 'All')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [gesture, setGesture] = useState<Gesture>({ pose: post?.cover === 'agent' ? 'explain' : post ? appearance[post.category].pose : 'wave', sequence: 0 })
  const [reaction, setReaction] = useState(post?.cover === 'agent' ? 'Follow the request from the form to the model and back.' : post ? appearance[post.category].reaction : 'Welcome to the journal. Pick a topic or open a story.')
  const [reduce, setReduce] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const { activity, wake } = useMascotActivity()
  const keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const matches = posts.filter(entry => (category === 'All' || entry.category === category) &&
    keywords.every(keyword => `${entry.title} ${entry.excerpt} ${entry.category} ${entry.sections.map(section => section.heading).join(' ')}`.toLowerCase().includes(keyword)))
  const featured = category === 'All' && !keywords.length ? posts[0] : undefined
  const cards = featured ? matches.filter(entry => entry.slug !== featured.slug) : matches
  const related = post ? posts.filter(entry => entry.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 3) : []

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduce(preference.matches)
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  function react(pose: Pose, message: string) {
    wake()
    setGesture(old => ({ pose, sequence: old.sequence + 1 }))
    setReaction(message)
  }

  function selectCategory(value: Category) {
    setCategory(value)
    setVisibleCount(pageSize)
    const url = new URL(location.href)
    if (value === 'All') url.searchParams.delete('topic')
    else url.searchParams.set('topic', value)
    history.replaceState(null, '', url)
    if (value === 'All') react('wave', 'Here’s everything on the workbench.')
    else react(appearance[value].pose, appearance[value].reaction)
  }

  return <div className="journal">
    <a className="skip-link" href="#journal-main">Skip to content</a>
    <header className="journal-header">
      <a className="journal-brand" href="/"><span className="journal-brand-mark" aria-hidden="true">m<span>✳</span></span><span><strong>{profile.name}</strong><small>Software engineer & curious human</small></span></a>
      <nav className="masthead-actions" aria-label="Main navigation">
        <a className="journal-home-link" href="/" aria-label="Back to portfolio"><ArrowLeft size={16}/> <span>Portfolio</span></a>
        <a className="pill contact-pill" href="/#contact">Have an idea? <ArrowUpRight size={18}/></a>
      </nav>
    </header>
    <main className="journal-main" id="journal-main">
      {post ? <>
        <div className="journal-breadcrumb"><a href="/blog/"><ArrowLeft size={16}/> All posts</a><span>/</span><a href={`/blog/?topic=${encodeURIComponent(post.category)}`}>{post.category}</a></div>
        <article className="journal-article">
          <header className="journal-article-head journal-in">
            <div className="journal-meta"><span className="journal-tag">{post.category}</span><span><Clock3 size={14}/> {post.readingTime}</span></div>
            <h1>{post.title}</h1><p>{post.excerpt}</p><Author date={post.date}/>
          </header>
          <div className="journal-article-cover journal-in"><img src={coverFor(post)} alt="" width={900} height={600}/></div>
          <div className="journal-reading-layout">
            <nav className="journal-toc" aria-label="On this page"><span>IN THIS ARTICLE</span>{post.sections.map((section, i) => <a key={section.heading} href={`#section-${i+1}`}>{section.heading}</a>)}</nav>
            <div className="journal-prose">
              {post.sections.map((section, index) => <section key={section.heading} id={`section-${index+1}`}>
                <h2>{section.heading}</h2>{section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                {index === 0 && <ArticleDiagram post={post}/>}
              </section>)}
              <aside className="journal-sources"><h2>Sources & further reading</h2><ul>{post.sources.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label} <ArrowUpRight size={15}/></a></li>)}</ul></aside>
            </div>
          </div>
        </article>
        <section className="journal-related" aria-labelledby="related-title"><div className="journal-list-heading"><h2 id="related-title">Keep reading</h2><a href="/blog/">View all <ArrowRight size={18}/></a></div><div className="journal-grid">{related.map(entry => <Card post={entry} key={entry.slug}/>)}</div></section>
      </> : missing ? <div className="journal-empty journal-in"><h1>That story isn’t here.</h1><p>There’s more to explore in the journal.</p><a href="/blog/" className="journal-primary"><ArrowLeft size={17}/> All posts</a></div> : <>
        <section className="journal-intro journal-in">
          <div><p className="journal-kicker"><span/> THE JOURNAL / VOL. 01</p><h1>Field notes<span>.</span></h1><p className="journal-deck">What I’m building, what I’m learning, and what I’d try differently next time.</p></div>
          <div className="journal-intro-index" aria-hidden="true"><Sparkles size={42}/><span>{String(posts.length).padStart(2, '0')} ENTRIES</span></div>
        </section>
        <div className="journal-controls">
          <div className="journal-filters" role="group" aria-label="Filter articles by topic">{categories.map(item => <button key={item} aria-pressed={item === category} onClick={() => selectCategory(item)}>{item}</button>)}</div>
          <label className="journal-search"><Search size={18}/><input type="search" value={query} onChange={e => { setQuery(e.target.value); setVisibleCount(pageSize) }} placeholder="Search articles" aria-label="Search articles"/></label>
        </div>
        {featured && <article className="journal-feature journal-in">
          <div className="journal-feature-copy"><div className="journal-meta"><span className="journal-tag">{featured.category}</span><span>FEATURED</span><span>{featured.readingTime}</span></div><h2><a href={urlFor(featured)}>{featured.title}</a></h2><p>{featured.excerpt}</p>
            <a className="journal-primary" href={urlFor(featured)}>Read the article <ArrowDownRight size={19}/></a>
          </div>
          <a className="journal-feature-art" href={urlFor(featured)} aria-label={`Read: ${featured.title}`}><img src={coverFor(featured)} alt="" width={900} height={600}/><span className="journal-feature-index" aria-hidden="true">FIG. 01</span></a>
        </article>}
        <section className="journal-list" aria-labelledby="journal-list-title">
          <div className="journal-list-heading"><h2 id="journal-list-title">{featured ? 'More from the journal' : category === 'All' ? 'All articles' : category}</h2><span role="status">{matches.length} {matches.length === 1 ? 'article' : 'articles'}</span></div>
          {cards.length ? <>
            <div className="journal-grid" key={`${category}-${Boolean(keywords.length)}`}>{cards.slice(0, visibleCount).map(entry => <Card post={entry} key={entry.slug}/>)}</div>
            {visibleCount < cards.length && <div className="journal-load-more"><button className="journal-primary" onClick={() => setVisibleCount(count => count + pageSize)}>More articles <ArrowDown size={17}/></button></div>}
          </> : <div className="journal-empty"><Search size={27}/><h3>No articles found</h3><p>Try a different search, or clear the filters.</p><button onClick={() => { setQuery(''); selectCategory('All') }}>Clear filters <ArrowRight size={16}/></button></div>}
        </section>
      </>}
    </main>
    <footer className="journal-footer"><span>© {new Date().getFullYear()} {profile.name}</span><a href="/">Back to the portfolio <ArrowUpRight size={16}/></a><a href="#journal-main">Back to top <ArrowDown size={16} className="journal-up"/></a></footer>
    <aside className="journal-guide" aria-label="Journal companion">
      <p className="journal-guide-message" aria-live="polite">{activity === 'asleep' ? 'Taking a quick nap. Tap to wake me.' : reaction}</p>
      <div className="journal-guide-window">
        <Suspense fallback={<img src="/avatar-poster.svg" alt="Portfolio avatar"/>}><Companion gesture={gesture} talking={false} reduced={reduce} closeup activity={activity} onWake={wake} onTap={() => react('wave','Hey! Enjoy the read.')} /></Suspense>
      </div>
      <button className="journal-guide-button" type="button" aria-label="Greet the journal avatar" onClick={() => react('wave','Hey! Enjoy the read.')}><BookOpen size={16}/></button>
    </aside>
  </div>
}
