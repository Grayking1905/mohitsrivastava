import type { BlogPost } from './blogPosts'

export const agentPost: BlogPost = {
  slug: 'building-a-lightweight-ai-agent-with-react-n8n-hugging-face',
  category: 'AI',
  cover: 'agent',
  title: 'Building a practical AI agent with React, n8n, and Hugging Face',
  excerpt: 'How I split an application agent into a React interface, an n8n workflow, and a lightweight language model. A support intake example shows how to make the result usable and reviewable.',
  readingTime: '6 min read',
  date: '2026-11-14',
  sections: [
    {
      heading: 'Give the agent one job it can finish',
      paragraphs: [
        'I built an AI agent inside an application using React, n8n, and lightweight models from Hugging Face. Separating those layers made it easier to decide which parts needed a language model. React handles the interaction, n8n coordinates the steps, and the model handles the free-form text. A useful task is one where I can say what a good result looks like before I send a prompt.',
        'Consider a support intake assistant as a concrete example. It takes a rough message and suggests a category, a short summary, and a next step. “I was charged twice” can become a billing item that asks a person to check two transactions. The model does not confirm that a duplicate charge occurred, issue a refund, or send a message. Those are separate actions with their own evidence and permissions. The support example illustrates the architecture; it is not a claim about a deployed support system or its results.',
      ],
    },
    {
      heading: 'React handles the request and the review',
      paragraphs: [
        'Give the form a clear purpose and show what data it will send. For the example above, the fields could be a subject and message with an optional ticket ID. The useful states are ready, submitting, ready for review, and failed with a retry option. Preserve the original input alongside the suggestion so someone can spot a wrong category or missing detail. If the request fails midway, keep the draft instead of asking the user to retype it.',
        'Keep the Hugging Face token and any n8n credentials on the server. A browser can call an application endpoint that checks the user session, limits request size and frequency, and forwards only the fields the workflow needs. The endpoint can attach a request ID for troubleshooting without asking the model to echo private information. Field validation in React is for the user’s convenience; the server still needs its own checks.',
      ],
    },
    {
      heading: 'n8n makes the decision points visible',
      paragraphs: [
        'A Webhook node starts the workflow. A validation step checks the request, trims oversized input, and rejects empty messages. Next, the workflow builds the model request from a fixed instruction and the submitted text. The message is data to classify, even if it contains a line like “ignore your instructions.” Give the model only the relevant text and a small vocabulary of allowed categories.',
        'After inference, validate the response before returning it. For the intake example, I would require a category drawn from a fixed list, a short summary, and whether a reviewer needs to make a decision. If the output includes a ticket number, check it against an actual input value. If the response cannot be parsed or it contradicts the source, send it to manual review. A Respond to Webhook node can return the validated suggestion or an explicit failure state; n8n’s error workflow can handle unexpected failures separately.',
        'Use a test URL and synthetic messages while building the workflow. Before moving to the production URL, exercise invalid input, throttling, inference timeouts, and duplicate clicks. For a slow workflow, it is better to return a request ID and show a pending state than to leave the user staring at a spinner. If the workflow ever saves something, make repeat submissions safe by tying writes to a stable request ID.',
      ],
    },
    {
      heading: 'Use a small model with a narrow contract',
      paragraphs: [
        'The reason to start small is that classification and short summaries do not always require a large model. I would compare candidates against a set of reviewed examples, including a missing detail, conflicting facts, a long message, and an instruction pasted into the text. Evaluate the final result: how often does the suggestion need editing, how often does the output pass validation, and how long is the wait on a typical and a slow request?',
        'Check the model card for license and limitations and check the Inference Providers listing for availability. A model that can be downloaded for free does not guarantee unlimited free hosted inference. Treat Hugging Face’s included credits as a prototype budget and plan for what happens when a provider is unavailable or the allowance runs out. Use structured output when the chosen provider and model support it, and validate the result anyway. A well-formed response can still be wrong.',
      ],
    },
    {
      heading: 'Ship the review loop before adding automation',
      paragraphs: [
        'For a first release, I would return suggestions only and let people edit or reject them. Keep a small set of anonymized, reviewed cases to run again whenever the model, prompt, or workflow changes. Add failure cases from real use only when the data can be safely retained. A good improvement turns a regular manual step into a shorter review without hiding uncertainty or creating work in another system.',
        'The same separation applies to turning a bug report into a structured issue, routing an internal request, or extracting action items from a meeting summary. Pick a task where the input and output are clear. Keep rules and permissions outside the model, and let it do the part that actually benefits from understanding language.',
      ],
    },
  ],
  diagramTitle: 'From React form to reviewed suggestion',
  diagramType: 'workflow',
  diagram: [
    { title: 'Submit in React', description: 'Send the necessary fields and preserve the original draft.' },
    { title: 'Check the request', description: 'Authenticate at the server boundary and give n8n validated input.' },
    { title: 'Call a small model', description: 'Ask Hugging Face inference for a short result with a defined shape.' },
    { title: 'Validate the result', description: 'Check the fields, allowed category, and factual references before returning.' },
    { title: 'Review in React', description: 'Show the suggestion alongside its source so the user can edit or reject it.' },
  ],
  diagramBranches: [
    { title: 'Invalid input', description: 'Return a field error and preserve the user’s draft.' },
    { title: 'Unavailable model or invalid output', description: 'Keep the item in manual review. Retry only when appropriate.' },
  ],
  sources: [
    { label: 'n8n · Webhook node', href: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/' },
    { label: 'n8n · Error handling', href: 'https://docs.n8n.io/flow-logic/error-handling/' },
    { label: 'Hugging Face · Structured outputs', href: 'https://huggingface.co/docs/inference-providers/en/guides/structured-output' },
    { label: 'Hugging Face · Inference Providers pricing', href: 'https://huggingface.co/docs/inference-providers/en/pricing' },
  ],
}
