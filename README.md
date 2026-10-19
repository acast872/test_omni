# ListNexus

ListNexus is a responsive resale-listing studio. Organize an item once, prepare assisted marketplace posts, and use Gemini to draft clearer listing titles and descriptions from facts you provide.

## Run locally or in Codespaces

Requires Node.js 18 or later. Install no packages; the app uses built-in Node modules.

```sh
npm start
```

Open `http://localhost:3000`. In Codespaces, forward port `3000` and keep its visibility private. The AI endpoint spends the configured Gemini API quota, so do not expose this server publicly without adding authentication and abuse protection appropriate for deployment. For local-only binding, run `HOST=127.0.0.1 npm start` (PowerShell: `$env:HOST='127.0.0.1'; npm start`).

## Configure Gemini in Codespaces

1. Add `GEMINI_API_KEY` under GitHub **Settings → Secrets and variables → Codespaces**.
2. Restart the Codespace so the secret is available to its processes.
3. Start ListNexus with `npm start`.

The key is read only by `server.js` from the process environment. It is never sent to the browser, written into app storage, or logged. Optionally set `GEMINI_MODEL` to a supported Gemini model; the default is `gemini-2.5-flash`. Without `GEMINI_API_KEY`, normal listing features work and the AI action explains that it is not configured.

## What works

- Create listings with brand, category, size, condition, description, price, and marketplace selections.
- Ask Gemini to improve a title and description; review and edit its suggestions before saving.
- Prepare copy-ready listing text and open the selected marketplace's manual listing page.
- Save active listings or drafts; search, sort, filter, and track sold items.
- Persist listing data in this browser using `localStorage`.
- Use the responsive interface on desktop and mobile screens.

Gemini receives the listing details you submit for the AI action. Its prompt directs it not to invent product facts, but you should still verify all generated copy. Assisted marketplace publishing does not use marketplace APIs: you sign in, add photos, review, and submit on eBay, Poshmark, Depop, or Mercari yourself. The app cannot confirm that a marketplace accepted a post. Listing data remains in the current browser and does not sync between devices.

The initial closet is sample content for preview. The app migrates existing saved listings from the previous `threadline.listings.v1` browser-storage key to `listnexus.listings.v1` when you next save a listing.

## Checks

```sh
npm run check
npm test
```
