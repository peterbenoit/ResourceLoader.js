---
title: Changelog
description: Release history for ResourceLoader.js.
---

All notable changes to ResourceLoader.js are documented here.

For the full release history including tags and diffs, see the [GitHub Releases page](https://github.com/peterbenoit/ResourceLoader.js/releases).

---

## v1.0.2 — Current

**Release type:** Patch

- Automated release script (`scripts/release.js`) with interactive mode and `--bump` flag support
- Improved README with CDN usage and installation instructions

---

## v1.0.1

**Release type:** Patch

- Timeout handling for resource loading via `AbortController`
- Async/await refactoring for `confirmOrExit` and `main` functions in release script
- Internal code quality improvements

---

## v1.0.0 — Initial Release

The first public release of ResourceLoader.js.

**Core features:**
- `include(urls, options)` — load JS, CSS, JSON, images, fonts, audio, video, PDF, and binary files
- `unloadResource(url)` — remove a loaded resource
- `cancelResource(url)` — cancel an in-flight load
- `cancelAll()` — cancel all in-flight loads
- `getResourceState(url)` — query resource state
- `setLoggingLevel(level)` — control logging verbosity
- Configurable retries, retry delay, and timeout
- `maxConcurrency` and `priority` for load queue control
- Cache busting with `cacheBusting`, `cacheBustingQuery`, `cacheBustingTypes`, `restrictCacheBustingToLocal`
- Subresource Integrity support via `attributes.integrity` and `crossorigin`
- Published to npm as `resourceloader-js`
- Available via jsDelivr and unpkg CDNs

---

## Upgrade Notes

### v1.0.1 → v1.0.2

No breaking changes. Update your CDN pinned version if desired:

```html
<!-- Before -->
<script src="https://cdn.jsdelivr.net/npm/resourceloader-js@1.0.1/resourceLoader.js"></script>

<!-- After -->
<script src="https://cdn.jsdelivr.net/npm/resourceloader-js@1.0.2/resourceLoader.js"></script>
```

### v1.0.0 → v1.0.1

No breaking changes.

---

## Versioning Policy

ResourceLoader.js follows [Semantic Versioning](https://semver.org/):

- **Patch** (`x.x.N`): Bug fixes and non-breaking internal changes
- **Minor** (`x.N.0`): New backwards-compatible features
- **Major** (`N.0.0`): Breaking changes to the public API

When upgrading across major versions, review this changelog for breaking changes before updating.
