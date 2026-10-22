# Zhibe-Aubakirova-culs-frontend-final

**Author:** Zhibek Aubakirova

**Website:** The Little Herb Garden

An educational, responsive website about herbs for cooking, tea and pollinators, with a guide to four well-known gardens in Prague. The interface and plant descriptions are in English.

## Features

- Eight herb cards: basil, spearmint, rosemary, thyme, lavender, sage, chamomile and chives.
- Seasonal filters with a live count of matching plants.
- A shared detail view for every herb, including its botanical name, illustration, facts, growing tips, uses and video.
- A Visit section with photographs, Czech names, neighbourhoods, descriptions and Google Maps links for four Prague gardens.
- Hash-based navigation: individual plants can be bookmarked and opened directly.
- Responsive layouts, keyboard navigation, loading messages and error handling.

## Technology

The project uses HTML5, CSS and vanilla JavaScript. Data is stored in local JSON files and loaded using the browser's Fetch API. CSS Grid and Flexbox handle layout.

There is no framework, backend, database, build step or project-specific dependency installation. Node.js is used to run a local static web server through `serve`.

## Run locally

1. Install Node.js with npm, if needed.
2. Open a terminal in the project directory: the folder containing `index.html` and `app.js`.
3. Start the server:

   ```sh
   npx --yes serve -l 3000
   ```

4. Open <http://localhost:3000> or the address printed in the terminal.
5. Keep the terminal running while using the website. Stop the server with `Ctrl+C`.

The first run may download `serve` and therefore requires an internet connection. If port 3000 is occupied, use `npx --yes serve -l 3001` and open the address printed by the server.

Do not open `index.html` by double-clicking it: browsers may block JSON requests under the `file://` protocol. Use an HTTP server.

## Project structure

```text
index.html             Document shell, navigation and garden HTML templates
app.js                 Routing, data loading, filtering and rendering
style.css              Shared colours, typography, cards and responsive layouts
README.md              Project documentation
images/                Local SVG logo, garden and herb illustrations
data/
  herbs.json           Summary cards and seasonal availability
  gardens.json         Prague garden cards, photograph URLs and map links
  basil.json           Basil detail data
  chamomile.json       Chamomile detail data
  chives.json          Chives detail data
  lavender.json        Lavender detail data
  rosemary.json        Rosemary detail data
  sage.json            Sage detail data
  spearmint.json       Spearmint detail data
  thyme.json           Thyme detail data
```

All plant pages use `index.html` and `app.js`. Lavender uses the same renderer as the other herbs; it has no separate HTML or JavaScript file.

## Navigation and rendering

| URL fragment | Display |
| --- | --- |
| No fragment | Home page with herbs, Visit and About |
| `#herbs` | Home page focused on the herb list |
| `#visit` | Home page focused on the Prague gardens section |
| `#about` | Home page focused on About |
| `#lavender` | Lavender details |
| `#basil`, `#thyme`, etc. | Details for the matching herb ID |

For example, open <http://localhost:3000/#lavender> or <http://localhost:3000/#visit>.

`show()` runs when the application starts and when the URL fragment changes. Home routes render the main sections and load the herb list and Prague gardens. Other fragments request `data/<id>.json` and use the shared detail layout. Browser Back and Forward work with these fragment changes.

The Visit section and its cards use the `visit-template` and `garden-card-template` HTML templates in `index.html`. `renderGardens()` clones those templates and fills their contents from JSON. Other home sections and the herb detail layout are generated in `app.js`.

The growing-guide link scrolls within the current plant view while preserving the plant's URL fragment. Returning to `#herbs` rebuilds the home view and resets its filters.

## Seasonal filtering

Each herb lists its usual growing or harvesting seasons. The current season is calculated from the browser's local month using Northern Hemisphere meteorological seasons:

| Season | Months |
| --- | --- |
| Spring | March–May |
| Summer | June–August |
| Autumn | September–November |
| Winter | December–February |

The checkbox filters for the current season. The dropdown filters for a selected season. When both are active, a herb must match both conditions. The count updates when filters change, including when no plants match.

Seasonal availability is a general estimate, rather than live weather or stock information.

## JSON data reference

Keep JSON files encoded as UTF-8. Use double quotes and avoid comments and trailing commas.

### Herb summaries: `data/herbs.json`

The file contains an array of objects:

```json
{
  "id": "basil",
  "name": "Basil",
  "latin": "Ocimum basilicum",
  "use": "Tomatoes, pesto and anything summery.",
  "life": "annual",
  "seasons": ["summer"]
}
```

| Field | Purpose |
| --- | --- |
| `id` | Unique URL fragment and detail filename, without `.json` |
| `name` | Common name displayed on the card |
| `latin` | Botanical name |
| `use` | Short description of uses |
| `life` | Life cycle label, such as `annual` or `perennial` |
| `seasons` | Array containing `spring`, `summer`, `autumn` and/or `winter` |

### Herb details: `data/<id>.json`

