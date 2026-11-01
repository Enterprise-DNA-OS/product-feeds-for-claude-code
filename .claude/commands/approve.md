---
description: Record a review of a current, error-free run.
---

Read CLAUDE.md and docs/cli.md first. Record a review of a current, error-free run.

Run:

```bash
npm run feeds -- approve --run=<run-id> --note="Source, exclusions and counts reviewed" --actor="Alex" --json
```

Replace example record selectors and timestamps with the operator's records. Read the relevant shop, product or run first. Never invent an identifier or refresh an observation time without a new source observation. If a selector is ambiguous, present the candidates.

Show the run counts, exclusions and changes before recording a review. The operator must authorise the review. This command does not upload to a channel.




Present the result in plain words with counts and the next concrete correction. Writes use the operator name in --actor. An actor label is not authentication. Never send or publish anything.
