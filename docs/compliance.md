# Feed checks, sources and limits

Checked 2026-11-01. The compliance command checks stored catalogue values against a supported subset of channel requirements. It does not certify consumer-law compliance, validate live store prices or guarantee channel approval.

| Check | Implemented behaviour | Source |
|---|---|---|
| ID, TITLE, DESCRIPTION | Require nonempty identifiers and text within supported length limits | [Product data specification](https://support.google.com/merchants/answer/7052112?hl=en) |
| LINK, IMAGE | Require absolute HTTP or HTTPS addresses; reject embedded credentials | Same specification, product link and image link attributes |
| PRICE, CURRENCY | Require a positive price and shop currency, formatted with its currency code | [Price attribute](https://support.google.com/merchants/answer/6324371?hl=en) |
| AVAILABILITY, CONDITION | Check supported values | Product data specification |
| IDENTIFIERS, GTIN | Check missing identifiers and GTIN length/check digit; flag a conflicting exemption | [Unique product identifiers](https://support.google.com/merchants/answer/6324461?hl=en) |
| FRESHNESS | Block observations older than the shop policy, default 48 hours | Local business policy, not a Google deadline |
| STOCK_CONFLICT | Block in-stock records with zero quantity | Local consistency rule supporting accurate availability |
| AVAILABILITY_DATE, APPAREL_REVIEW | Block categories needing fields this base does not export | Product data specification |
| DELIMITERS | Require tabs and line breaks to be normalised before local export | Local file-format restriction |

A valid check digit does not prove a GTIN was assigned to that product. Brand and MPN are accepted for review where appropriate; an assigned GTIN must still be supplied. Do not invent an identifier or use identifier_exists=false just to remove an error.

Positive prices only is a conservative local restriction; this base does not implement every special pricing case. Currency is NZD for NZ shops and AUD for AU shops. No currency conversion occurs.

Human review still covers the live landing-page price and availability, GST and tax display, shipping and returns settings, image quality, restricted goods, category-specific attributes and manufacturer identifier assignment. The CLI neither visits the store nor uploads to Merchant Center. A release review records a person's assertion only. Actor labels are not authenticated identities.

For AU and NZ product feeds, check the destination requirements for your actual goods and country before delivery. Additional legal or industry checks require a separately scoped rule with its own cited source.