| Field | Type | Purpose |
| --- | --- | --- |
| `name` | string | Main heading |
| `latin` | string | Botanical name |
| `description` | string | Introduction |
| `img.src` | string | Illustration URL or relative path |
| `img.alt` | string | Image description for accessibility |
| `img.caption` | string | Visible image caption |
| `facts` | array of objects | Each item has a `label` and `value` |
| `grow` | array of strings | Growing-guide bullet points |
| `enjoy` | array of strings | Uses and enjoyment bullet points |
| `video.url` | string | Link to the video's watch page |
| `video.embedurl` | string | Embeddable video player URL |
| `video.title` | string | Accessible iframe title |
| `gardenNote` | optional string | Additional text before the return-to-garden link |

The detail filename must match the summary's `id`. For example, `lavender` loads `data/lavender.json`. Use a YouTube embed URL for `video.embedurl`, rather than a standard watch-page URL.

### Prague gardens: `data/gardens.json`

The file contains an array of garden objects. Their array order determines their display order.

| Field | Purpose |
| --- | --- |
| `name` | English garden name |
| `localName` | Czech name |
| `area` | Prague neighbourhood |
| `description` | Short introduction |
| `image` | Photograph URL |
| `imageAlt` | Accessible photograph description |
| `map` | Google Maps link for this garden |
| `source` | Prague City Tourism page linked below the card |

The current entries cover Wallenstein Garden, Vrtba Garden, Prague Castle Gardens and Franciscan Garden. Photograph URLs point to the Prague City Tourism CDN; the photographs are not stored locally.

## Update or extend the content

### Add a herb

1. Add a summary object to the array in `data/herbs.json` with a unique lowercase `id`.
2. Copy an existing herb detail JSON file to `data/<id>.json`.
3. Update all detail fields, including image descriptions and video links.
4. Add its illustration to `images/` and set `img.src` to its relative path.
5. Refresh the page, check the new card and open `#<id>` directly.
6. Check that its seasons behave correctly under both filters.

Avoid the reserved IDs `herbs`, `visit` and `about`, which open home sections. No new HTML page or JavaScript file is needed.

### Add or update a Prague garden

1. Edit an existing entry or add an object to `data/gardens.json`.
2. Provide all fields listed above, including a real photograph and a map link for that specific location.
3. Open `#visit` and check the image, text, source link and map destination.

The renderer supports additional entries automatically. Edit `garden-card-template` in `index.html` to change the shared card markup, and the `.garden-*` rules in `style.css` to change its appearance. Update the introductory text if the number of featured gardens changes.

### Change the design

Shared colours are defined as CSS custom properties in `:root`. The existing `.card`, `.cards`, `.latin` and `.eyebrow` styles keep plant and garden content consistent. Garden cards use one column on narrow screens and two columns from `40rem` upwards.

## Accessibility and error handling

- A keyboard skip link moves focus to the main content.
- Visible focus indicators help keyboard users follow navigation.
- Section navigation and herb details move focus to the relevant heading; initial home loading does not automatically focus its heading.
- Images have alternative text; failed images are replaced with an accessible fallback.
- Status messages announce loading results and filter counts.
- Facts use definition lists, and growing advice and uses use bullet lists.
- Video iframes have titles and accompanying watch-page links.
- Failed herb-list requests display an error view. Missing herb detail files display “Herb not found”; other detail failures display a loading-error message.
- A failed garden request displays an error inside Visit while leaving the rest of the home page available.

JavaScript is required to render the main content. Internet access is needed for external garden photographs, YouTube videos and map destinations. Local herb data and SVG illustrations are served from this project.

## Manual verification

After changing the project:

1. Start the local server and open the home page.
2. Confirm that all eight herbs appear and both seasonal filters work together.
3. Open a herb, check its image, facts, growing guide, uses and video link, then return to the list.
4. Open `#lavender` directly and check browser Back and Forward.
5. Open `#visit` and check all four garden photographs, source links and map destinations.
6. Try a narrow window and keyboard navigation using Tab and Enter.
7. Open an unknown fragment such as `#unknown-herb` and confirm the missing-herb message.
8. Check the browser console and Network panel for unexpected errors.

A basic JavaScript syntax check can be run from the project directory:

```sh
node --check app.js
```

There is currently no automated test suite or npm test command.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `ERR_CONNECTION_REFUSED` | Start the server, keep its terminal open and use the port printed by `serve`. |
| JSON fails to load | Use HTTP instead of `file://`; check the filename and JSON syntax. |
| Herb not found | Match the fragment, summary `id` and detail filename exactly. |
| Old content remains visible | Refresh the page; use a hard refresh if cached assets persist. |
| Garden photograph is unavailable | Check internet access and the external `image` URL; update it if the source changes. |
| Video cannot play | Check the embed URL; availability also depends on YouTube and the video's embedding settings. |

## Content sources

Garden cards link to their individual pages on [Prague City Tourism](https://prague.eu/en/objevujte-kategorie/parks-and-gardens/), which also hosts the photographs used by the cards. Map links open Google Maps; videos use YouTube. Opening hours and admission prices are not maintained by this application: consult each garden's linked visitor-information page before visiting.
