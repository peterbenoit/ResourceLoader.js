---
title: Contributing
description: How to contribute to ResourceLoader.js — development setup, testing, and the release process.
---

Contributions are welcome! ResourceLoader.js is an MIT-licensed open-source project hosted on GitHub.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later

### Clone and Install

```sh
git clone https://github.com/peterbenoit/ResourceLoader.js.git
cd ResourceLoader.js
npm install
```

### Run the Tests

```sh
npm test
```

To run tests in watch mode during development:

```sh
npm run test:watch
```

Tests use [Vitest](https://vitest.dev/) with [jsdom](https://github.com/jsdom/jsdom) for DOM simulation.

---

## Project Structure

```
ResourceLoader.js/
├── resourceLoader.js          # The library (single file)
├── tests/
│   └── resourceLoader.test.js # Test suite
├── scripts/
│   └── release.js             # Release automation script
├── docs/                      # This documentation site
├── package.json
├── README.md
└── LICENSE
```

---

## Making Changes

The entire library lives in a single file: `resourceLoader.js`. There is no build step — the file you edit is the file that ships to npm and CDNs.

1. **Make your change** in `resourceLoader.js`
2. **Add or update tests** in `tests/resourceLoader.test.js`
3. **Run `npm test`** to verify nothing broke
4. **Open a pull request** on GitHub

---

## Release Process

Maintainers use the release script to publish new versions:

```sh
# Bump version and publish interactively
npm run release

# Bump patch version (no publish)
npm run release:patch

# Bump minor version (no publish)
npm run release:minor

# Bump patch and publish to npm
npm run release:publish
```

The release script:
1. Checks that the git working tree is clean
2. Verifies npm authentication
3. Runs all tests
4. Performs a dry-run npm pack to validate the package
5. Bumps the version in `package.json`
6. Creates a git commit and tag
7. Pushes to GitHub
8. Optionally publishes to npm
9. Displays CDN URLs for the new version

---

## Reporting Bugs

Please open an issue on the [GitHub Issues page](https://github.com/peterbenoit/ResourceLoader.js/issues) with:

- A clear description of the problem
- The URL(s) you were trying to load
- The options you passed to `include()`
- The browser and version
- A minimal reproducible example if possible

---

## License

ResourceLoader.js is released under the [MIT License](https://github.com/peterbenoit/ResourceLoader.js/blob/main/LICENSE). By contributing, you agree that your contributions will be licensed under the same terms.
