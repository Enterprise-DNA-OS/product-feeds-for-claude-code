---
description: Preview and import a DataFeedWatch CSV download.
---

Read CLAUDE.md and docs/cli.md first. Preview and import a DataFeedWatch CSV download.

Run:

```bash
npm run feeds -- import datafeedwatch --shop=KORU --file=fixtures/datafeedwatch-example.csv --observed-at=<ISO-UTC-time> --dry-run --actor="Alex" --json
```

Replace example record selectors and timestamps with the operator's records. Read the relevant shop, product or run first. Never invent an identifier or refresh an observation time without a new source observation. If a selector is ambiguous, present the candidates.


Start with --dry-run. Compare product counts and currencies, then repeat without --dry-run within the authorised import. A missing row does not remove an existing product. See docs/replace-datafeedwatch.md.



Present the result in plain words with counts and the next concrete correction. Writes use the operator name in --actor. An actor label is not authentication. Never send or publish anything.
