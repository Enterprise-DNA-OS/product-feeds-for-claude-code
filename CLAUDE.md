# Product Feeds for Claude Code: operating instructions

Read README.md, docs/cli.md and docs/compliance.md before work. This database holds shop catalogues, channel rules, review tasks and local feed releases. The seed data is fictional. Confirm the intended shop and database before changing records.

## One route for each job

| Operator asks for | Recipe |
|---|---|
| List shops and their freshness policies | /shops |
| List channel owners and file formats | /channels |
| List product records across shops | /products |
| Read ordered channel rules | /rules |
| Review unavailable products and conflicting stock | /stock-watch |
| Find old or empty source catalogues | /stale-inputs |
| Read open corrections and due dates | /tasks |
| Read prepared and reviewed feed runs | /runs |
| Read the before and after change history | /history |
| Read one product with its original source payload | /product |
| Check the prepared channel records | /feed-check |
| Check supported channel requirements and the shop freshness policy | /compliance |
| Explain why products were excluded | /exclusion-review |
| Compare a saved run with the preceding reviewed run | /run-change |
| Combine overdue corrections, old sources and stock conflicts | /attention |
| Prepare the week from source, stock, task and release reads | /weekly-review |
| Register a shop and its accountable owner | /add-shop |
| Register a channel for one shop | /add-channel |
| Record an observed product | /add-product |
| Correct or archive a product with a reason | /update-product |
| Add an ordered channel transformation or exclusion | /add-rule |
| Retire a rule with a reason | /disable-rule |
| Assign a dated catalogue correction | /add-task |
| Record the resolution of a correction | /close-task |
| Record a review note | /log |
| Preview and import a DataFeedWatch CSV download | /import |
| Save a feed run with checks, exclusions and source fingerprint | /compile |
| Record a review of a current, error-free run | /approve |
| Write a reviewed feed to a local file | /export-feed |
| Save every dataset to a JSON snapshot | /export |
| Write the weekly review to a local draft | /draft-review |
| List all CLI commands | /help |
| Add a field or change a business rule | /customise |
| Add a read-only report | /new-view |

## Working rules

Read the record first. Use scripts/feeds.mjs with --json, then answer in plain words. Resolve ambiguous names with the operator. Never invent a source value, observation timestamp, identifier or review. Missing input is a finding. Each mutation uses the operator label through --actor.

Run imports with --dry-run first. Reconcile counts, currencies and SKU identity. Never seed business records. Do not delete records: archive a product with a reason, close a task or disable a rule. Evidence records cannot be edited through this application.

Compile, inspect the counts and changes, record the operator-authorised review, then export a local feed file. A reviewed run is not proof of channel acceptance. Never upload a feed, change ads, send messages or delete data from this repository without explicit approval for that action. Drafts stay in drafts/.

No application front end. Reports are read-only HTML generated from views.json and documents.json with brand.json. Use the next numbered migration for database changes. Run npm test before applying a customised migration to the working database.

Source observations and prices stay separate by shop. Do not translate currencies. Rules cannot rewrite price or stock. No public access policy ships; the database owner connection is for trusted operators only.

Every code commit ends with Agent: omni-rebuild-strategist when that charter is active. Work on main.

Installed and run through Omni by Enterprise DNA: https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=datafeedwatch
