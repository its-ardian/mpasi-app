# MPASI — Resep & Rencana Makan Bayi

A mobile-first PWA (installable web app) for MP-ASI recipes, weekly meal
planning, grocery lists, and an eating/reaction tracker for babies and
toddlers. Recipe data is sourced from Kementerian Kesehatan RI (2023) and
a supplementary MPASI recipe deck — see `data-pipeline/` for provenance.

No backend. All user data (baby profiles, favorites, meal plan, grocery
checklist, eating log) lives in the browser's `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL. Resize your browser to a phone width (or open
dev tools' device toolbar) to see it as intended — it's built mobile-first.

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In the repo settings → **Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the Actions tab).
   `.github/workflows/deploy.yml` builds and deploys automatically on
   every push.
4. Your app will be live at `https://<username>.github.io/<repo-name>/`.

### Making it feel like a mobile app

Once deployed, open the URL on a phone and use the browser's
**"Add to Home Screen"** option (Safari: Share → Add to Home Screen;
Chrome: menu → Add to Home Screen / Install app). It will then launch
full-screen with its own icon and no browser chrome — this is what
`public/manifest.json` and `public/sw.js` (the service worker) are for.
The service worker also caches the app shell so it keeps working offline
after the first visit.

## Adding more recipe sources

Recipe data isn't edited directly inside `src/data/`. It's generated from
`data-pipeline/`:

```
data-pipeline/
  kemenkes_2023_recipes.json   # source 1
  mpasi_recipes.json           # source 2
  merge_sources.py             # combines all sources -> combined_recipes.json
  SOURCE_SCHEMA.md             # format spec for new source files
```

To add a new source:

1. Extract/transcribe it into a new JSON file following the schema in
   `data-pipeline/SOURCE_SCHEMA.md`.
2. Drop it into `data-pipeline/`.
3. Run:
   ```bash
   cd data-pipeline
   python3 merge_sources.py
   cp combined_recipes.json ../src/data/combined_recipes.json
   ```
4. Rebuild/redeploy. The new recipes now appear throughout the app.

This is intentionally a build-time step, not a live in-app upload feature —
recipe content (ingredients, steps, allergens) should get a human review
pass before it ships in an app aimed at feeding babies.

## Project structure

```
src/
  data/combined_recipes.json   # bundled at build time, the app's only "database"
  lib/
    recipes.js                 # query/filter helpers over the recipe data
    age.js                     # birthdate -> age-in-months -> age_stage / texture step
    storage.js                 # localStorage read/write helpers
  components/
    RecipeLibrary.jsx          # browse/search/filter
    RecipeDetail.jsx           # single recipe view
    MealPlanner.jsx            # weekly planner + recipe picker
    GroceryList.jsx            # auto-generated from the meal plan
    Tracker.jsx                # eating/reaction log
    Profile.jsx                # baby profiles, age, allergies
    TextureDial.jsx            # signature UI element: disaring -> ... -> masakan biasa
    BottomNav.jsx / Icons.jsx
  App.jsx                      # tab routing + top-level state/persistence
```

## Known gaps (see also `data-pipeline/SOURCE_SCHEMA.md`)

- 38 recipes is a starting library, not a complete one — plan more source
  extractions before a public launch.
- `allergens` on each recipe are inferred from ingredients, not stated
  explicitly by the original sources. Get these reviewed by someone with
  nutrition/allergy expertise before relying on them for safety filtering.
- No food photography (out of scope for this pass).
- This app is not medical advice. It says so in the UI, but worth
  restating: always defer to a pediatrician for allergies, reactions, or
  growth concerns.
