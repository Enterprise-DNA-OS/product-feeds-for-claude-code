---
description: Add an ordered channel transformation or exclusion.
---

Read CLAUDE.md and docs/cli.md first. Add an ordered channel transformation or exclusion.

Run:

```bash
npm run feeds -- add-rule --channel="Koru Shopping" --name="Hold a category" --priority=30 --field=product_type --operator=equals --match=Clearance --action=exclude --actor="Alex" --json
```

Replace example record selectors and timestamps with the operator's records. Read the relevant shop, product or run first. Never invent an identifier or refresh an observation time without a new source observation. If a selector is ambiguous, present the candidates.






Present the result in plain words with counts and the next concrete correction. Writes use the operator name in --actor. An actor label is not authentication. Never send or publish anything.
