# Product Feeds for Claude Code

Find the stock conflicts, missing fields and old source records before a product feed leaves the business. Keep the rules and review history in a database you own.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT licensed. Run the fictional catalogues locally. | Your source mappings, channel requirements, exception rules and review documents. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=datafeedwatch&utm_medium=customise) | [Book a call](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=datafeedwatch&utm_medium=managed) |

For retail catalogue teams and the agencies that maintain their product feeds. Runs with Claude Code, Codex, OpenCode or Cursor. The free base prepares and reviews local product feeds. DataFeedWatch also operates live integrations, channel delivery and managed services. Scope your replacement against the work you actually use. [Research](docs/research.md).

## Quick start

Node 20 or later, Windows or Linux:

```bash
git clone https://github.com/Enterprise-DNA-OS/product-feeds-for-claude-code.git
cd product-feeds-for-claude-code
npm install
npm run demo
npm test
npm run view
npm run docs
```

The demo contains two fictional shops, separate NZD and AUD catalogues, an in-stock bottle with zero quantity, an excluded tent, an incomplete mat, old Australian source data and an overdue correction. Repeating the seed preserves changes. PGlite stores data under .data/db. DATABASE_URL selects Postgres. Use a fresh DATA_DIR or database for business records, run migrate, register the shops and import. Never seed a business database.

## Five weekly jobs

1. /feed-check: find the records that block the next feed.
2. /stock-watch: check sold-out products and contradictory availability.
3. /exclusion-review: read why each product was held out.
4. /stale-inputs: find catalogues whose observation times are too old.
5. /weekly-review: combine source health, stock, corrections and prepared releases.

32 CLI commands and 34 slash recipes ship with the project. Every CLI command accepts --json. [Arguments and examples](docs/cli.md).

## Ten questions answered today

DataFeedWatch has configurable rules and feed review. These are demonstrated questions in this build, not a claim that the incumbent cannot answer them.

| Question | Command |
|---|---|
| Which products have zero quantity but say they are in stock? | stock-watch |
| Which shop has stale source observations? | stale-inputs |
| Why was a product removed from this channel? | exclusion-review |
| Which records block the next feed file? | feed-check |
| Which product fields fail the supported channel checks? | compliance |
| Which correction is overdue, and who owns it? | tasks |
| What changed since the previous reviewed feed? | run-change |
| Who reviewed each saved feed run? | runs |
| Which source values changed during an import? | history |
| What did the source file say about this product? | product |

## Bring the catalogue

Download the source products from DataFeedWatch as CSV. Headings follow your source shop, so map the file once when needed. [Switching guide](docs/replace-datafeedwatch.md).

```bash
npm run feeds -- import datafeedwatch --shop=KORU --file=fixtures/datafeedwatch-example.csv --observed-at=2026-11-01T00:00:00Z --dry-run --actor="Demo operator"
```

The timestamp above is a demo example. For business records, use the real source observation time. Preview first, reconcile counts and currencies, then repeat without --dry-run. Replayed observations are unchanged; newer source data updates matching shop and SKU records with before/after history. Duplicate identifiers and malformed values reject the whole file. Missing rows never delete existing products.

## Review before a file leaves

Compile saves the prepared items, rule trace, findings and source fingerprint. Approve refuses errors, an empty feed or a changed source. Export-feed requires a current approval and writes only a local file. Subsequent source or rule changes and expired freshness invalidate the release. Nothing uploads or buys ads. Operator names are labels, not authenticated signatures. Reviewers must also inspect excluded counts.

The base targets general physical goods in NZ and AU. Apparel, preorder and backorder products are blocked for extra fields. Shipping, tax, returns, manufacturer identifier assignment, image quality and parity with the store require human checks. The source checks do not prove that Google will accept an item. [Checks and sources](docs/compliance.md).

## Your first hour: ten things to ask for

1. Put our name and logo on the catalogue review.
2. Explain why the bottle is blocked.
3. List the records missing an image or title.
4. Show the Australian catalogue separately.
5. Explain why the tent is excluded.
6. Draft the weekly review without sending it.
7. Assign the stock correction to its owner.
8. Map our source column names and preview the import.
9. Add our seasonal review field through /customise.
10. Add a channel-owner view through /new-view.

## Documents and views

npm run docs produces source catalogue reviews, feed release reviews and correction lists as branded HTML. npm run view produces the weekly desk and rule register. Change brand.json for your business name, colours and logo. Reports are read-only files you can print to PDF. [What a screen adds](docs/why-no-front-end.md).

## Tests and operation

npm test uses a temporary database and exercises every command, import rollback and replay, currency separation, ambiguous selectors, rule changes, review expiry, immutable evidence, CSV quoting and escaped HTML. TEST_DATABASE_URL points at a fresh disposable Postgres database. The manual CI workflow checks Windows, Linux and Postgres. See docs/verification.md for environments actually tested.

Import files, local databases, feed files, snapshots and draft documents are ignored by Git. Keep their access private. Back up the database and source files separately. Shared use requires authenticated roles and tested recovery. Public database access is revoked. Export contains all nine record sets and is not a restore utility.

MIT licensed. Not affiliated with DataFeedWatch, Cart.com, Google or Anthropic. Hosting and agent subscriptions have separate costs. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=datafeedwatch&utm_medium=readme).
