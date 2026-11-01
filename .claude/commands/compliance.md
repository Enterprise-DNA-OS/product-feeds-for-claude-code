---
description: Check supported channel requirements and the shop freshness policy.
---

Read CLAUDE.md and docs/cli.md first. Check supported channel requirements and the shop freshness policy.

Run:

```bash
npm run feeds -- compliance --channel="Koru Shopping" --json
```

Replace example record selectors and timestamps with the operator's records. Read the relevant shop, product or run first. Never invent an identifier or refresh an observation time without a new source observation. If a selector is ambiguous, present the candidates.



Each implemented requirement is documented in docs/compliance.md. Report errors as checks on the stored data, never as proof that a channel or regulator has accepted a listing.


Present the result in plain words with counts and the next concrete correction. Writes use the operator name in --actor. An actor label is not authentication. Never send or publish anything.
