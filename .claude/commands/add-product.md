---
description: Record an observed product.
---

Read CLAUDE.md and docs/cli.md first. Record an observed product.

Run:

```bash
npm run feeds -- add-product --shop=NEW --sku=P1 --title="Trail pack" --description="Day pack" --price=89.00 --availability=in_stock --link=https://example.com/p1 --image_link=https://example.com/p1.jpg --brand=Demo --mpn=P1 --observed-at=<ISO-UTC-time> --actor="Alex" --json
```

Replace example record selectors and timestamps with the operator's records. Read the relevant shop, product or run first. Never invent an identifier or refresh an observation time without a new source observation. If a selector is ambiguous, present the candidates.






Present the result in plain words with counts and the next concrete correction. Writes use the operator name in --actor. An actor label is not authentication. Never send or publish anything.
