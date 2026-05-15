# NPM Package Portfolio Attribution Strategy

How to route npm package traffic through `peterbenoit.com` to build domain authority and personal brand visibility.

## The Problem

NPM package pages link to their documentation homepage. By default that URL is the raw docs host (e.g. `somepackage.vercel.app`), which means every developer who clicks through from npm bypasses your portfolio entirely. People who find your docs via search or a direct link also have no path back to you.

## The Goal

Every entry point into your package should surface `peterbenoit.com`:

- **npm homepage** field → routes through the portfolio page first
- **Docs site footer** → gives a path back to the portfolio from within the docs

This does not require adding a redirect or click-wall. The portfolio page already links out to the real docs cleanly.

---

## Step 1 — Update the npm `homepage` field

In `package.json`, change the `homepage` value from the direct docs URL to the corresponding portfolio page:

```json
{
  "homepage": "https://peterbenoit.com/{package-name}/"
}
```

**Before:**
```json
"homepage": "https://somepackage.vercel.app/"
```

**After:**
```json
"homepage": "https://peterbenoit.com/somepackage/"
```

The portfolio page already has a "Documentation" button pointing to the real docs, so the user flow is frictionless:

```
npm page → peterbenoit.com/{package}/ → [Documentation] → real docs
```

After editing, bump the patch version and publish:

```bash
npm version patch
npm publish
```

---

## Step 2 — Add portfolio attribution to the docs site (Starlight)

If the docs are built with Astro Starlight, override the Footer component to inject a credit line on every page.

### 2a. Create the custom footer

Create `docs/src/components/Footer.astro`:

```astro
---
import type { Props } from '@astrojs/starlight/props';
import StarlightFooter from '@astrojs/starlight/components/Footer.astro';
---

<StarlightFooter {...Astro.props} />

<div class="author-credit">
  <p>
    Built by <a href="https://peterbenoit.com" target="_blank" rel="noopener noreferrer">Peter Benoit</a>
    &nbsp;·&nbsp;
    <a href="https://peterbenoit.com/{package-name}/" target="_blank" rel="noopener noreferrer">Portfolio page</a>
  </p>
</div>

<style>
  .author-credit {
    text-align: center;
    padding: 0.25rem 1rem 1.25rem;
    font-size: 0.8rem;
    color: var(--sl-color-gray-4);
  }

  .author-credit a {
    color: var(--sl-color-accent-high);
    text-decoration: none;
  }

  .author-credit a:hover {
    text-decoration: underline;
  }
</style>
```

Replace `{package-name}` with the actual portfolio slug (e.g. `tailwindcss-visibility`).

### 2b. Register it in `astro.config.mjs`

Add the `components` key inside the `starlight({})` call:

```js
starlight({
  title: 'Your Package Title',
  social: [...],
  components: {
    Footer: './src/components/Footer.astro',
  },
  // rest of config...
})
```

This renders the default Starlight footer (pagination, edit links) and appends the attribution line below it. No existing functionality is lost.

---

## Step 3 — Verify both entry points

After deploying:

1. **npm page** — visit `https://www.npmjs.com/package/{package-name}` and confirm the **Homepage** link points to `peterbenoit.com`.
2. **Docs footer** — visit any page on the docs site and confirm the "Built by Peter Benoit" credit appears at the bottom with working links.
3. **Portfolio page** — confirm the "Documentation" button on `peterbenoit.com/{package-name}/` correctly links to the live docs.

---

## Checklist (per package)

- [ ] `package.json` — `homepage` changed to `https://peterbenoit.com/{package-name}/`
- [ ] `package.json` — version bumped (`npm version patch`)
- [ ] Package published to npm (`npm publish`)
- [ ] `docs/src/components/Footer.astro` created with correct portfolio URL
- [ ] `docs/astro.config.mjs` — `components.Footer` registered
- [ ] Docs site deployed and footer verified
- [ ] npm homepage link verified

---

## Notes on non-Starlight docs

If a package's docs are not using Astro Starlight, the same intent applies but the implementation differs:

| Docs framework | Where to add attribution |
|---|---|
| Astro Starlight | `components.Footer` override (above) |
| Plain HTML | Add a `<footer>` or nav link to `peterbenoit.com` |
| VitePress | Override the `Layout` component or add `footer` config |
| Docusaurus | `footer.links` in `docusaurus.config.js` |
| README-only | Add "By [Peter Benoit](https://peterbenoit.com)" line near the top |

---

## Why not a hard redirect?

Sending npm directly to the portfolio page (not the docs) is intentional. The portfolio page provides context, branding, and screenshots that the raw docs don't have. It also means the same URL you share in blog posts, talks, and social media is the same one npm users land on — one canonical page to maintain.


## Human note

We're using non-www in links to peterbenoit.com; any links to www.peterbenoit.com... should be corrected
