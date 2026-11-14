import type { BlogPost } from './blogPosts'

export const androidPosts: BlogPost[] = [
  {
    slug: 'android-offline-first-room-sync',
    category: 'Android',
    title: 'Designing an Android app that keeps working offline',
    excerpt: 'A Room and WorkManager design for local reads, durable edits, and visible sync conflicts, illustrated with a field inspection app.',
    date: '2026-11-14',
    readingTime: '4 min read',
    diagramTitle: 'How an inspection edit reaches the server',
    diagramType: 'workflow',
    diagram: [
      { title: 'Save the edit', description: 'Commit the local record and its pending mutation in one Room transaction.' },
      { title: 'Render locally', description: 'Observe the record from Room and label it as saved on the device.' },
      { title: 'Sync when eligible', description: 'A worker sends pending operations with stable IDs and base revisions.' },
      { title: 'Reconcile the result', description: 'Apply the accepted revision or surface a conflict. The screen updates from Room.' },
    ],
    sections: [
      {
        heading: 'Decide what a person can finish offline',
        paragraphs: [
          'Imagine a building inspector walking through a basement with unreliable reception. The useful thing the app can do is let the inspector see the last downloaded checklist and finish recording observations. The product should define exactly which actions are available in that situation. For this example, reading assigned inspections and editing notes can happen offline. Final submission requires a server response because the server checks whether every required review has been completed.',
          'Use separate states for saved on this device, waiting to sync, and accepted by the server. Give an empty cache its own message. A first launch with no downloaded inspections needs a different explanation from an empty assignment list the server has confirmed. The offline-first Android architecture guide describes a local source as the data source consumers read, with the network updating that local representation.',
        ],
      },
      {
        heading: 'Read a single stream of records',
        paragraphs: [
          'Have the screen observe a Room query through the repository. The ViewModel maps the records and their sync status to UI state, while refresh and background work both apply changes to Room. A successful network response becomes visible through the same path as a local edit. This avoids a race where a slower network response overwrites a newer value already visible on the screen.',
          'A practical schema could include an inspection table with a local ID, a server revision, the latest device values, and a sync state. Keep a separate table for pending mutations with an operation ID, a target record ID, a base revision, and the intended change. Use a transaction when saving a note and registering its mutation together. A process exit between those writes could otherwise leave a saved note that the sync worker has no way to discover.',
        ],
      },
      {
        heading: 'Drain pending edits and handle stale revisions',
        paragraphs: [
          'The worker picks up durable mutations in a defined order. For each mutation, send an operation ID that remains the same across attempts. The service must recognize that ID and return the prior outcome if it already applied the operation. This handles a common failure sequence where the server accepts an edit, the response is lost, and the device tries again. Local queue management and server deduplication solve different parts of that sequence.',
          'Imagine two inspectors edit the same note from revision 8. One sends the edit and creates revision 9. When the other submits a mutation based on revision 8, the server can return the current record along with a conflict response. Preserve both versions on the device and give the inspector an explicit choice to use the server version or save a revised version. For changes that already have a defined merge rule, such as appending independent observations, the repository can apply that rule without an extra prompt. Keep the merge policy specific to the field and operation.',
        ],
      },
      {
        heading: 'Keep refreshes from erasing pending work',
        paragraphs: [
          'A successful refresh can still make the UI wrong if it blindly replaces local tables. For each inspection, decide how a downloaded snapshot interacts with pending local mutations. One option is to keep the latest server snapshot and apply queued edits over it when deriving the device view. A deletion also needs a policy. Keep a marker for a pending delete until the server acknowledges it, so a refresh cannot briefly resurrect an inspection that the user removed.',
        ],
      },
      {
        heading: 'Test the product with two devices and uneven connectivity',
        paragraphs: [
          'Start with cached inspections, disable connectivity, and update a note. Close and reopen the app to make sure the change and its pending state survive. Reconnect and verify that the accepted revision appears without leaving the screen. Then simulate a server that commits a request before dropping its response. After retry, the server should have one applied operation and the local queue should contain no duplicate.',
          'Use a second device to edit the same inspection from the same base revision. Verify that the conflicting draft stays recoverable and that resolving the conflict updates the right record. Also test a first launch with no cache and a queued edit under an account that has signed out. For an initial release, the acceptance criteria are simple to observe. A person can resume work without a network connection, and the UI tells them when their changes are still on the device.',
        ],
      },
    ],
    sources: [
      { label: 'Android Developers · Build an offline-first app', href: 'https://developer.android.com/topic/architecture/data-layer/offline-first' },
      { label: 'Android Developers · Data layer architecture', href: 'https://developer.android.com/topic/architecture/data-layer' },
      { label: 'Android Developers · Asynchronous Room DAO queries', href: 'https://developer.android.com/training/data-storage/room/async-queries' },
      { label: 'Android Developers · Persistent task scheduling', href: 'https://developer.android.com/develop/background-work/background-tasks/persistent' },
    ],
  },
  {
    slug: 'profile-jetpack-compose-scroll-jank',
    category: 'Android',
    title: 'Tracing slow frames in Jetpack Compose',
    excerpt: 'Build a repeatable scrolling benchmark, inspect the slow frames, and use the trace to decide which change to make.',
    date: '2026-11-14',
    readingTime: '4 min read',
    diagramTitle: 'From a stuttering scroll to a verified fix',
    diagramType: 'workflow',
    diagram: [
      { title: 'Reproduce', description: 'Choose a concrete journey, a physical device, and a repeatable data set.' },
      { title: 'Measure', description: 'Capture frame timing and a system trace with Macrobenchmark.' },
      { title: 'Identify the work', description: 'Inspect a slow frame to locate composition, placement, drawing, or another bottleneck.' },
      { title: 'Make one change', description: 'Apply a targeted fix and rerun the same journey with the same conditions.' },
    ],
    sections: [
      {
        heading: 'Write down the exact interaction',
        paragraphs: [
          'Consider an image-heavy feed with a collapsing header. A useful report would say that the feed stutters when the user flings a set of cached posts on a particular device and the header collapses. That description gives the team a journey to repeat. The different case where the feed is slow on its first visit also matters, but cold image I/O and warmed scrolling can produce different traces. Measure those journeys separately.',
          'Record the app build, device and OS, dataset, screen refresh behavior, and relevant cache conditions. Use a physical device for numbers you plan to compare. Run the journey against a profileable release-like build, since debug settings can change timings. Keep the same compilation mode and Baseline Profile assumptions across the before and after runs. Macrobenchmark’s setup and the Compose performance codelab describe how to collect repeatable measurements and traces.',
        ],
      },
      {
        heading: 'Pair the frame distribution with the trace',
        paragraphs: [
          'Use FrameTimingMetric for the scrolling journey. On Android 12 and later, frameOverrunMs reports how a frame performed relative to its deadline. A positive number means the frame missed that deadline. Compare the higher percentiles, such as P95 and P99, alongside the median. A feed can feel uneven if a few frames regularly miss their deadlines even though most render comfortably. If the issue is startup, use startup timing and define what fully drawn means for that screen.',
          'Open a representative slow frame in the system trace. Inspect the main thread, the rendering thread, and any image or data work that overlaps the interval. Composition tracing can name composables that run inside the frame. Use those names and durations to form a hypothesis. The recomposition count in Layout Inspector can help find where to look, while the trace shows which work actually consumed enough time to explain the missed frame.',
        ],
      },
      {
        heading: 'Fix the phase where the cost appears',
        paragraphs: [
          'Suppose the trace shows the feed composition running as the header translates on every scroll update. In Compose, the phase where state is read affects which work runs again. If a scroll-dependent value only affects placement, a placement-time modifier lambda such as the lambda form of offset can move the read closer to the place that uses it. Keep composition reads for values that truly change what the screen displays. The Compose phases guide explains which state reads invalidate each phase.',
          'A trace can point elsewhere. If thumbnail decode or large image allocation overlaps the slow frames, inspect requested sizes and how loading is scheduled. If database work delays the first usable screen, measure that path separately. If a composable repeatedly transforms a large input collection, move the calculation to a stable input boundary and check that invalidation still happens when the input actually changes. Pick the change that addresses the measured work.',
        ],
      },
      {
        heading: 'Measure first launch separately',
        paragraphs: [
          'Changing scroll placement may improve a particular gesture while leaving startup untouched. If startup also feels slow, use a separate benchmark that launches from a defined state and measures both the first frame and the frame where the main content becomes usable. On a dashboard with local and online data, define full display around the content needed for the initial task. If the user can work from the cached dashboard immediately, background refresh can finish later. Reporting that first useful state consistently makes comparisons across releases interpretable.',
        ],
      },
      {
        heading: 'Verify behavior and keep the benchmark',
        paragraphs: [
          'Rerun the same gesture several times with the same device and build configuration. Compare the frame distribution and inspect the trace again. A numerical improvement is easier to interpret when the expensive slices also shrink. Confirm that the header still collapses to the right position, scroll restoration works, and the feed shows new content when its data changes. A path that appears faster because it skipped required UI work is a correctness regression.',
          'Record the build or revision, the dataset, and before-and-after results in the change description. If the difference is within normal run-to-run variation, record that uncertainty and leave the benchmark in place. An app-specific Baseline Profile can help cover important startup and interaction paths. The benchmark remains the tool for measuring whether a change improved the specific journey people use.',
        ],
      },
    ],
    sources: [
      { label: 'Android Developers · Practical Compose performance codelab', href: 'https://developer.android.com/codelabs/jetpack-compose-performance' },
      { label: 'Android Developers · Macrobenchmark metrics', href: 'https://developer.android.com/topic/performance/benchmarking/macrobenchmark-metrics' },
      { label: 'Android Developers · Jetpack Compose phases', href: 'https://developer.android.com/develop/ui/compose/phases' },
      { label: 'Android Developers · Baseline Profiles in Compose', href: 'https://developer.android.com/develop/ui/compose/performance/baseline-profiles' },
    ],
  },
  {
    slug: 'android-reliable-background-uploads',
    category: 'Android',
    title: 'Making Android background uploads recoverable',
    excerpt: 'Design a photo upload that survives leaving the screen, retries after a dropped connection, and tells the user what happened.',
    date: '2026-11-14',
    readingTime: '4 min read',
    diagramTitle: 'The lifecycle of a queued photo upload',
    diagramType: 'workflow',
    diagram: [
      { title: 'Select a photo', description: 'Use the system picker and retain access to the selected file for the worker.' },
      { title: 'Save the upload', description: 'Persist the transfer ID and source reference before enqueuing unique work.' },
      { title: 'Run when eligible', description: 'Respect network constraints, retry temporary failures, and reuse the same transfer ID.' },
      { title: 'Show the result', description: 'Record the accepted response or an actionable error and update the UI from the saved state.' },
    ],
    sections: [
      {
        heading: 'Choose scheduling based on the user’s expectation',
        paragraphs: [
          'Consider an expense app that uploads a photo of a receipt. The user can accept a short delay and should be able to close the screen once the app has saved the transfer. That makes a persistent one-time WorkManager request a good fit for a small, interruptible upload. If a user instead explicitly starts a large transfer and expects it to begin promptly with visible progress, review the user-initiated data transfer option. Android introduced those jobs in Android 14 and requires a notification. Evaluate the appropriate path for the supported Android versions.',
          'Start the receipt flow with the system photo picker so the app gets access to the media the user selected. A worker may open it long after the screen closes. Retain the URI permission where the provider supports it, or create an app-owned copy while the input remains readable. In the second case, define when to delete the copy after success or abandonment. Keep a missing or unreadable source in a recoverable state that lets the user select it again.',
        ],
      },
      {
        heading: 'Persist the task before scheduling it',
        paragraphs: [
          'Create an upload record containing a transfer ID, the owning account, the source reference, and a status. The UI can observe that record to show queued, uploading, sent, or needs attention. Pass the ID to the worker, which loads the current record and confirms that the associated account can still submit it. Store large payloads in a readable file location. The scheduler needs enough information to find the payload, even if the original screen no longer exists.',
          'A name like receipt-upload followed by the transfer ID lets the app enqueue the same logical WorkManager request again when it sees a pending record. The KEEP policy retains an unfinished request with that name. Plan for the gap between storing the record and enqueuing the request by periodically reconciling pending records with scheduled work, for example when the app starts or opens the queue. Treat a confirmed upload record as complete when a worker picks it up again.',
        ],
      },
      {
        heading: 'Distinguish waiting, retrying, and giving up',
        paragraphs: [
          'A network constraint postpones work until a suitable connection is present, subject to Android scheduling. The server can still time out or be unreachable after the worker starts. Treat transient failures as candidates for retry and configure backoff. A rejected file, revoked source permission, or account that needs a fresh login requires user action. Save a specific status for those cases so the screen can give a direct next step.',
          'Have the backend accept a consistent transfer ID for retries and return the original result if it has already stored the receipt. For example, a timeout after the server accepts a transfer leaves the device uncertain whether it should mark it as sent. Repeating the request with the same ID lets the device resolve that uncertainty. Test what happens when the user cancels while a request is already in flight. The saved result should reflect what the service has accepted, with any removal handled according to the product’s own rules.',
        ],
      },
      {
        heading: 'Keep transfer progress tied to the active attempt',
        paragraphs: [
          'Store the current progress or attempt ID with the upload record when the worker starts. If a retry needs to send the entire file again, reset the progress display for that attempt and explain that the upload is retrying. A progress update from a canceled attempt should never mark a newer attempt as complete. If the server supports resuming from a confirmed offset, save that offset after acknowledgement and use it when reconnecting.',
        ],
      },
      {
        heading: 'Exercise the handoffs and the limits',
        paragraphs: [
          'Start an upload, navigate away, and inspect the queued record when you reopen the screen. Disable connectivity before the request starts and again partway through it. Simulate a temporary server error followed by success, and verify that the same transfer ID reaches the backend. For the permanent failure path, test a deleted source and make sure the interface offers a way to choose a replacement. WorkManager’s testing utilities let you simulate constraints for integration tests.',
          'For production, track useful aggregates such as time spent queued, attempts per completed upload, and the main reasons jobs need attention. Avoid putting receipt contents in diagnostic logs. A completed prototype should let a person answer three questions from the UI. Was the photo saved locally, does the app still need something from me, and has the server accepted the upload?',
        ],
      },
    ],
    sources: [
      { label: 'Android Developers · Work requests, constraints, and retries', href: 'https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started/define-work' },
      { label: 'Android Developers · Managing unique work', href: 'https://developer.android.com/develop/background-work/background-tasks/persistent/how-to/manage-work' },
      { label: 'Android Developers · Photo picker', href: 'https://developer.android.com/training/data-storage/shared/photo-picker' },
      { label: 'Android Developers · User-initiated data transfer', href: 'https://developer.android.com/develop/background-work/background-tasks/uidt' },
      { label: 'Android Developers · WorkManager integration tests', href: 'https://developer.android.com/develop/background-work/background-tasks/testing/persistent/integration-testing' },
    ],
  },
]
