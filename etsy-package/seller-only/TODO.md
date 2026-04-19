# Pre-launch manual TODOs

Things the build pipeline can't do for you. Review before hitting **Publish**
on Etsy.

---

## Before launch

### 🖼 Listing imagery

- [ ] **Shoot a real micro:bit photo** for the hero. Current hero
      (`etsy-mockups/etsy-mockup-1.png`) uses only an app screenshot.
      Reviewers flagged that listings with *physical hardware + the
      app together* convert better. Retake the hero with a micro:bit
      V2 held next to (or propped on top of) a laptop showing the
      Sensors tab. Good light, plain background, crop square.
- [ ] **Test Etsy's square thumbnail crop** on mockup 1. The canvas
      is 2000×1500 (4:3). Etsy will center-crop to square for the
      search thumbnail — make sure the product name and the
      "Chrome & Edge only" badge both survive that crop.
- [ ] **Add a dedicated compatibility infographic** as a new listing
      image (slot 2 or 3). Chrome/Edge ✅, Safari/iPhone ❌, with
      a visible "please check before buying" callout. Current
      compat badge on the hero is a start but a dedicated image
      is what actually lives in buyers' visual memory after they scroll.

### 🎬 Video

- [ ] Record the 60-second listing video following
      `seller-only/etsy-playbook.html` (EN). Upload as the listing
      video (Etsy allows one per listing, ≤100 MB, 1080p+).

### 📝 Listing copy

- [ ] Double-check every `{{PRICE}}` placeholder is filled in before
      pasting from `seller-only/ETSY_LISTING.md` into the Etsy form.
- [ ] Final sanity check: does the description's "what you get" list
      exactly match what `BitPlayground-v1.1.0.zip` actually contains?
      (Open the ZIP fresh and compare — mismatches = bad reviews.)

---

## After launch

### 📊 First week

- [ ] Monitor the Etsy listing's "Stats" tab daily for the first 7 days.
      If CTR on search < 1.2% → hero image is the problem. If CTR is
      fine but conversion < 1% → description or price is the problem.
- [ ] Reply to every message within 24 h (Etsy rewards fast sellers).
- [ ] Collect the first 5 reviews. Raise price from $12.99 → $17.99
      once you hit 5 ★ reviews (per `ETSY_LISTING.md` pricing ladder).

### 🔁 Ongoing

- [ ] Keep `LICENSE.txt` clause 4 (Updates) and the Etsy FAQ "Will it
      get updates?" in lockstep. Changing one without the other will
      get called out by buyers.
- [ ] When you bump the version, rebuild the ZIP (`npm run build:etsy`)
      AND update the attached file on the Etsy listing. Old buyers get
      the new version free from their purchase history.
