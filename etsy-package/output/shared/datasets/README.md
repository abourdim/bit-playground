# Synthetic sensor-data corpus (100 CSVs)

Auto-generated plausible micro:bit sensor sessions. **No real hardware required** —
teach data-analysis directly from these files.

## Format

Every CSV is three columns:

```
timestamp_ms,sensor,value
0,temp,21.87
100,temp,21.92
100,light,145
...
```

Import into Excel, Google Sheets, Python/pandas, or back into the
`Graph` tab of micro:bit Playground via its "Load CSV" button.

## Scenarios

| Scenario | Files | Typical use |
|---|---|---|
| `classroom-ambient` | 15 | Baseline noise analysis |
| `afternoon-sun` | 8 | Trend + correlation (temp ↔ light) |
| `morning-cold` | 6 | Same, reversed direction |
| `dropped-board` | 10 | Event detection / impact physics |
| `shake-tilt-sequence` | 12 | FFT / periodicity |
| `sound-detective` | 10 | Threshold detection |
| `compass-walk-north` | 9 | Circular data, drift analysis |
| `button-presses` | 10 | Event-count histograms |
| `5-second-bursts` | 20 | Quick-look examples for lesson starters |

Total: 106 700 data points.

## Lesson starter ideas

1. **Plot & interpret** — load a `classroom-ambient` CSV, plot light vs time,
   discuss measurement noise.
2. **Find the event** — open a `dropped-board` CSV, have students identify
   the impact millisecond.
3. **Compare days** — side-by-side plot of `afternoon-sun` vs `morning-cold`.
4. **Frequency hunting** — import `shake-tilt-sequence` into a spreadsheet,
   compute the Fourier transform, find the shake frequency.

## Regenerate

```
node etsy-package/tools/generate-datasets.mjs [count]
```

Defaults to 100 files.
