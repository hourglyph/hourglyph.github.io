#!/usr/bin/env python3
"""Generate .github/assets/hero.svg — the animated README hero.

The heatmap in the illustration is a stylised weekly pattern (weekday peak around the
US-morning / EU-afternoon overlap, calmer nights and weekends), not live data.
Pure SVG + SMIL (CSS animations do not run in <img>-rendered SVGs); follows light/dark.
"""
import math
from pathlib import Path

W, H = 1200, 440
CELL, GAP = 16, 4
STEP = CELL + GAP
GX, GY = 662, 150  # heatmap origin
DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
PEAK = (12, 18)   # UTC hours, weekday 5–11 AM Pacific
QUIET = (0, 6)


def intensity(day: int, hour: int) -> float:
    main = math.exp(-((hour - 15) ** 2) / (2 * 3.2 ** 2))
    eu_morning = 0.45 * math.exp(-((hour - 9) ** 2) / (2 * 2.2 ** 2))
    evening = 0.25 * math.exp(-((hour - 21) ** 2) / (2 * 2.5 ** 2))
    v = main + eu_morning + evening + 0.05
    if day >= 5:  # weekend
        v *= 0.38
    if day in (1, 2):  # Tue/Wed a touch busier
        v *= 1.08
    return v


# Every frame — including the very first, which is all some viewers ever show (GitHub mobile,
# editor previews, rasterisers) — is a complete picture. Motion only decorates it.
WAVE = 6  # seconds for the light wave to sweep the week


vals = [[intensity(d, h) for h in range(24)] for d in range(7)]
vmax = max(max(r) for r in vals)


def level(v: float) -> int:
    return max(1, min(5, math.ceil(v / vmax * 5 - 0.15)))


cells = []
for d in range(7):
    for h in range(24):
        x, y = GX + h * STEP, GY + d * STEP
        begin = h * 0.12 + d * 0.04
        cells.append(
            f'<rect class="c{level(vals[d][h])}" x="{x}" y="{y}" width="{CELL}" height="{CELL}" rx="4">'
            f'<animate attributeName="opacity" values="1;.35;1;1" keyTimes="0;.07;.18;1" dur="{WAVE}s" '
            f'begin="{begin:.2f}s" repeatCount="indefinite"/></rect>'
        )

day_labels = "".join(
    f'<text class="axis" x="{GX - 12}" y="{GY + d * STEP + 12}" text-anchor="end">{name}</text>'
    for d, name in enumerate(DAYS)
)
hour_labels = "".join(
    f'<text class="axis" x="{GX + h * STEP}" y="{GY - 12}">{h:02d}</text>' for h in (0, 6, 12, 18)
)


def bracket(h0: int, h1: int, label: str, cls: str) -> str:
    x0, x1 = GX + h0 * STEP, GX + h1 * STEP - GAP
    y = GY - 34
    return (
        f'<g class="bracket {cls}">'
        f'<path d="M{x0} {y + 6} V{y} H{x1} V{y + 6}" fill="none" stroke-width="1.5" stroke-linecap="round"/>'
        f'<text x="{(x0 + x1) / 2}" y="{y - 8}" text-anchor="middle">{label}</text></g>'
    )


