# Verification

2026-11-01: npm test passed on Linux with PGlite and PostgreSQL 17.11. Both exercised all 32 CLI commands with 64 assertions. PostgreSQL ran in a temporary local database and was stopped after the check. npm run demo, npm run view and npm run docs completed. The demo outputs in docs/demo/ are captured command results from fictional records.

The manual Verify workflow defines Linux and Windows PGlite jobs and a PostgreSQL 17 job. Its actual run result will be recorded after the private repository is pushed.
