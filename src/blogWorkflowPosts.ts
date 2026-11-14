import type { BlogPost } from './blogPosts'

export const workflowPosts: BlogPost[] = [
  {
    slug: 'understanding-javascript-builds-with-rea',
    category: 'Open source',
    title: 'How I’d use REA to understand an older JavaScript build',
    excerpt: 'A practical way to start from one visible behavior, follow the evidence in an artifact you control, and turn it into a check a teammate can reproduce.',
    readingTime: '4 min read',
    date: '2026-11-14',
    diagramTitle: 'Trace a feature from question to verified behavior',
    diagramType: 'workflow',
    diagram: [
      { title: 'Pick a behavior', description: 'Write down the action, expected result, and the exact artifact that exhibits it.' },
      { title: 'Inspect the artifact', description: 'Use the JavaScript analyzer on the local build and check which files it examined.' },
      { title: 'Trace one path', description: 'Start from a route or string, and record the module references and their source locations.' },
      { title: 'Check the result', description: 'Compare the finding with the source or a controlled run of your own app.' },
      { title: 'Share the evidence', description: 'Keep the shortest useful trace, its limitations, and one reproducible check.' },
    ],
    sections: [
      {
        heading: 'Start with the question a teammate needs answered',
        paragraphs: [
          'Suppose our team inherits an older build of an internal notes app. The search box gives a result even while the notes view is loading, and a teammate needs to know which part of the application owns that behavior before changing the UI. I’d start with a small question. Where does the query go when the visitor types in the box, and what actually decides whether the empty state appears?',
          'The most reliable starting point is the matching source checkout. When the exact old build is easier to locate than the matching commit, an artifact inspection can narrow the search. REA, the open source project maintained at morluto/rea, documents a static JavaScript and Electron analyzer that reports module relationships and their supporting evidence. Its terminal and Model Context Protocol interfaces provide ways to use those results directly or through a compatible coding assistant.',
        ],
      },
      {
        heading: 'Record the build and start with a narrow input',
        paragraphs: [
          'Use a local artifact from an application you own or have permission to inspect. Record its version or commit and the directory supplied to the analyzer. If a source map is available for that exact build, retain it alongside the artifact. The map can help tie a bundled position back to source, and the recorded identity lets someone else repeat the analysis later.',
          'REA documents a JavaScript application analysis workflow for a local app directory or an Electron archive. The static workflow reads the files supplied to it. Tool setup and supported inputs can change between releases, so check the repository’s installation and workflow docs for the version you’re running. Start with the relevant files if you already have a good lead, then expand the input when the trace reaches an omitted module.',
        ],
      },
      {
        heading: 'Follow one trace and check what supports it',
        paragraphs: [
          'Look for a literal you can tie to the feature, such as the empty-state message, a route name, or a module the matching source identifies. REA’s documented JavaScript feature tracing supports those kinds of starting points. Begin with the returned matches and follow the few relationships that could answer the question. For every important relationship, keep the file or source range that supports it.',
          'A trace might show that an entry module references a search module. That establishes a useful place to inspect. To determine when the user sees results, read the branch that sets the visible state and compare it with the displayed behavior. A feature may have a second implementation behind a build flag, or it may load another chunk later. Check coverage before drawing conclusions from an empty result.',
          'If the first pass generates a large graph, keep the original result and narrow the next view to the modules or relationships under discussion. REA documents filtered views over retained evidence. Record which view you used so a teammate can reproduce the same slice and still access the surrounding context when they need it.',
        ],
      },
      {
        heading: 'Use a controlled run to check the missing pieces',
        paragraphs: [
          'On the notes app, I’d use a small set of fixture notes and write down three observable cases. A matching query should display a result. An unmatched query should show the empty state. A refresh should produce the loading state before the final result. Reproduce those cases with the matching source or a local copy of the app configured for test data.',
          'The combined record separates what the artifact shows from what the app actually does. If the trace leads to a local filter and the test confirms matches appear before a fresh request completes, the next teammate has a plausible place to make the change and a behavior to preserve. If two code paths remain possible, write down the deciding condition or mark it as unresolved.',
        ],
      },
      {
        heading: 'Keep the part another developer can reuse',
        paragraphs: [
          'A useful handoff fits in a short issue comment or migration note. Record the build identity, the question, the source location that supports the finding, and the local behavior check. Link the full analysis when the team needs to inspect it. A concise handoff makes it easier to revisit a conclusion after a build changes.',
          'For a UI rewrite, turn the verified behavior into an acceptance check. The new search view can have a different layout and still pass when it handles loading, matches, and empty results correctly. That turns a one-time inspection into evidence the team can use during the next refactor.',
        ],
      },
    ],
    sources: [
      { label: 'morluto/rea · Open source repository and supported workflows', href: 'https://github.com/morluto/rea' },
      { label: 'REA · JavaScript application analysis and evidence coverage', href: 'https://github.com/morluto/rea/blob/main/docs/guides/javascript/javascript-application-workflows.md' },
      { label: 'REA · CLI and evidence guide', href: 'https://github.com/morluto/rea/blob/main/docs/getting-started/cli.md' },
    ],
  },
  {
    slug: 'efficient-codex-claude-code-workflows',
    category: 'Workflow',
    title: 'A practical workflow for Codex, Claude Code, and other coding agents',
    excerpt: 'Give the agent a clear outcome, a small set of relevant files, and a check it can run before asking you to review the patch.',
    readingTime: '4 min read',
    date: '2026-11-14',
    diagramTitle: 'From a task brief to a reviewable patch',
    diagramType: 'workflow',
    diagram: [
      { title: 'Define the behavior', description: 'Name the user action, expected outcome, and behavior the change must preserve.' },
      { title: 'Set the scope', description: 'Point to the relevant modules, document the check, and limit writes to the task workspace.' },
      { title: 'Inspect and edit', description: 'Trace callers first, then implement a patch that fits the existing design.' },
      { title: 'Run the checks', description: 'Start with the focused regression, then run the applicable build or test suite.' },
      { title: 'Review the handoff', description: 'Read the diff and results, reproduce key behavior, and decide whether to merge.' },
    ],
    sections: [
      {
        heading: 'Describe what success looks like in the product',
        paragraphs: [
          'A task such as “fix the filters” leaves several decisions open. Say what the person does, what they see, and which existing behavior they rely on. A useful brief for a blog could be “When I open a post from a filtered list and press Back, restore the selected topic and search text. A fresh visit to the journal should start at All. Keep direct article links working.” That gives a maintainer and an agent the same acceptance criteria.',
          'Give the agent a starting point if you know it. A route component, an existing test, or a browser reproduction can save a long scan of unrelated folders. Add the expected check in the same message. In this example, ask it to verify both returning from an article and opening one directly in a fresh tab. The pair covers the behavior being changed and a behavior that must keep working.',
        ],
      },
      {
        heading: 'Keep repository instructions close to the code',
        paragraphs: [
          'Put stable facts such as package manager commands, relevant architectural boundaries, and review expectations in a short repository instruction file. Codex documents project guidance via AGENTS.md. Claude Code documents CLAUDE.md and how it can also load shared AGENTS.md guidance depending on its project configuration. Gemini CLI documents its own GEMINI.md context mechanism. Check how the installed client loads those files before relying on them.',
          'When the team uses several tools, keep one common source for the build and test instructions, and use each client’s documented way to load it. Keep the task-specific criteria in the issue. If a feature proposal changes tomorrow, updating one issue should suffice. If the test command changes, update the shared instructions and make sure it runs from the repository root.',
        ],
      },
      {
        heading: 'Use permissions that fit the task',
        paragraphs: [
          'A repository review can begin with read access and a clear output such as the files involved, the likely cause, and the next check. A coding task needs write access to the intended workspace and the ability to run local validation. Configure those boundaries through the chosen client’s controls. A repository note can name sensitive paths and explain procedures, and the permission configuration can enforce the actual access limits.',
          'Keep production tokens, broad connector access, and credentials out of the task environment when local development can proceed with fixtures. If a check requires a staging service, identify the exact operation and use suitably scoped access. When two agents must edit in parallel, Git worktrees can supply separate checkouts. Assign each a distinct concern so neither is rewriting the same files or test expectations.',
        ],
      },
      {
        heading: 'Give each pass a concrete output',
        paragraphs: [
          'For a change with several callers, ask the agent to trace the current behavior and identify the affected boundaries before coding. Then have it implement a narrow patch and run the smallest check that exercises the bug. Once that passes, run the applicable build and neighboring tests. A focused failure gives the agent a useful correction early in the session.',
          'If the diff or assumptions drift, steer with the actual failure. “The Back button still resets the topic when an article was opened from search” gives more direction than “keep trying.” For a handoff to another agent, provide the current diff, available test output, and remaining behavior to check. This keeps the next pass grounded in the working tree.',
          'When comparing whether a workflow saves time, include the minutes you spend reproducing bugs and reviewing the diff. A longer agent run can be worthwhile if the resulting patch takes less rework. Start with a handful of familiar tasks and measure how long it takes to get each one ready to merge.',
        ],
      },
      {
        heading: 'Review evidence before accepting the result',
        paragraphs: [
          'Ask for the changed files, the exact checks that ran, and any scenario still unverified. Run the central behavior once yourself when it affects a visible flow. For the filter example, choose a topic, open a post, press Back, and check the topic and search state. Then open the article URL directly.',
          'A reviewer can work from the brief and diff when a change needs another look. Have the reviewer prioritize missing requirements, regressions, and tests whose assertions would pass on a broken patch. Record the finding and fix in the same issue so the team can see what justified the final change.',
        ],
      },
    ],
    sources: [
      { label: 'OpenAI · Repository instructions with AGENTS.md', href: 'https://learn.chatgpt.com/docs/agent-configuration/agents-md' },
      { label: 'OpenAI · How the Codex agent loop uses sandbox permissions', href: 'https://openai.com/index/unrolling-the-codex-agent-loop/' },
      { label: 'Anthropic · Claude Code best practices', href: 'https://code.claude.com/docs/en/best-practices' },
      { label: 'Anthropic · Project instructions and memory', href: 'https://code.claude.com/docs/en/memory' },
      { label: 'Anthropic · Claude Code permissions', href: 'https://code.claude.com/docs/en/permissions' },
      { label: 'Gemini CLI · Project context with GEMINI.md', href: 'https://geminicli.com/docs/cli/gemini-md/' },
      { label: 'Git · Worktree reference', href: 'https://git-scm.com/docs/git-worktree' },
    ],
  },
  {
    slug: 'reusable-checks-for-agent-written-patches',
    category: 'Workflow',
    title: 'Reusable checks for reviewing agent-written patches',
    excerpt: 'A small verification harness that gives maintainers the same evidence regardless of which coding tool produced a change.',
    readingTime: '4 min read',
    date: '2026-11-14',
    diagramTitle: 'A repeatable review loop for changes',
    diagramType: 'workflow',
    diagram: [
      { title: 'Write a fixture', description: 'Capture an expected behavior and use controlled input that another reviewer can reproduce.' },
      { title: 'Run on the baseline', description: 'Confirm the check detects the original bug and that existing behavior passes.' },
      { title: 'Verify the patch', description: 'Run the same check on the proposed revision and capture exit status and test artifacts.' },
      { title: 'Review the evidence', description: 'Inspect any skipped, flaky, or blocked checks and read the diff against the issue.' },
      { title: 'Keep the check in CI', description: 'Run the versioned command on future changes and require its result where appropriate.' },
    ],
    sections: [
      {
        heading: 'Pick one failure a test can actually detect',
        paragraphs: [
          'Imagine an agent removes an outdated blog post, but the old title still appears in the static output because the build retained a generated page. Clicking around the new index might miss the leftover page. A small verification harness can catch that specific failure by building the site in a clean directory, inspecting the generated content, and opening the affected URLs.',
          'Write the behavior in observable terms. The removed post is absent from the index and related articles. Its former URL displays a clear missing-article response or the redirect the team chose. A valid article still opens through the index and by direct URL. Keep each assertion tied to a reader action or a build artifact whose presence matters.',
        ],
      },
      {
        heading: 'Prove the check can fail',
        paragraphs: [
          'Add the check to the starting revision and run it before changing the implementation. A regression check should fail at the condition that describes the bug. If the build fails earlier, fix the test environment before treating the result as evidence. If the baseline already passes, check whether the reproduction uses the right input and reaches the same code path.',
          'For a post removal, use a clean temporary output directory and test a known existing post as a control. Verify that the crawler or browser found the actual page content before inspecting it for the deleted title. A check that simply searches an empty output folder would give the same answer for every revision.',
        ],
      },
      {
        heading: 'Run the same commands independently of the agent',
        paragraphs: [
          'Keep the verification entry point in the repository so a teammate or CI runner can launch it without the agent’s session. Define how fixture data is loaded, what server or build command starts the app, and where results go. Test on synthetic data and with local services or test endpoints. Keep production credentials outside the environment that runs proposed changes.',
          'Use the suite already present in the project where possible. A fast test can inspect route metadata or the generated listing. A focused browser check can navigate, wait for visible content, and verify direct links. Keep the suite reproducible by pinning dependencies in the lockfile and controlling inputs such as time and seed data where the behavior depends on them.',
        ],
      },
      {
        heading: 'Keep failure data that explains what happened',
        paragraphs: [
          'Attach the command, revision, status, and the smallest useful failure artifact. For a browser test, the URL and failing assertion may be enough. A trace or screenshot helps when timing or navigation is involved. Playwright distinguishes a first-pass result from a test that fails and then passes on retry. Preserve that distinction when reporting the run.',
          'Make skipped checks visible. A missing dependency, expired fixture, or offline staging service gives the reviewer a different decision from a confirmed behavior failure. When only a few checks are blocked, record which ones and why. Strip credentials and private fixture data from the logs before saving or sharing them.',
          'For recurring checks, I’d save a compact result with a revision identifier, a status for each named assertion, and paths to the relevant artifacts. That makes it possible to compare a local run with CI even when their console output differs. Keep the original failure details when a retry succeeds, especially in browser checks that depend on navigation or asynchronous state.',
        ],
      },
      {
        heading: 'Make passing checks part of the review',
        paragraphs: [
          'A maintainer should still inspect the diff for changes outside the task and for assertions that stopped covering the behavior. For the blog example, check that the patch removes the source entry, that the site builds from a clean revision, and that unrelated posts keep their working URLs. The tests and the diff answer different questions during the same review.',
          'Once the check is reliable, register it as a normal CI job. GitHub’s branch protection docs describe how to require selected status checks before merging. Give jobs unique names, and retain a short local command so the author can diagnose failures before opening a pull request. The next patch then arrives with evidence collected under the same conditions.',
          'Before replacing a check or changing a fixture, run the revised version against one known good revision and one revision with the original defect. This is a small maintenance exercise for the verification harness itself. In the blog example, the second revision should still reveal the stale page after a clean build.',
        ],
      },
    ],
    sources: [
      { label: 'Playwright · Writing browser tests and assertions', href: 'https://playwright.dev/docs/writing-tests' },
      { label: 'Playwright · Retry behavior and flaky results', href: 'https://playwright.dev/docs/test-retries' },
      { label: 'GitHub · Required status checks and branch protection', href: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches' },
    ],
  },
]
