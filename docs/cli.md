# Command reference

Every command accepts --json. Options use --key=value. Boolean flags --json and --dry-run take no value; boolean data fields use true or false. Names are case-insensitive. Full IDs, unique ID prefixes and unique partial names work. Ambiguous or missing selectors print candidates and exit 1. Product selectors are scoped with --shop.

Every record write needs --actor. This is an operator label, not a login or signature. Source timestamps require ISO UTC with a Z suffix; use the time the source data was actually observed. Never substitute today's date for old stock.

## shops

List shops and their freshness policies.

```bash
npm run feeds -- shops
```

## channels

List channel owners and file formats.

```bash
npm run feeds -- channels
```

## products

List product records across shops.

```bash
npm run feeds -- products
```

## rules

Read ordered channel rules.

```bash
npm run feeds -- rules
```

## stock-watch

Review unavailable products and conflicting stock.

```bash
npm run feeds -- stock-watch
```

## stale-inputs

Find old or empty source catalogues.

```bash
npm run feeds -- stale-inputs
```

## tasks

Read open corrections and due dates.

```bash
npm run feeds -- tasks
```

## runs

Read prepared and reviewed feed runs.

```bash
npm run feeds -- runs
```

## history

Read the before and after change history.

```bash
npm run feeds -- history
```

## product

Read one product with its original source payload.

```bash
npm run feeds -- product PACK-20 --shop=KORU
```

## feed-check

Check the prepared channel records.

```bash
npm run feeds -- feed-check --channel="Koru Shopping"
```

## compliance

Check supported channel requirements and the shop freshness policy.

```bash
npm run feeds -- compliance --channel="Koru Shopping"
```

## exclusion-review

Explain why products were excluded.

```bash
npm run feeds -- exclusion-review --channel="Koru Shopping"
```

## run-change

Compare a saved run with the preceding reviewed run.

```bash
npm run feeds -- run-change --run=<run-id>
```

## attention

Combine overdue corrections, old sources and stock conflicts.

```bash
npm run feeds -- attention
```

## weekly-review

Prepare the week from source, stock, task and release reads.

```bash
npm run feeds -- weekly-review
```

## add-shop

Register a shop and its accountable owner.

```bash
npm run feeds -- add-shop --code=NEW --name="New shop" --country=NZ --owner="Alex" --actor="Alex"
```

## add-channel

Register a channel for one shop.

```bash
npm run feeds -- add-channel --shop=NEW --name="New Shopping" --format=google-tsv --owner="Alex" --actor="Alex"
```

## add-product

Record an observed product.

```bash
npm run feeds -- add-product --shop=NEW --sku=P1 --title="Trail pack" --description="Day pack" --price=89.00 --availability=in_stock --link=https://example.com/p1 --image_link=https://example.com/p1.jpg --brand=Demo --mpn=P1 --observed-at=<ISO-UTC-time> --actor="Alex"
```

## update-product

Correct or archive a product with a reason.

```bash
npm run feeds -- update-product --shop=KORU --product=BOTTLE-1 --quantity=8 --reason="Count confirmed" --actor="Alex"
```

## add-rule

Add an ordered channel transformation or exclusion.

```bash
npm run feeds -- add-rule --channel="Koru Shopping" --name="Hold a category" --priority=30 --field=product_type --operator=equals --match=Clearance --action=exclude --actor="Alex"
```

## disable-rule

Retire a rule with a reason.

```bash
npm run feeds -- disable-rule --rule=<rule-id> --reason="Season ended" --actor="Alex"
```

## add-task

Assign a dated catalogue correction.

```bash
npm run feeds -- add-task --shop=KORU --title="Confirm source stock" --owner="Alex" --due=2026-12-01 --actor="Alex"
```

## close-task

Record the resolution of a correction.

```bash
npm run feeds -- close-task --task=<task-id> --resolution="Source and count checked" --actor="Alex"
```

## log

Record a review note.

```bash
npm run feeds -- log --note="Review held" --actor="Alex"
```

## import

Preview and import a DataFeedWatch CSV download.

```bash
npm run feeds -- import datafeedwatch --shop=KORU --file=fixtures/datafeedwatch-example.csv --observed-at=<ISO-UTC-time> --dry-run --actor="Alex"
```

## compile

Save a feed run with checks, exclusions and source fingerprint.

```bash
npm run feeds -- compile --channel="Koru Shopping" --actor="Alex"
```

## approve

Record a review of a current, error-free run.

```bash
npm run feeds -- approve --run=<run-id> --note="Source, exclusions and counts reviewed" --actor="Alex"
```

## export-feed

Write a reviewed feed to a local file.

```bash
npm run feeds -- export-feed --run=<run-id> --out=feeds/koru.tsv --actor="Alex"
```

## export

Save every dataset to a JSON snapshot.

```bash
npm run feeds -- export --out=exports/catalogue.json
```

## draft-review

Write the weekly review to a local draft.

```bash
npm run feeds -- draft-review
```

## help

List all CLI commands.

```bash
npm run feeds -- help
```

## Product fields and rules

Products carry sku, title, description, price, currency, availability, quantity, link, image_link, brand, gtin, mpn, identifier_exists, condition, item_group_id, color, size, product_type and custom_label_0. Optional values are blank; quantity is an integer or blank. Update supports --archived=true and --observed-at. Archiving removes the product from future runs. It retains the record.

Rules use equals (case-sensitive), contains (case-insensitive) or missing. Conditions read text fields. Set can change title, description, brand, mpn, color, size, product_type and custom_label_0. Exclude stops processing. Priority is unique within a channel. Prices, currencies, stock and identifiers cannot be invented by rules.

## Feed files

google-tsv writes tab-separated Google attribute names. custom-csv writes the same base attributes with CSV quoting. Both apply the same conservative general-goods checks. CSV is for review or a separately mapped destination. Set up the correct destination and check shipping, tax, returns, landing-page parity and any category-specific fields before uploading. No upload or scheduled shop connection ships in this base.

Snapshot approval records review, not channel acceptance. Changes to shop, channel, active products or enabled rules invalidate the snapshot. Old observations block export even if the fingerprint is unchanged. File exports refuse to replace an existing file. Generated CSV is machine data: import it as text in a spreadsheet to avoid formula evaluation. JSON export includes all nine datasets, including originals and audit records. It is an interchange snapshot, not a tested restore tool.

PGlite supports one local process at a time. Use a managed Postgres database for shared operation, with scoped roles and authenticated access. The database owner bypasses row security; no public access policy is shipped. Do not expose the owner connection to a browser.
