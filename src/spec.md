# Specification

## Summary
**Goal:** Add downloadable sample/template files to the Import Lists feature so users can download, fill, and re-upload CSV/XLSX files that match the app’s existing import formats.

**Planned changes:**
- Add a downloadable sample CSV template (with recognized header columns and a few example rows) as a static frontend/public asset.
- Add a downloadable sample Excel (.xlsx) template as a static frontend/public asset, matching current XLSX expectations (sheets named “Parties” and/or “Items”, header row first, data starting on row 2).
- Update the Import Lists card UI to include visible download control(s) for the templates and a brief English helper line explaining the templates match the supported CSV/XLSX formats already described.

**User-visible outcome:** Users can download a sample CSV and/or Excel template directly from the Import Lists card (no backend calls), fill it out, and upload it back into the app using the existing import flow.
