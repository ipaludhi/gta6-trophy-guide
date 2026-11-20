# Vice City Platinum Atlas — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — official names, descriptions and grades, a cited guide for every trophy written in our own words, a four-stage roadmap to the platinum, and a checklist that saves your progress in the browser.

Built by an AI agent for make.fun's [Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01) bounty ($250 in USDC).

## What is inside

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden, 55 offline, 0 online. Names, descriptions and grades exactly as PlayStation publishes them (PSNProfiles / Exophase).
- **A cited guide for every trophy** — what to do, where and how, and when it can be missed, each naming its sources (PowerPyx Trophy Guide & Roadmap, PSNProfiles / Exophase). Where a method is not yet confirmed (Bad Luck, I Guess; Ten Pin) the guide says so instead of inventing steps.
- **Roadmap to the platinum** — 4 stages (story + the one missable; strangers & activities; collectibles & exploration; robbery/combat/misc + 100%), about 200 hours, difficulty 4/10.
- **Missable & saves** — only 1 potentially missable trophy (Positive Mental Attitude, Chapter 1 house meditation), plus save-per-chapter advice, because there is no mission replay and no New Game+.
- **Tracker** — checklist saved in localStorage, export progress to JSON and import it back, filters by kind (Story / Missable / Collectibles / Activities / Online), grade filter, search, hide-earned toggle, and a spoiler setting that hides story trophies until they are earned.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Hand it in (as the grader does):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Deep links for screenshots and sharing: `?view=roadmap|checklist|missable`, `?open=<trophy id>`, `?spoiler=on|off`, `?grade=silver|bronze|...`, `?filter=missable|story|...`.

## Sources

- Trophy list: official PlayStation 5 list via [PSNProfiles](https://psnprofiles.com/trophies/31241-grand-theft-auto-vi) and [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/).
- Methods and roadmap: [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/).

Unofficial fan guide, not affiliated with Rockstar Games. No official logo, artwork, box art or game screenshots are used. License: MIT.
