# etsy-package 🔒

Seller-only assets + ZIP builder for the Etsy release of **micro:bit Playground**.

Mirrors the `noor-cast/etsy-package/` pattern: everything commercial lives here,
gitignored so it never leaks into the public repo.

## Build the buyer ZIP

```bash
node etsy-package/build-package.js
```

Produces `etsy-package/BitPlayground-v1.1.0.zip` containing the app source,
docs, LICENSE, SETUP, README, CHANGELOG, printables, and Etsy listing
mockups. Seller-only files (below) are **never** included in the ZIP.

## Files in this folder

| File | Ships in ZIP? | Purpose |
|------|---------------|---------|
| `build-package.js`                | — (tool)      | ZIP builder script |
| `LICENSE.txt`                     | ✅ buyer      | End-user license shipped to buyer |
| `quickstart-card.html`            | ✅ printable  | A4 5-minute setup card |
| `shortcuts-cheatsheet.html`       | ✅ printable  | A4 landscape keyboard shortcuts |
| `classroom-poster.html`           | ✅ printable  | A3 classroom poster |
| `lesson-plan-template.html`       | ✅ printable  | A4 editable lesson plan |
| `sticker-sheet.html`              | ✅ printable  | A4 printable stickers |
| `README-quickstart.html`          | ✅ printable  | A4 buyer welcome page |
| `etsy-listing-mockups.html`       | — (source)    | Source for 7 Etsy listing images |
| `ETSY_LISTING.md` / `.html`       | ❌ private    | Full business playbook |
| `ETSY_PUBLISH_GUIDE.html`         | ❌ private    | 16-step launch checklist |
| `LICENSE-SITE`                    | ❌ private    | School site-license legal text |
| `SITE_LICENSE_CERTIFICATE.html`   | ❌ private    | Per-sale certificate template |

The entire `etsy-package/` folder is gitignored — none of these files ever
reach the public repo.
