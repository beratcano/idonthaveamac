# idonthaveamac

## Concept

A web app that recreates the iconic MacBook Photo Booth mirror selfie experience — for everyone who doesn't own a Mac.

Users visit **idonthaveamac.com** and see a realistic macOS desktop. The Photo Booth app is open in the center, streaming their webcam feed live. They can snap photos just like the real thing.

## Target Audience

- Non-Mac users who want the aesthetic of the Photo Booth mirror selfie
- Anyone looking for a fun, shareable web experience

## Core Experience

1. User opens the site → **Welcome page** (branding, tagline, "Enter" button)
2. A realistic macOS desktop loads (wallpaper, dock, menu bar)
3. Photo Booth window is open and centered
4. Browser requests camera permission
5. Live webcam feed appears inside the Photo Booth frame
6. User can take a photo with the classic Photo Booth countdown + flash effect
7. Photo can be downloaded or shared

## Customization

- **Dock position:** User can move the dock to bottom, left, or right (like real macOS settings)
- **Background wallpaper:** User can pick from preset macOS wallpapers or upload their own

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (vanilla or lightweight framework)
- **Camera:** WebRTC / `getUserMedia` API
- **Hosting:** Static site (Vercel, Netlify, or similar)
- **Domain:** idonthaveamac.com

## Key Design Principles

- Pixel-accurate macOS aesthetic (Sequoia-era)
- Mobile-responsive — works on phones too (the irony makes it better)
- No backend needed — everything runs client-side
- Fast load, no dependencies bloat