scan_x = ";".join(str(GX + h * STEP - 3) for h in range(24))
legend_x = GX + 24 * STEP - GAP - 6 * 20 - 4
legend = "".join(
    f'<rect class="c{i}" x="{legend_x + 44 + i * 18}" y="{GY + 7 * STEP + 18}" width="12" height="12" rx="3"/>'
    for i in range(6)
)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="t d">
<title id="t">Hourglyph — Claude Code peak hours</title>
<desc id="d">An hourglass next to a weekly heatmap of Claude Code usage: a busy weekday peak and quiet night and weekend hours.</desc>
<style>
  .bg {{ fill: #faf9f5; }} .frame {{ fill: none; stroke: #e8e6dc; }}
  .ink {{ fill: #141413; }} .muted {{ fill: #73726c; }} .axis {{ fill: #9a988f; font: 500 11px -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; }}
  .accent {{ fill: #d97757; }} .glass {{ fill: none; stroke: #141413; stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; }}
  .sand {{ fill: #d97757; }} .stream {{ stroke: #d97757; stroke-width: 2.5; stroke-dasharray: 3 5; }}
  .c0 {{ fill: #efede4; }} .c1 {{ fill: #f6ddd1; }} .c2 {{ fill: #efbda6; }} .c3 {{ fill: #e59a7c; }} .c4 {{ fill: #d97757; }} .c5 {{ fill: #a9472a; }}
  .serif {{ font-family: "Source Serif 4", Georgia, "Times New Roman", serif; }}
  .sans {{ font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; }}
  .chip {{ fill: #f0eee6; }} .chip-t {{ fill: #3d3d3a; font: 500 13px -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; }}
  .scan {{ fill: none; stroke: #141413; stroke-width: 2; }}
  .bracket text {{ font: 600 12px -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; letter-spacing: .08em; text-transform: uppercase; }}
  .peak path {{ stroke: #c6613f; }} .peak text {{ fill: #c6613f; }}
  .quiet path {{ stroke: #6a9b6a; }} .quiet text {{ fill: #5c8a5c; }}

  @media (prefers-color-scheme: dark) {{
    .bg {{ fill: #262624; }} .frame {{ stroke: #3e3e39; }} .ink {{ fill: #faf9f5; }} .muted {{ fill: #a6a39a; }} .axis {{ fill: #7d7b73; }}
    .glass {{ stroke: #faf9f5; }} .scan {{ stroke: #faf9f5; }} .chip {{ fill: #30302e; }} .chip-t {{ fill: #e5e3da; }}
    .c0 {{ fill: #34332f; }} .c1 {{ fill: #4b3630; }} .c2 {{ fill: #6d4333; }} .c3 {{ fill: #955239; }} .c4 {{ fill: #c4653f; }} .c5 {{ fill: #ef9a74; }}
    .peak path {{ stroke: #e08a6b; }} .peak text {{ fill: #e08a6b; }} .quiet path {{ stroke: #8fbf8f; }} .quiet text {{ fill: #8fbf8f; }}
  }}
</style>

<rect class="bg" width="{W}" height="{H}" rx="28"/>
<rect class="frame" x=".5" y=".5" width="{W - 1}" height="{H - 1}" rx="28"/>

<!-- Hourglass: sand drains from the top bulb into the bottom one -->
<g transform="translate(72 88)">
  <clipPath id="top"><rect x="0" y="0" width="64" height="40"><animate attributeName="y" values="4;40" dur="5s" repeatCount="indefinite"/></rect></clipPath>
  <clipPath id="bottom"><rect x="0" y="80" width="64" height="40"><animate attributeName="y" values="78;46" dur="5s" repeatCount="indefinite"/></rect></clipPath>
  <path class="sand" d="M10 8 H54 L32 38 Z" clip-path="url(#top)"/>
  <path class="sand" d="M32 44 L54 76 H10 Z" clip-path="url(#bottom)" opacity=".85"/>
  <line class="stream" x1="32" y1="38" x2="32" y2="74"><animate attributeName="stroke-dashoffset" from="0" to="-8" dur=".6s" repeatCount="indefinite"/></line>
  <path class="glass" d="M6 2 H58 M6 82 H58 M10 2 C10 26 28 30 30 41 C28 52 10 58 10 82 M54 2 C54 26 36 30 34 41 C36 52 54 58 54 82"/>
</g>

<g>
  <text class="ink serif" x="72" y="236" font-size="64" font-weight="500" letter-spacing="-1">Hourglyph</text>
</g>
<g>
  <text class="ink serif" x="72" y="280" font-size="24">When is Claude Code busiest?</text>
  <text class="muted sans" x="72" y="314" font-size="17">Work in the quiet hours and make your limits last longer.</text>
</g>
<g>
  <rect class="chip" x="72" y="342" width="118" height="30" rx="15"/><text class="chip-t" x="131" y="362" text-anchor="middle">live heatmap</text>
  <rect class="chip" x="198" y="342" width="124" height="30" rx="15"/><text class="chip-t" x="260" y="362" text-anchor="middle">18 time zones</text>
  <rect class="chip" x="330" y="342" width="82" height="30" rx="15"/><text class="chip-t" x="371" y="362" text-anchor="middle">EN · RU</text>
  <rect class="chip" x="420" y="342" width="96" height="30" rx="15"/><text class="chip-t" x="468" y="362" text-anchor="middle">open data</text>
</g>

<!-- Weekly heatmap (stylised) -->
{day_labels}
{hour_labels}
{"".join(cells)}
{bracket(*PEAK, "peak", "peak")}
{bracket(*QUIET, "quiet", "quiet")}

<!-- "Now" marker sweeping through the day -->
<rect class="scan" x="{GX + 15 * STEP - 3}" y="{GY - 3}" width="{CELL + 6}" height="{7 * STEP - GAP + 6}" rx="6">
  <animate attributeName="x" values="{scan_x}" calcMode="discrete" dur="12s" begin="1s" repeatCount="indefinite"/>
</rect>

<g>
  <text class="axis" x="{legend_x + 36}" y="{GY + 7 * STEP + 28}" text-anchor="end">Less</text>
  {legend}
  <text class="axis" x="{legend_x + 44 + 6 * 18 + 4}" y="{GY + 7 * STEP + 28}">More</text>
  <text class="axis" x="{GX}" y="{GY + 7 * STEP + 28}">UTC · weekday × hour</text>
</g>
</svg>
'''

out = Path(__file__).resolve().parent.parent / ".github" / "assets" / "hero.svg"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(svg)
print(f"wrote {out} ({len(svg) // 1024} KB)")
