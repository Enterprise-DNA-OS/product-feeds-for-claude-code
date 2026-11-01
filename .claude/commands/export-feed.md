---
description: Write a reviewed feed to a local file.
---

Read CLAUDE.md and docs/cli.md first. Write a reviewed feed to a local file.

Run:

```bash
npm run feeds -- export-feed --run=<run-id> --out=feeds/koru.tsv --actor="Alex" --json
```

Replace example record selectors and timestamps with the operator's records. Read the relevant shop, product or run first. Never invent an identifier or refresh an observation time without a new source observation. If a selector is ambiguous, present the candidates.

Show the run counts, exclusions and changes before recording a review. The operator must authorise the review. This command does not upload to a channel.




Present the result in plain words with counts and the next concrete correction. Writes use the operator name in --actor. An actor label is not authentication. Never send or publish anything.
