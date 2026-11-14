import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { posts, type BlogPost } from './src/blogPosts'
import { profile } from './src/content'

const siteOrigin = 'https://mohit-playground.shrivastavamohit221.chatgpt.site'
const fallbackStyle = `<noscript><style>
  html { background: #f4f3e9; }
  .blog-fallback { max-width: 48rem; margin: 0 auto; padding: 2rem 1.25rem; color: #1b2130; line-height: 1.6; }
  .blog-fallback h1, .blog-fallback h2, .blog-fallback p { margin: 1rem 0; }
  .blog-fallback a { color: #2146c4; text-decoration: underline; }
</style></noscript>`

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function blogFallback(post?: BlogPost) {
  if (!post) {
    const articles = posts.map(item => (
      `<li><a href="/blog/${item.slug}/">${escapeHtml(item.title)}</a><p>${escapeHtml(item.excerpt)}</p></li>`
    )).join('')
    return `<main class="blog-fallback"><h1>Blog</h1><p>Articles by ${escapeHtml(profile.name)}</p><ul>${articles}</ul><a href="/">Back to portfolio</a></main>`
  }

  const sections = post.sections.map(section => (
    `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`
  )).join('')
  const diagram = post.diagram.map(step => (
    `<li><strong>${escapeHtml(step.title)}</strong><p>${escapeHtml(step.description)}</p></li>`
  )).join('')
  const sources = post.sources.filter(source => /^https?:\/\//i.test(source.href)).map(source => (
    `<li><a href="${escapeHtml(source.href)}">${escapeHtml(source.label)}</a></li>`
  )).join('')

  return `<main class="blog-fallback"><a href="/blog/">All articles</a><article><h1>${escapeHtml(post.title)}</h1><p>By ${escapeHtml(profile.name)}</p><p>${escapeHtml(post.excerpt)}</p>${sections}<h2>Steps at a glance</h2><ol>${diagram}</ol><h2>Sources</h2><ul>${sources}</ul></article></main>`
}

function blogPages(): Plugin {
  return {
    name: 'blog-pages',
    apply: 'build',
    generateBundle: {
      // Reuse Vite's completed HTML so every entry points to the current hashed files.
      order: 'post',
      handler(_, bundle) {
        const index = bundle['index.html']
        if (index?.type !== 'asset' || typeof index.source !== 'string') {
          this.error('Vite did not generate the portfolio HTML entry.')
        }

        const shell = index.source
          .replace(/    <title>[^<]*<\/title>\r?\n/, '')
          .replace(/    <meta (?:name="description"|property="og:[^"]+")[^>]*>\r?\n/g, '')
        const { name: author } = profile
        const routes = new Set(['/blog/'])
        const pages: { path: string; title: string; description: string; post?: BlogPost }[] = [{
          path: '/blog/',
          title: `Blog | ${author}`,
          description: `Articles by ${author} on AI, technical SEO, SaaS, and tools for building software.`,
        }]

        for (const post of posts) {
          const path = `/blog/${post.slug}/`
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || routes.has(path)) {
            this.error(`Invalid or duplicate blog slug: ${post.slug}`)
          }
          routes.add(path)
          pages.push({ path, title: `${post.title} | ${author}`, description: post.excerpt, post })
        }

        for (const page of pages) {
          const url = `${siteOrigin}${page.path}`
          const metadata = [
            `<title>${escapeHtml(page.title)}</title>`,
            `<meta name="description" content="${escapeHtml(page.description)}" />`,
            `<meta name="author" content="${escapeHtml(author)}" />`,
            `<link rel="canonical" href="${url}" />`,
            `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
            `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
            `<meta property="og:type" content="${page.post ? 'article' : 'website'}" />`,
            `<meta property="og:url" content="${url}" />`,
            ...(page.post ? [`<meta property="article:published_time" content="${escapeHtml(page.post.date)}" />`] : []),
          ].join('\n    ')
          this.emitFile({
            type: 'asset',
            fileName: `${page.path.slice(1)}index.html`,
            source: shell
              .replace('</head>', () => `  ${metadata}\n  ${fallbackStyle}\n  </head>`)
              .replace('</body>', () => `<noscript>${blogFallback(page.post)}</noscript></body>`),
          })
        }
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), blogPages()],
  build: { rollupOptions: { output: { manualChunks: { three: ['three'], motion: ['gsap'] } } } },
})
