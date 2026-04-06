# idonthaveamac

The Photo Booth experience, without the MacBook.

A web app that recreates a realistic macOS desktop with a fully functional Photo Booth — live webcam feed, effects, collage mode, and more. Built for everyone who doesn't own a Mac but wants the iconic mirror selfie.

**Live:** [idonthaveamac.pages.dev](https://idonthaveamac.pages.dev)

## Features

- **Photo Booth** — live webcam feed with 3-2-1 countdown and flash effect
- **9 Live Effects** — Mirror, Thermal, Sepia, B&W, Pop Art, Invert, Cool (3x3 grid preview)
- **Collage Mode** — 4 consecutive shots composed into a 2x2 grid
- **Filmstrip** — glass overlay showing captured photos, click to preview in lightbox
- **System Settings** — dock position (left/right/bottom), 6 wallpapers + custom upload
- **Realistic Desktop** — menu bar with live clock, dock with real macOS icons and hover magnification
- **Draggable Windows** — Photo Booth, Settings, and Help windows with focus stacking

## Tech Stack

- Vanilla HTML, CSS, JavaScript (no frameworks, no build step)
- WebRTC (`getUserMedia`) for camera access
- Canvas API for photo capture, effects rendering, and collage composition
- Hosted on Cloudflare Pages

## Run Locally

```bash
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:8000` (or `:3000` for serve) and allow camera access.

## Deploy

```bash
npx wrangler pages deploy . --project-name idonthaveamac
```

## Project Structure

```
index.html          # Single-page app
style.css           # All styles
app.js              # All logic
assets/             # macOS app icons (extracted from system)
init.md             # Project concept
roadmap.md          # Feature roadmap with progress
```

## License

MIT
