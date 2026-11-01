# Replace the feed preparation part of DataFeedWatch

Checked 2026-11-01. DataFeedWatch documents a full-source CSV download under the store Options menu, Download your products: https://www.datafeedwatch.com/blog/check-source-feed . It also documents output downloads: https://www.datafeedwatch.com/blog/check-data-feed-before-sending-shopping-channel . Prefer the source catalogue; an output file can already exclude products or transform their values.

## Cutover

1. Keep DataFeedWatch active while you prepare the replacement. Download the entire source catalogue as CSV UTF-8, with comma separators. Record when its stock and price values were observed. Do not use the file download time if the source is older.
2. Create a fresh database, run migrate, add the shop and channel, then map the source headings. The importer defaults to sku or id, title, description, price, currency, availability, link or url, image_link or image, brand, gtin, mpn, identifier_exists, condition, item_group_id, color, size, product_type, custom_label_0 and quantity. A numeric price inherits the shop currency; a price such as 129.00 NZD carries its currency. Conflicting currency values reject the import.
3. Preview and import with one command. The checked-in fixture is fictional. DataFeedWatch source headings vary by store; the fixture is a supported mapping, not a vendor-wide export specification.

```bash
npm run feeds -- import datafeedwatch --shop=KORU --file=imports/source.csv --map=imports/mapping.json --observed-at=2026-11-01T00:00:00Z --dry-run --actor="Alex"
```

Use your actual observation time. Omit --map when the headings already match. A mapping file is an object from target field to exact source heading, for example {"sku":"Variant SKU","title":"Product Name","price":"Selling Price"}. After checking the preview, repeat without --dry-run.

4. Rebuild your channel rules and check the resulting product list. Compare counts, identifier coverage, availability, prices, currencies and exclusions with the original. Run feed-check and exclusion-review, compile a snapshot and inspect run-change. A reviewed, error-free snapshot can be exported locally. Connect delivery and confirm destination acceptance separately before cancelling the incumbent.

## What carries over

Products match by shop and SKU. Original source columns remain in source_payload. Imports are atomic, dry runs roll back, repeated identical observations are unchanged, changed rows keep before/after history, and older observations are rejected. Missing columns preserve existing fields on updates; explicit blank cells clear the mapped field. Missing products are not automatically archived. Review removals and archive deliberately.

## What needs separate work

A product CSV does not contain rule definitions, previous rule versions, historical feed failures, account access, channel credentials, schedules or managed-service commitments. Rebuild and test rules, map destination-specific fields and arrange delivery separately. Additional source columns are retained as evidence but are not automatically exported. XML and Excel inputs need conversion to CSV first. Apparel, preorder and backorder need additional fields and validation before this base can release them. Custom CSV uses the supported base fields, not every marketplace format.

Import generated CSV files as text when using a spreadsheet. These are machine files and values can start with characters that spreadsheet programs interpret as formulas. Keep business exports in imports/ or exports/, which Git ignores.
