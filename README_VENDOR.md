# unashi.com static renewal draft

This package is a static HTML/CSS/JS draft for replacing the current unashi.com corporate site.

## Intended publishing approach

- Replace the current PC/SP split pages with one responsive static site.
- Keep `/cases/` and `/ai-satei/` untouched if they already exist on the server.
- Connect the contact form to the existing mail/PHP handler after the current vendor files are provided.
- Confirm GA/GTM/Search Console tags before publishing.

## Important editable files

- `assets/js/site-data.js`: shared metrics and external links.
- `assets/css/styles.css`: design tokens and components.
- `.htaccess`: draft redirects and directory index settings.

## Pending vendor confirmation

- Current `index.php` device branching logic.
- Existing `.htaccess` rules.
- Form handler path and mail destination.
- Official company profile values: representative, address, capital.
- Whether `index.html` or `index.php` should be the production entrypoint.
