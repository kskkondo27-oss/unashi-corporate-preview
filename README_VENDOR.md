# unashi.com static renewal draft

This package is a static HTML/CSS/JS draft for replacing the current unashi.com corporate site.

## Intended publishing approach

- Replace the current PC/SP split pages with one responsive static site.
- Publish the YouTube M&A deal platform under `/market/`.
- Redirect legacy `/cases/` traffic to `/market/` unless the production server has a different confirmed requirement.
- Keep `/ai-satei/` untouched if it already exists on the server.
- Do not reuse the current LP builder / Slideflow contact form endpoint after the LP builder contract ends.
- Recommended contact form setup: create a Formspree form whose target email is `info@unashi.com`, then paste the issued endpoint into `assets/js/site-data.js` under `form.endpoint`.
- Confirm GA/GTM/Search Console tags before publishing.

## Important editable files

- `assets/js/site-data.js`: shared metrics and external links.
- `assets/css/styles.css`: design tokens and components.
- `market/index.html`: YouTube M&A deal list page. This should be indexable in production.
- `market/deal.html`: YouTube M&A deal detail page. Keep `noindex`.
- `market/assets/app.js`: deal rendering, filters, inquiry behavior, and chart logic.
- `market/data/deals.js`: fallback deal data when Google Sheets CSV is not configured.
- `FORM_SETUP.md`: contact form setup steps for Formspree.
- `.htaccess`: draft redirects and directory index settings.

## Pending vendor confirmation

- Current `index.php` device branching logic.
- Existing `.htaccess` rules.
- Formspree endpoint and target email delivery test.
- Market platform config: `LINE_OA_ID`, `SHEET_CSV_URL`, and `INQUIRY_ENDPOINT` in `market/index.html` and `market/deal.html`.
- Official company profile values: representative, address, capital.
- Whether `index.html` or `index.php` should be the production entrypoint.
