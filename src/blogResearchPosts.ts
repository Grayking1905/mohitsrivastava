import type { BlogPost } from './blogPosts'

export const researchPosts: BlogPost[] = [
  {
    slug: 'evaluate-retrieval-augmented-answers',
    category: 'AI',
    title: 'How to tell whether a retrieved passage supports an AI answer',
    excerpt: 'A claim-by-claim workflow for debugging retrieval, checking citations, and recognizing when the evidence runs out.',
    date: '2026-11-14',
    readingTime: '4 min read',
    diagramTitle: 'Trace a claim back to the source',
    diagramType: 'workflow',
    diagram: [
      { title: 'Label the evidence', description: 'Save the document editions and passages that support the reference answer.' },
      { title: 'Inspect retrieval', description: 'Check which passages reached the model after ranking and truncation.' },
      { title: 'Audit each claim', description: 'Mark cited support, contradictions, missing evidence, and omitted qualifications.' },
      { title: 'Replay with known evidence', description: 'Supply the reference passages to isolate the generation failure.' },
    ],
    sections: [
      {
        heading: 'Follow one question through the system',
        paragraphs: [
          'Imagine a documentation assistant answering whether an offline export feature works on Android version 8. It cites a setup guide for version 9. The citation opens and the guide describes offline export, but its scope starts one version later. Someone following that answer can waste time trying to enable a feature their app cannot use. This is a useful evaluation case because it forces the system to connect the claim to the right version and conditions.',
          'Retrieval-augmented generation gives the model relevant passages at answer time. The RAGTruth researchers collected nearly 18,000 generated responses and used manual annotation to locate hallucinations at the response and word levels. The ALCE benchmark measures dimensions including answer correctness and citation quality. Both motivate keeping separate records of what the system retrieved, what it claimed, and which claims a reviewer could verify.',
        ],
      },
      {
        heading: 'Create a small reference set',
        paragraphs: [
          'Start with roughly 30 to 50 questions drawn from the kinds of requests the app is meant to handle. Include direct lookup questions, questions whose answers require more than one passage, and questions the collection cannot answer. Add deliberately similar document editions so that one example requires a current limit and another asks about an older release. Include at least a few ambiguous questions where a reasonable response asks for a version or distinguishes plausible cases.',
          'For each item, save the document version and text spans a reviewer would use to answer it. Record the essential claims, any required qualifications, and the expected behavior when a source is missing or when two sources disagree. A single fixed answer string can penalize harmless paraphrases. Reference claims and passages give reviewers room to recognize several correct formulations while applying the same evidence standard.',
        ],
      },
      {
        heading: 'Score retrieval and generation separately',
        paragraphs: [
          'Run retrieval with the same index and context limits the app uses. Log document identifiers, passage boundaries, and the exact context that reached the generator. A useful first metric is evidence recall at k, the fraction of labeled evidence units that appear in the first k retrieved passages. Also track whether every essential unit was available for each question. Retrieving one of two passages can be enough for a partial answer and still leave a comparison incomplete. Recheck after the context builder applies its limits.',
          'Divide the generated answer into verifiable claims. For each claim that needs a citation, ask whether the cited passage supports the full statement. Check version scope, quantities, exceptions, and whether the passage describes the same feature. Track the share of claims needing a citation that have support, and separately track how often citations actually support the claims beside them. A concise answer can score well on citation accuracy while leaving out half of the requested information, so score completeness against the reference claims too.',
          'For unanswerable questions, give credit to an explicit statement that the sources do not establish the answer. Keep track of false abstentions on answerable questions. A blanket fallback can reduce unsupported claims by dropping useful answers. Review a sample of borderline claims together before trusting aggregate scores, particularly if you use an automated grader to speed up triage.',
          'In the export example, a reviewer would mark the cited version 9 passage as relevant and the version 8 claim as unsupported. If the response also supplied a supported workaround for version 8, score the workaround independently. This preserves the distinction between a partially useful response and an answer whose main instruction can be followed safely.',
        ],
      },
      {
        heading: 'Change the stage that failed',
        paragraphs: [
          'Replay a failure with the labeled passages supplied directly. If the response becomes accurate, inspect the original ranking, filters, and context generation. If the same error persists with the right evidence in view, review instruction design, claim construction, and how citations are attached. A controlled replay suggests where to investigate. It cannot reproduce every detail of production traffic.',
          'Treat the failing examples as regression cases. A change to chunk size might improve direct lookups and split qualifications away from the rules they modify. Compare before-and-after results by question type, including ambiguous requests and out-of-scope requests. Keep a set of questions aside until you choose a configuration. A held-out evaluation helps separate a retrieval improvement from a prompt that happens to memorize the examples used during tuning.',
        ],
      },
    ],
    sources: [
      { label: 'Niu and colleagues, RAGTruth at ACL 2024', href: 'https://aclanthology.org/2024.acl-long.585/' },
      { label: 'Gao and colleagues, Enabling Large Language Models to Generate Text with Citations at EMNLP 2023', href: 'https://aclanthology.org/2023.emnlp-main.398/' },
    ],
  },
  {
    slug: 'evaluate-small-models-on-real-tasks',
    category: 'AI',
    title: 'How to evaluate a small language model for a real workload',
    excerpt: 'Use task-level accuracy, abstention, and measured latency to decide whether a compact checkpoint fits your app.',
    date: '2026-11-14',
    readingTime: '4 min read',
    diagramTitle: 'Evaluate a compact model on one task',
    diagramType: 'workflow',
    diagram: [
      { title: 'Specify the task', description: 'Choose the inputs, permitted labels, and cases that need human judgment.' },
      { title: 'Freeze the cases', description: 'Separate prompt-development examples from an untouched evaluation split.' },
      { title: 'Run comparable baselines', description: 'Record the checkpoint, prompt, hardware, runtime, and generation limits.' },
      { title: 'Decide from the slices', description: 'Review rare cases, abstentions, latency, and missed high-impact labels.' },
    ],
    sections: [
      {
        heading: 'Choose a task with a measurable finish',
        paragraphs: [
          'A product feedback inbox gives a small language model a concrete job. For each item, extract a product area and assign a label such as bug report, feature request, or unclear. Keep the first experiment narrow enough that two reviewers can agree on the expected output. For example, a message that requests dark mode and mentions a slow launch might be split into two labels, or it might be marked for review. The evaluation should specify that behavior in advance.',
          'The Hugging Face SmolLM2 technical report describes a 1.7 billion parameter model trained on roughly 11 trillion tokens, with changes to its data mixture across training stages. Its authors compared it with other compact models on their selected benchmarks and published checkpoints and datasets. That work supplies a reproducible candidate and an example of a training strategy. The model card provides a starting configuration and links to artifacts. An inbox evaluation still needs to measure the behavior under its own label definitions.',
        ],
      },
      {
        heading: 'Compare against a simple baseline',
        paragraphs: [
          'Establish what a few application rules can handle before building the model pipeline. A feedback form may already collect a product area and a category from the person submitting the item. Compare a rules-only baseline against a compact instruction-tuned model using the same held-out inputs. The model can also be evaluated only on the ambiguous cases where the rules defer. Those are different deployment strategies, so count every request that reaches each stage.',
          'Create a reference set with short and long inputs, missing context, mixed intents, and examples where domain vocabulary resembles a different category. Agree on a tie-breaking rule or label the item as ambiguous. Split by repeated templates, source, or time so that near duplicates do not appear in both the prompt-development and held-out sets. Record each ambiguity decision. That record makes disagreements easier to revisit when a model improves one label and confuses another.',
        ],
      },
      {
        heading: 'Measure accuracy, abstention, and runtime',
        paragraphs: [
          'Start with per-label precision and recall. If the system labels 15 items as bug reports and only 12 are genuine, precision for that label is 12 out of 15. If the reference set contained 20 bug reports, recall is 12 out of 20. High aggregate accuracy on a feature-request-heavy inbox can coexist with low recall for bug reports. Report the example count for each label so that readers can distinguish a recurring issue from a result based on two or three cases.',
          'When the system can abstain, report both coverage and quality among the cases it accepts. Suppose a model handles 80 of 100 requests automatically and 72 of those accepted labels are correct. Its coverage is 80 percent and its accepted accuracy is 90 percent. Eight accepted items still need correction, and the deferred 20 need a review path. This example is arithmetic with illustrative values. The actual balance depends on the workload and the consequences of a missed case.',
          'Record the exact model revision, prompt version, generation limits, runtime, and hardware. Measure the elapsed time the user would experience from request to a usable result, including preprocessing and any schema check. Track cold starts separately from warm requests and compare median with 95th-percentile latency on enough repeated runs to make the estimates useful. Quantization and serving configurations belong in the run description because they can affect what the app experiences.',
        ],
      },
      {
        heading: 'Make a decision the team can rerun',
        paragraphs: [
          'Define a minimum recall for labels that matter and a maximum review queue the team can handle. Then inspect a sample of accepted errors and abstentions to understand which tasks need narrower instructions, deterministic extraction, or a human decision. Tune thresholds and examples on the development split, then make one comparison on the reserved data.',
          'Keep the input identifiers, expected labels, versioned configuration, and longest or hardest cases together. When you swap a checkpoint or runtime, the comparison should use the same label definitions and serve the same workflow. If the tool stays within its quality and latency limits, the next question is whether it keeps doing so as the inbox changes. Sample new requests over time and add representative failures to a separately versioned evaluation set.',
        ],
      },
    ],
    sources: [
      { label: 'Ben Allal and colleagues, SmolLM2 technical report', href: 'https://arxiv.org/abs/2502.02737' },
      { label: 'Hugging Face, SmolLM2-1.7B-Instruct model card', href: 'https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct' },
    ],
  },
  {
    slug: 'verify-structured-ai-output',
    category: 'AI',
    title: 'How to verify structured AI output before an app uses it',
    excerpt: 'Build a two-stage check for generated JSON, then measure how often schema-valid responses carry the right meaning.',
    date: '2026-11-14',
    readingTime: '4 min read',
    diagramTitle: 'From source note to verified record',
    diagramType: 'workflow',
    diagram: [
      { title: 'Capture the request', description: 'Save the original text, input record ID, and the schema revision.' },
      { title: 'Generate a draft', description: 'Use a small schema and represent missing information explicitly.' },
      { title: 'Check the structure', description: 'Parse the output and validate fields, types, enums, and allowed lengths.' },
      { title: 'Verify against the input', description: 'Check units, evidence, and consistency before accepting or forwarding the draft.' },
    ],
    sections: [
      {
        heading: 'Start with a record you can review',
        paragraphs: [
          'Suppose a shop uses a text assistant to prepare inventory records from staff notes. One note reads, “Restock four boxes of A5 notebooks when the next delivery comes in.” A record containing a valid product name and the integer four can pass a structural check. Inventory may still be wrong if the model labels the quantity as individual notebooks or marks the goods as already received. A system that verifies meaning can flag the unit and delivery status for review.',
          'JSON Schema Draft 2020-12 provides a vocabulary for describing and validating the structure of JSON values. JSONSchemaBench evaluates structured generation across approximately 10,000 real-world schemas and compares support for constraints, generation efficiency, and output quality. These dimensions suggest three questions for an application. Can the generator follow the shape? How much time does it take? Do the resulting fields express what the source text says?',
        ],
      },
      {
        heading: 'Use a contract with a place for uncertainty',
        paragraphs: [
          'Write down the data each consumer needs before prompting the model. The inventory draft could contain a product reference, quantity, unit, delivery status, and a short evidence excerpt for each extracted fact. Supply a restricted set of units if the application uses a known vocabulary. Define what happens when the note gives a quantity without a unit. Keep an explicit unknown value or a review status so the model can represent uncertainty without filling an obligatory field with a guess.',
          'Where the generation backend supports constrained decoding, it can restrict token choices so the output follows a supported grammar or schema. The app should still validate the decoded response locally. Test the specific schema features and the exact model configuration in use, including optional fields and nested objects. If the provider returns a refusal or times out, record that outcome before parsing, since it has different implications from an invalid record.',
        ],
      },
      {
        heading: 'Add checks for business meaning',
        paragraphs: [
          'For a note about a future shipment, the app can check whether the proposed status contradicts a verified shipment record. It can look up a product identifier in the catalog, check that the proposed unit is accepted for that product, and verify that an evidence excerpt really appears in the original note. A deterministic lookup gives the model less room to reinterpret a fact stored in the system of record.',
          'Some meaning checks require a reviewer. A source can contain the word “received” while describing a delivery that has still not been received. Keep the original note visible with the generated fields and the reasons the draft was flagged. If an ambiguity needs clarification, return it to a review queue with the suggested record intact. In a workflow that updates inventory, separate a preview from the action that applies the update, so an incorrect draft can be corrected before it changes counts.',
        ],
      },
      {
        heading: 'Evaluate the outcomes separately',
        paragraphs: [
          'Track four outcomes for a held-out set of notes. Count parse failures, schema failures among parsed responses, errors in field meaning among schema-valid records, and records routed to review. For the semantic checks, score each important field and each record as a whole. A field can look strong in an aggregate while a particular combination of quantity and unit fails often enough to affect the stock count.',
          'Add examples with quantities in words, missing fields, mixed units, and references to multiple products. Review a small sample that your validators accepted, since the rejected cases alone reveal only the failures your rules already detect. Compare prompt-only generation with constrained decoding using the same schema and cases where both modes are available. Include total time to a usable draft, including validation and any retries.',
          'A three-row smoke test can catch some wiring problems before a larger run. Send one clearly stated quantity, one note with no unit, and one note containing a unit the catalog rejects. Inspect the stored draft and the review reason for each case. A valid JSON response can still expose an application bug if its review status is ignored.',
          'When an error appears, keep the failing note, the response, and the applicable schema version. A parsing failure can point to integration or return-mode handling. An invalid enum can reveal a mismatch with the backend’s supported schema. A valid record with the wrong unit points to the interpretation or review stage. Recording those outcomes separately gives the next change a concrete target.',
        ],
      },
    ],
    sources: [
      { label: 'JSON Schema Draft 2020-12 Validation Vocabulary', href: 'https://json-schema.org/draft/2020-12/json-schema-validation' },
      { label: 'Geng and colleagues, JSONSchemaBench', href: 'https://arxiv.org/abs/2501.10868' },
    ],
  },
  {
    slug: 'measure-model-routing-tradeoffs',
    category: 'AI',
    title: 'How to measure model routing when latency and quality both matter',
    excerpt: 'Compare a single model, a router, and a cascade using accepted answers, tail latency, and the full cost of retries.',
    date: '2026-11-14',
    readingTime: '4 min read',
    diagramTitle: 'Compare three ways to serve the same workload',
    diagramType: 'comparison',
    diagram: [
      { title: 'Single model', description: 'Send every request to one checkpoint. Use the results as the cost, latency, and quality baseline.' },
      { title: 'Router', description: 'Select a model before generation using request features and a threshold calibrated on held-out examples.' },
      { title: 'Cascade', description: 'Try a small model and pass its output through a verifier. Escalate requests whose drafts fail the check.' },
    ],
    sections: [
      {
        heading: 'Watch the expensive requests separately',
        paragraphs: [
          'Picture a help center with two incoming questions. One asks for the current file size limit. The other asks why a migration failed differently across three versions. A short direct answer may be enough for the first request. The second may require evidence from several documents and a more careful response. A routing experiment asks whether the app can tell those kinds of requests apart well enough to save work without lowering the quality people see.',
          'RouteLLM studies routers that select between a stronger and a weaker model before generating a response, using preference data to train the routing decision. FrugalGPT studies a cascade that can try a lower-cost model first and escalate based on an output score. The two designs make decisions at different points in a request. A router pays for choosing a path up front. A cascade uses evidence from the draft and adds the time of both attempts when it escalates.',
        ],
      },
      {
        heading: 'Record one baseline and two challengers',
        paragraphs: [
          'Run a single model across the full evaluation set first. Keep a second single-model run if the smaller candidate is cheap enough to evaluate over the same inputs. For the router, pick a simple observable decision rule, such as routing FAQ lookups with one matching document to the smaller model and sending multi-document questions to the stronger one. A learned router can be compared later if the hand-written rule leaves enough errors or cost on the table.',
          'For the cascade, define how a draft passes the verifier. A direct fact must be supported by a cited passage, and the response has to satisfy any contract the app needs. Check the verifier using known correct and incorrect drafts before using it as the sole trigger for escalation. A verifier that routinely accepts confident errors will report a low escalation rate while silently losing quality. Keep a sample of both accepted and escalated requests for review.',
        ],
      },
      {
        heading: 'Count end-to-end latency and usable answers',
        paragraphs: [
          'Record the time from request to the first visible token and the time to a complete usable answer. For a cascade, a streamed answer that will later be rejected can confuse readers. If verification happens first, measure how long it takes for the accepted answer to start streaming and account for that wait. Use median and high-percentile latency, and report the same statistics for escalated requests. Rare escalations may disappear in a global median while shaping the experience of the people asking the hardest questions.',
          'Cost per accepted answer is the total spend across requests divided by the count that passes your acceptance criteria. Include failed attempts, verification calls, escalation, and any extra retrieval. For an illustrative calculation, suppose the small attempt costs one unit, verification costs half a unit, and a strong-model call costs six units. At a 25 percent escalation rate, the expected model-and-verifier cost is three units per request. That figure says nothing about cost per accepted answer until you measure quality.',
          'Report each strategy’s request count, failure count, and number of accepted answers alongside the unit cost. Suppose that same cascade averaged three units over 100 requests and only 80 answers passed review. It would cost 300 units in total, or 3.75 units per accepted answer. That denominator also makes timeouts and dropped requests visible in the comparison.',
        ],
      },
      {
        heading: 'Choose a threshold and keep checking it',
        paragraphs: [
          'Write down an acceptable error rate and a latency budget for the workflows you actually serve. Compare the three strategies using the same inputs, references, and review criteria. Use a development set to choose thresholds and a held-out set to compare the chosen configurations. Plot each point by quality and cost, and annotate the tail latency and proportion of requests escalated. Several points may satisfy the accuracy requirement, leaving review effort or latency to decide which belongs in the app.',
          'Traffic can change as new features arrive, documentation grows, or the interface makes different questions easier to ask. Record routing decisions and final outcomes by task type using only the data necessary for evaluation. Periodically check a sample of requests from the cheaper route and monitor the cases that had to try two models. If a threshold stops meeting the original quality or latency budget, the logged examples give you a concrete basis for changing it.',
        ],
      },
    ],
    sources: [
      { label: 'Ong and colleagues, RouteLLM', href: 'https://arxiv.org/abs/2406.18665' },
      { label: 'Chen, Zaharia, and Zou, FrugalGPT', href: 'https://arxiv.org/abs/2305.05176' },
    ],
  },
]
