import { agentPost } from './blogAgentPost'
import { androidPosts } from './blogAndroidPosts'
import { researchPosts } from './blogResearchPosts'
import { workflowPosts } from './blogWorkflowPosts'

export type BlogCategory = 'AI' | 'SEO' | 'SaaS' | 'Workflow' | 'Android' | 'Open source'

export interface BlogPost {
  slug: string
  category: BlogCategory
  title: string
  excerpt: string
  readingTime: string
  date: string
  sections: { heading: string; paragraphs: string[] }[]
  sources: { label: string; href: string }[]
  cover?: string
  diagramTitle?: string
  diagramType?: 'workflow' | 'comparison'
  diagramBranches?: { title: string; description: string }[]
  diagram: { title: string; description: string }[]
}

const originalPosts: BlogPost[] = [
  {
    "slug": "read-ai-coding-benchmarks",
    "category": "AI",
    "title": "What the latest AI coding benchmarks actually measure",
    "excerpt": "A November 2026 look at coding-agent results, and how I’d turn a leaderboard into an evaluation for my own repository.",
    "readingTime": "3 min read",
    "date": "2026-11-14",
    "sections": [
      {
        "heading": "A patch has to survive review",
        "paragraphs": [
          "Imagine an agent that adds a new settings screen, makes the demo look great, and forgets to handle a signed-out visitor. A screenshot would score it well. A maintainer might send the patch straight back. That gap explains why tougher coding evaluations ask agents to work in repositories and judge the resulting change.",
          "Artificial Analysis’s October 2026 index added FrontierCode 2.0, a private set of 132 tasks from real open-source repositories. Its implementation, FrontierCode-AA 2.0, runs each task three times in the same agent harness. The verifier combines tests with a review rubric. A failed blocking check zeroes the attempt, while passing attempts can receive partial credit."
        ]
      },
      {
        "heading": "What stood out in the November results",
        "paragraphs": [
          "In the results I checked on November 14, Artificial Analysis reported 49.1% for Claude Fable 5.2 with High reasoning and the default fallback, 48.8% with Max, and 47.6% with Xhigh. Those are mean rubric scores under the publisher’s setup. They do not represent the percentage of repositories the model can maintain, or even a count of fully correct patches.",
          "The ordering is a useful reminder to measure the configuration you would actually use. The small gaps between these scores alone do not establish a reliable advantage for one reasoning level. A different task mix, tool environment, or time budget could change the comparison.",
          "Benchmark selection matters too. OpenAI announced in February 2026 that it was dropping SWE-bench Verified for frontier evaluations after finding issues with some tests and evidence of exposure to benchmark material. That is OpenAI’s assessment of that evaluation. For me, the practical response is to keep the benchmark version, scoring rules, and date beside any quoted result."
        ]
      },
      {
        "heading": "Build a small evaluation for your own project",
        "paragraphs": [
          "Choose a handful of changes from your backlog. I’d include an interaction fix, a feature that spans two modules, and a first-load or error-state problem. Write the acceptance check before the model starts. For an article page, I’d check navigation from the index, a direct link opened in a fresh tab, and the Back button after reading.",
          "Give each trial the same starting commit, instructions, time, and allowed tools. Record whether the intended behavior works, how much review and rework it takes, and the cost of a complete attempt. Keep a few tasks held back so you can rerun the comparison after changing your prompts or tools.",
          "I would use public scores to pick candidates, then decide from the changes I can reproduce and review. For a small team, the difference between a tidy patch and a week of cleanup can matter more than a few points on a leaderboard."
        ]
      }
    ],
    "sources": [
      {
        "label": "Artificial Analysis · FrontierCode-AA 2.0 results",
        "href": "https://artificialanalysis.ai/evaluations/frontiercode-2-0"
      },
      {
        "label": "Artificial Analysis · October 2026 Intelligence Index update",
        "href": "https://artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v5"
      },
      {
        "label": "OpenAI · Assessment of SWE-bench Verified",
        "href": "https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/"
      }
    ],
    "diagram": [
      {
        "title": "Choose comparable tasks",
        "description": "Use the same repository, starting commit, tools, and time budget."
      },
      {
        "title": "Define a passing change",
        "description": "Run behavior checks and review the diff against written criteria."
      },
      {
        "title": "Measure the whole attempt",
        "description": "Record success, review time, and cost per usable patch."
      }
    ]
  },
  {
    "slug": "technical-seo-for-interactive-sites",
    "category": "SEO",
    "title": "Technical SEO for interactive sites",
    "excerpt": "Give each page a useful URL, readable content, and a clear path from discovery to measurement.",
    "readingTime": "3 min read",
    "date": "2026-11-14",
    "sections": [
      {
        "heading": "Give each useful page an address",
        "paragraphs": [
          "Interactive sites often have useful details tucked into a drawer, animation, or canvas. Think about a project walkthrough. If someone wants to send a friend one explanation, can they copy its URL, reopen it, and land on the intended page? That test is a good starting point for designing the public pages of a site.",
          "Give each article or project that stands on its own a stable path and a descriptive link from an index. Google Search Central recommends real anchor links with href attributes and advises JavaScript apps against using fragments to swap between separate pages. A fragment can still take a reader to a heading inside one page.",
          "Loading a page directly should work without relying on state from a previous click. Return a proper missing-page response for unknown article URLs where the host supports it, and make sure Back and Forward behave as readers expect."
        ]
      },
      {
        "heading": "Make the article readable before the animation",
        "paragraphs": [
          "Put the title, summary, paragraphs, and destinations in HTML. Treat a canvas illustration as a companion to that content. If it explains an important relationship, add a caption or nearby text that states the relationship clearly. Label informative images with alternative text and let intrinsic dimensions reserve their space as they load.",
          "For public articles, useful metadata includes a title and description unique to the page. If you use Article structured data, keep the author, dates, and image consistent with what the page displays. Pre-rendering a public article is also useful when it lets the page deliver readable content before the JavaScript finishes.",
          "Check the rendered page as well as the source. A crawler queues JavaScript pages for rendering, and a dependency that fails or is blocked can leave it with very little text. A quick test is to open the URL directly on a cold connection and verify the headings, internal links, and article image."
        ]
      },
      {
        "heading": "Measure whether people find what they came for",
        "paragraphs": [
          "For a public site, check a representative URL in Search Console after release. Look for whether it can be fetched and indexed, then compare the queries and landing pages that receive impressions. A page whose title promises a guide should answer that question early, before asking readers to play a demo or scroll through an introduction.",
          "Google’s current guidance for its generative search features still builds on ordinary crawl and indexing behavior. I’d spend time on specific examples, descriptive links, and accurate page titles before adding new search-specific files. Those improvements also help readers share and revisit the page.",
          "For a private preview, check the page experience and metadata while it is signed in. Indexing is a separate decision about which pages should be publicly accessible. Revisit that decision when you’re ready for search traffic."
        ]
      }
    ],
    "sources": [
      {
        "label": "Google Search Central · JavaScript SEO basics",
        "href": "https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics"
      },
      {
        "label": "Google Search Central · SEO Starter Guide",
        "href": "https://developers.google.com/search/docs/fundamentals/seo-starter-guide"
      },
      {
        "label": "Google Search Central · Article structured data",
        "href": "https://developers.google.com/search/docs/appearance/structured-data/article"
      },
      {
        "label": "Google Search Central · Guidance for generative search features",
        "href": "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide"
      }
    ],
    "diagram": [
      {
        "title": "Discover",
        "description": "Link to a stable URL from the article index."
      },
      {
        "title": "Render",
        "description": "Put the article, headings, links, and captions in readable HTML."
      },
      {
        "title": "Inspect",
        "description": "Check the delivered page, indexing, and queries after launch."
      }
    ]
  },
  {
    "slug": "qubitlab-as-a-product",
    "category": "SaaS",
    "title": "QubitLab and the smallest useful learning loop",
    "excerpt": "A product design case study on making quantum concepts tangible through an action, visible feedback, and a next step.",
    "readingTime": "3 min read",
    "date": "2026-11-14",
    "sections": [
      {
        "heading": "Start with a single gate",
        "paragraphs": [
          "Quantum computing can feel abstract when you meet it as a page of equations. QubitLab offers a different starting point. A learner can build a circuit, apply a gate, and explore the resulting state. The portfolio walkthrough distills that idea into three choices on a fresh qubit.",
          "Try the X gate starting from zero. The visible result changes to one, so the learner has a concrete relationship to explain. Then try Hadamard. Now measuring can produce either result with equal probability. That gives the learner a reason to ask where the probabilities came from, and a small experiment to repeat while reading the explanation."
        ]
      },
      {
        "heading": "Give calculation, visualization, and explanation distinct jobs",
        "paragraphs": [
          "The project combines a Next.js interface with a FastAPI backend. Its repository describes a simulator that can run in the browser, server-side simulation using Qiskit Aer, and a Three.js visualization of the Bloch sphere. It also documents a separate AI tutor. The structure lets the project pair a visual state with an explanation while keeping circuit computation distinct from generated language.",
          "That separation is useful in other software products too. A tutor can answer the same question in several ways. The learner should still be able to inspect a consistent numerical result for the same circuit. I’d keep the current circuit and simulation result visible beside any explanation so a learner can compare what they read with what the application calculated.",
          "An early product decision is where to spend time when something fails. If a learning tool needs a remote service, I’d make the loading state explicit and keep the learner’s current circuit visible. When a service returns an error, a retry should preserve the circuit rather than make someone rebuild it."
        ]
      },
      {
        "heading": "Measure whether a learner completes the loop",
        "paragraphs": [
          "An educational SaaS team could track how many new learners run an experiment, inspect the result, and try a second gate. A signup by itself says little about whether the product helped someone understand quantum state. Repeating a meaningful action is a better question to investigate.",
          "I’d start with one observation session. Ask someone to change the circuit, then explain in their own words what they expected and what actually happened. Watch where they pause. A hard-to-find gate, an unclear label, and a confusing concept call for three different fixes.",
          "That is the product question I’d carry into the next iteration. How quickly can a learner make a prediction, test it, and understand the result well enough to make another prediction?"
        ]
      }
    ],
    "sources": [
      {
        "label": "QubitLab · Source code and architecture",
        "href": "https://github.com/Grayking1905/qubit-lab"
      },
      {
        "label": "QubitLab · Open the project",
        "href": "https://qubit-lab-gules.vercel.app/"
      }
    ],
    "diagram": [
      {
        "title": "Build a circuit",
        "description": "Start with a fresh qubit and add a gate."
      },
      {
        "title": "Inspect the result",
        "description": "Compare the state visualization and the measurement probabilities."
      },
      {
        "title": "Try a variation",
        "description": "Use the explanation to predict what a different gate will change."
      }
    ]
  },
]

export const posts = [agentPost, ...originalPosts, ...researchPosts, ...androidPosts, ...workflowPosts]
