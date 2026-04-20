# micro:bit V2 Acrylic Desk Stand — Laser-Cut Files

Two-piece flat-pack desk stand designed for **3 mm acrylic**. Assembles in
under a minute, no glue needed — friction fit via the tab/slot joint.

## Files

- `stand-3mm.svg` — cut file for LightBurn, xTool Creative Space,
  Glowforge, LaserGRBL, most commercial laser software.
- `stand-3mm.dxf` — DXF twin for older CNC software that doesn't
  accept SVG.

## Pieces (190 × 83 mm sheet)

| Piece | Dimensions | Role |
|---|---|---|
| BASE | 100 × 70 mm | Platform with upright slot + cable notch |
| UPRIGHT | 70 × 70 mm (+3 mm tab) | Vertical panel with micro:bit window |

**Window cutout** on upright: 46 × 37 mm — slightly smaller than
the micro:bit V2 (52 × 43 mm) so a 3 mm bezel holds the board visually.
4 × Ø3.6 mm corner holes are provided for M3 screws if you want positive
fastening instead of friction.

## Laser settings (starting points)

Every laser is different. For **3 mm cast clear acrylic**:

- **K40-class CO2 (40 W)**: 10 mm/s @ 70 % power, 1-2 passes
- **xTool D1 (10 W diode)**: Acrylic is opaque to blue — paint matte black first
- **Glowforge Plus/Pro**: "Proofgrade clear acrylic 3 mm" preset

**Always test-cut on a 10 mm offcut first.** Acrylic varies in thickness;
if your tab doesn't seat flush, add 0.1 mm to the slot width and re-cut.

## Assembly

1. Remove the masking paper from both pieces.
2. Hold the UPRIGHT vertical, BASE flat below it.
3. Guide the UPRIGHT's bottom tab into the BASE's central slot.
4. Press firmly — a small click means seated.
5. Slide the micro:bit V2 into the window from above. The 3 mm bezel
   holds it; the USB cable slot at the base runs the cable cleanly away.

## Customization

Regenerate with a different material thickness:

```
node etsy-package/tools/generate-stand-svg.mjs 5     # for 5 mm acrylic
```

All joints auto-scale to the new thickness.

## Licensing

These files ship under the same license as the parent Etsy product. Free
use by the buyer for personal classroom use. Commercial resale of the
cut stand is not permitted.
