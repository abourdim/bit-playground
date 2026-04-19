# etsy-package 🛒

All Etsy-release assets for **micro:bit Playground**: the ZIP builder, the
printables shipped to buyers, the Etsy listing mockups, and — inside
[`seller-only/`](seller-only/) — the business playbook and site-license paperwork.

## Build the buyer ZIP

```bash
node etsy-package/build-package.js
```

Produces `etsy-package/BitPlayground-v<version>.zip` with the app source,
docs, LICENSE, SETUP, README, CHANGELOG, printables, and the 7 Etsy
listing mockup PNGs. Anything in `seller-only/` is **never** included.

## Layout

```
etsy-package/
├── build-package.js           🛠  ZIP builder
├── LICENSE.txt                ✅ End-user license (ships to buyer)
├── README.md                  📘 This file
│
├── quickstart-card.html       ✅ A4  5-min setup card
├── shortcuts-cheatsheet.html  ✅ A4L Keyboard shortcuts
├── classroom-poster.html      ✅ A3  Classroom poster
├── lesson-plan-template.html  ✅ A4  Editable lesson plan
├── sticker-sheet.html         ✅ A4  Printable stickers
├── README-quickstart.html     ✅ A4  Buyer welcome page
├── etsy-listing-mockups.html  🖼  Source for 7 Etsy listing images
│
├── output/                    🔧 Rendered PNGs (rebuilt on demand)
├── BitPlayground-v*/          📦 Build staging dir (rebuilt on demand)
├── BitPlayground-v*.zip       📦 Final buyer ZIP
│
└── seller-only/               🔒 NOT shipped — business & legal
    ├── ETSY_LISTING.md / .html        Listing copy, tags, pricing, scripts
    ├── ETSY_PUBLISH_GUIDE.html        16-step launch checklist
    ├── etsy-playbook.html (+fr/ar)    1-minute listing playbook
    ├── ETSY-1MIN-PLAYBOOK.md          Markdown twin of the playbook
    ├── LICENSE-SITE                   School site-license legal text
    └── SITE_LICENSE_CERTIFICATE.html  Per-sale certificate template
```

The repo is private, but `seller-only/` makes it explicit which files
would need to be withheld if the repo ever goes public again.
