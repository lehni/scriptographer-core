# Scriptographer Core

What Scriptographer's scripts see, written in JavaScript, shared by the apps that run them: [VectorCraft](https://github.com/storytold/vectorcraft) and [Glyphs](https://glyphsapp.com). The same scripts run in both.

- `src/`: the bundle's sources: `console` and `print()`, `Dialog` and `Palette`, and the web's APIs scripts get outside a browser (`fetch`, `WebSocket`, `OffscreenCanvas`, `Worker`, `localStorage`, `URL`, …).
- `dist/scriptographer.js`: the bundle, which each app's runtime loads after Paper.js (`vendor/paper-hosted.js`), with its natives as `globalThis.__scriptographer`. `dist/scriptographer-web.js` is the web's.
- `NATIVES.md`: the contract: what each app implements natively for the bundle, and what the bundle gives back.
- `vendor/`: Paper.js's hosted build and the libraries the bundle and the runtimes use, with their licenses.

The apps implement the natives each in their own language: VectorCraft in Rust (`crates/scriptographer`), Glyphs in Objective-C (`scriptographer-glyphs`). Each adds its document binding (a `Project#host` over its document) and its native UI for palettes, dialogs, the script browser and the console.

## Building

```sh
pnpm install
pnpm run build   # dist/
pnpm run check   # dist/ up to date, and formatted
```

Node 24 or newer.
