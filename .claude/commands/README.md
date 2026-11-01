# Recurring jobs

32 CLI recipes plus /customise and /new-view. The shared CLI is scripts/feeds.mjs.

- /shops: List shops and their freshness policies.
- /channels: List channel owners and file formats.
- /products: List product records across shops.
- /rules: Read ordered channel rules.
- /stock-watch: Review unavailable products and conflicting stock.
- /stale-inputs: Find old or empty source catalogues.
- /tasks: Read open corrections and due dates.
- /runs: Read prepared and reviewed feed runs.
- /history: Read the before and after change history.
- /product: Read one product with its original source payload.
- /feed-check: Check the prepared channel records.
- /compliance: Check supported channel requirements and the shop freshness policy.
- /exclusion-review: Explain why products were excluded.
- /run-change: Compare a saved run with the preceding reviewed run.
- /attention: Combine overdue corrections, old sources and stock conflicts.
- /weekly-review: Prepare the week from source, stock, task and release reads.
- /add-shop: Register a shop and its accountable owner.
- /add-channel: Register a channel for one shop.
- /add-product: Record an observed product.
- /update-product: Correct or archive a product with a reason.
- /add-rule: Add an ordered channel transformation or exclusion.
- /disable-rule: Retire a rule with a reason.
- /add-task: Assign a dated catalogue correction.
- /close-task: Record the resolution of a correction.
- /log: Record a review note.
- /import: Preview and import a DataFeedWatch CSV download.
- /compile: Save a feed run with checks, exclusions and source fingerprint.
- /approve: Record a review of a current, error-free run.
- /export-feed: Write a reviewed feed to a local file.
- /export: Save every dataset to a JSON snapshot.
- /draft-review: Write the weekly review to a local draft.
- /help: List all CLI commands.
