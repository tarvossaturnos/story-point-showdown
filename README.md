# Story Point Showdown

A planning poker arena with original fantasy creature cards. Create a room, share its 5-character PIN or room link, and estimate multiple stories with your team.

## How to play

1. Enter your name and an optional room name.
2. Create the room and share its randomly generated 5-character PIN or link. Teammates can enter the PIN on the home page.
3. Add stories with optional ticket references and descriptions.
4. Everyone chooses a card: 0.5, 1, 2, 3, 5, 8, 13, 20, 40, ? when unsure, or ☕ for a break.
5. The host reveals the cards. Discuss differences and save a shared estimate.
6. Move on to the next story. Download the results as a CSV before closing the room.

Cards adapt to the available space and wrap onto multiple rows. The uncertainty and break buttons sit below the numeric cards. Each numeric card has its own creature, progressing from small starter creatures to powerful titans.

## No database required

The app consists of static files and can be hosted directly on Vercel. No API keys, database, or server functions are required.

PeerJS uses its public signaling service to connect browsers. Room communication then uses WebRTC data channels. The PeerJS signaling and STUN services must remain reachable. See [PeerJS](https://peerjs.com/client/getting-started) and [PeerServer Cloud](https://peerjs.com/server/cloud).

The host is the source of truth for room state. Only the host can add, select, or delete stories, reveal or restart rounds, and save final estimates. Before the reveal, participants receive only their own estimate and whether others have voted. The host is trusted and holds the full room state in their browser.

The host's browser keeps a recovery copy in sessionStorage. Reloading the same tab can restore the room; participants may need to reconnect. This is not durable storage: do not rely on recovery after closing the tab. Duplicating a tab is not supported as a way to join as two different people. Anyone with the PIN or room link can join; the short PIN is a room identifier, not a password. There are no accounts. Codes use uppercase letters and digits without the ambiguous I, O, 0, and 1. They are generated with browser cryptographic randomness. The signaling service reserves the active room ID; new-room collisions trigger up to five fresh-code retries. Restored rooms retain their original ID. Older UUID links still work. Codes are not permanent and may be reused after a room closes.

The host must stay connected. There is no automatic host handover. Corporate firewalls, strict NAT, and some VPNs can block WebRTC; no managed TURN relay is configured. The interface reports connection problems and offers a reconnect action. Guaranteed connectivity on such networks would require a managed realtime service or TURN relay.

Each room supports up to 30 unique participants and 100 stories. Disconnected participants remain visible as offline so their earlier votes remain in the results. Switching stories preserves their votes. Restarting a round clears that story's votes and final estimate.

The interface, accessibility labels, connection messages, and CSV headers are in English. Numeric displays use a decimal point. Existing half-point wire values remain unchanged for room compatibility. User-entered names, story titles, and descriptions are preserved as entered.

## Development

Use Node.js 22 or newer and npm:

```sh
npm ci
npm run dev
npm test
npm run build
```

Vercel configuration is in `vercel.json`. Vercel detects Vite and publishes `dist`. To deploy to your own account:

```sh
vercel login
vercel --prod
```

The deployment contains the application and creature illustrations. The original personal layout sketch is not included in the project.

## Validation

Automated tests cover authorization, vote privacy, reconnection credential privacy, invalid and stale votes, independent stories, round resets, averages, decimal formatting, CSV exports, and story deletion. The production build checks TypeScript and bundles the app. A multi-device session across corporate networks has not been formally tested.

Browsers supporting the experimental `document.modelContext` API receive `read_planning_session` and `start_story_creation` tools. They use the same visible state and story dialog as the interface. The optional WebMCP integration has not been verified in a supported browser context.

## Artwork

The nine original creatures were made with built-in ImageGen. See `ARTWORK.md` for the exact prompts and `public/art/` for the artwork. The active sheets are `creatures-starters.png`, `creatures-elements.png`, and `creatures-titans.png`. The original `creatures.png` is retained as a design reference.

Fonts: DM Sans and Barlow Condensed via Google Fonts, with local sans-serif fallbacks.

## Search engine metadata

The homepage targets English searches for online planning poker, story point poker,
no-signup estimation, and agile team refinement. `index.html` contains the title,
description, social sharing metadata, and WebApplication structured data. These
are delivered in the HTML head without changing the visible website copy or layout.
Vercel sends an
`X-Robots-Tag: noindex, follow` header for `?room=` URLs, and the app also updates
its robots meta tag when a room is created or joined. Rooms use query parameters
on `/`, so no catch-all rewrite is needed: real assets and crawl files are served
directly, and unknown paths can return 404 instead of duplicating the homepage.

The production origin defaults to `https://storypointshowdown.witsensoft.com`.
To change domains, set `SITE_URL` in the build environment to the new public HTTPS
origin (without a path, query, or fragment). The Vite plugin uses it to generate
the canonical URL, Open Graph URL, WebSite structured data, `robots.txt`, and a
homepage-only `sitemap.xml`. Preview deployments should
use the production origin too, and should be protected from indexing separately
through the hosting provider's preview controls.

After deployment, verify the rendered homepage and room response headers, submit
`/sitemap.xml` in Google Search Console, and request indexing of the homepage.
Search rankings depend on competition, useful content, authority, and indexing;
metadata does not guarantee a position.
