# Threadline

Threadline is a small, local-first resale listing studio inspired by multichannel listing workflows. Add an item once, choose the marketplaces you plan to list it on, and keep a lightweight overview of active listings, drafts, and sold pieces.

## Run locally

No build step or package install is required. Open `index.html` in a modern browser, or serve this folder with any static file server. For example:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## What works

- Create listings with brand, category, size, condition, price, and marketplace selections.
- Prepare copy-ready listing text and open the selected marketplace's manual listing page.
- Save active listings or keep them as drafts.
- Search, sort, and filter the closet; update listings between active, draft, and sold.
- See listing, asking-price, and sold-item totals.
- Persist changes in this browser using `localStorage`.
- Responsive layout for desktop and mobile screens.

The initial closet is sample content for preview. Assisted publishing copies your listing details and opens the marketplace listing page for eBay, Poshmark, Depop, or Mercari. You must sign in, upload photos, review the form, and submit it yourself; Threadline cannot verify that a marketplace accepted a listing. It does not use marketplace APIs. Data stays in the current browser and is not synced between devices.

## Reset sample data

Clear the `threadline.listings.v1` entry from this site's local storage in browser developer tools. Reloading after removing that entry restores the sample closet.
