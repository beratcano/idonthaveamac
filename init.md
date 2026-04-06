# idonthaveamac

## Concept

A web app that recreates the iconic MacBook Photo Booth mirror selfie experience — for everyone who doesn't own a Mac.

Users visit the site and see a realistic macOS desktop. The Photo Booth app is open in the center, streaming their webcam feed live. They can snap photos just like the real thing.

## Target Audience

- Non-Mac users who want the aesthetic of the Photo Booth mirror selfie
- Anyone looking for a fun, shareable web experience

## Core Experience

1. User opens the site → **Welcome page** (branding, tagline, "Enter" button)
2. A realistic macOS desktop loads (wallpaper, dock, menu bar)
3. Photo Booth window is open and centered
4. Browser requests camera permission
5. Live webcam feed appears inside the Photo Booth frame
6. User can take photos with countdown + flash effect
7. Photos appear in a filmstrip overlay — click to preview in lightbox, download from there

## Features

- **Photo mode** — single photo with 3-2-1 countdown and screen flash
- **Collage mode** — takes 4 consecutive photos, composes a 2x2 grid
- **Video mode** — easter egg placeholder
- **9 live effects** — Mirror, Thermal, Sepia, B&W, Pop Art, Invert, Cool (3x3 grid preview with smooth transitions)
- **Filmstrip** — glass overlay at bottom of camera area, click to preview, hover X to delete
- **Lightbox** — full preview without downloading, with save button
- **System Settings** — draggable window for dock position and wallpaper customization
- **Help window** — accessible from menu bar and settings
- **Dock** — real macOS icons with hover magnification, supports left/right/bottom positioning
- **Menu bar** — live clock, battery icon
- **Window management** — draggable windows with z-index stacking (click to focus)
- **6 preset wallpapers** + custom image upload

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (vanilla, no frameworks)
- **Camera:** WebRTC / `getUserMedia` API
- **Image processing:** Canvas API (capture, effects, collage composition)
- **Hosting:** Cloudflare Pages
- **Live URL:** https://idonthaveamac.pages.dev

## Key Design Principles

- Pixel-accurate macOS aesthetic (Sequoia-era, liquid glass)
- Real macOS app icons extracted from the system
- No backend needed — everything runs client-side
- Fast load, no dependencies
