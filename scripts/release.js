#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: options.cwd || process.cwd(),
		stdio: options.stdio || "inherit",
		encoding: "utf8",
		env: process.env,
	});

	if (result.error) {
		throw result.error;
	}

	if (result.status !== 0 && !options.allowFailure) {
		const joined = [command].concat(args).join(" ");
		throw new Error(`Command failed: ${joined}`);
	}

	return result;
}

function parseArgs(argv) {
	const options = {
		bump: "patch",
		publish: false,
		skipLogin: false,
		skipPush: false,
		skipTests: false,
		skipPack: false,
		yes: false,
		help: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		if (arg === "--help" || arg === "-h") {
			options.help = true;
		} else if (arg === "--publish") {
			options.publish = true;
		} else if (arg === "--skip-login") {
			options.skipLogin = true;
		} else if (arg === "--skip-push") {
			options.skipPush = true;
		} else if (arg === "--skip-tests") {
			options.skipTests = true;
		} else if (arg === "--skip-pack") {
			options.skipPack = true;
		} else if (arg === "--yes" || arg === "-y") {
			options.yes = true;
		} else if (arg === "--bump") {
			const value = argv[i + 1];
			if (!value) {
				throw new Error("Missing value for --bump");
			}
			options.bump = value;
			i += 1;
		} else if (arg.startsWith("--bump=")) {
			options.bump = arg.split("=")[1];
		} else {
			throw new Error(`Unknown argument: ${arg}`);
		}
	}

	return options;
}

function printHelp() {
	console.log(`\nProject-agnostic npm release helper\n\nUsage:\n  node scripts/release.js --bump <patch|minor|major|prerelease|x.y.z> [--publish] [--yes]\n\nOptions:\n  --bump <value>   Version bump target (default: patch)\n  --publish        Run npm publish after version bump and push\n  --yes, -y        Skip final confirmation prompt\n  --skip-login     Skip npm auth check/login\n  --skip-tests     Skip npm test\n  --skip-pack      Skip npm pack --dry-run step\n  --skip-push      Skip git push --follow-tags\n  --help, -h       Show this help\n\nExamples:\n  node scripts/release.js --bump patch\n  node scripts/release.js --bump minor --publish\n  node scripts/release.js --bump 2.0.0 --publish --yes\n`);
}

function ensureGitClean() {
	const status = run("git", ["status", "--porcelain"], {
		stdio: "pipe",
	});
	const output = (status.stdout || "").trim();
	if (output) {
		throw new Error(
			"Git working tree is dirty. Commit/stash changes before running release."
		);
	}
}

function ensureNpmAuth(skipLogin) {
	if (skipLogin) {
		console.log("Skipping npm auth check.");
		return;
	}

	const whoami = run("npm", ["whoami"], {
		stdio: "pipe",
		allowFailure: true,
	});

	if (whoami.status === 0) {
		const user = (whoami.stdout || "").trim();
		console.log(`npm auth OK as: ${user || "(unknown user)"}`);
		return;
	}

	console.log("npm login required. Starting interactive npm login...");
	run("npm", ["login"]);
}

function readPackageJson() {
	const packageJsonPath = path.resolve(process.cwd(), "package.json");
	if (!fs.existsSync(packageJsonPath)) {
		throw new Error("package.json not found in current directory.");
	}
	const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
	if (!pkg.name) {
		throw new Error("package.json must include a name field.");
	}
	if (!pkg.version) {
		throw new Error("package.json must include a version field.");
	}
	return { pkg, packageJsonPath };
}

function resolveEntryFile(pkg) {
	const candidate = pkg.jsdelivr || pkg.unpkg || pkg.browser || pkg.main;
	if (!candidate) {
		return null;
	}
	const normalized = candidate.startsWith("./") ? candidate.slice(2) : candidate;
	return normalized;
}

function runChecks(options, pkg) {
	if (!options.skipTests) {
		console.log("Running tests...");
		run("npm", ["test"]);
	} else {
		console.log("Skipping tests.");
	}

	if (!options.skipPack) {
		const hasPackScript =
			pkg.scripts && Object.prototype.hasOwnProperty.call(pkg.scripts, "pack:dry-run");
		if (hasPackScript) {
			console.log("Running pack dry-run script...");
			run("npm", ["run", "pack:dry-run"]);
		} else {
			console.log("Running npm pack --dry-run...");
			run("npm", ["pack", "--dry-run"]);
		}
	} else {
		console.log("Skipping pack dry-run.");
	}
}

function confirmOrExit(options, pkg, nextVersionHint) {
	if (options.yes) {
		return;
	}

	const summary = [
		"\nRelease summary:",
		`- package: ${pkg.name}`,
		`- current version: ${pkg.version}`,
		`- bump target: ${options.bump}`,
		`- publish: ${options.publish ? "yes" : "no"}`,
		`- push tags: ${options.skipPush ? "no" : "yes"}`,
	];
	if (nextVersionHint) {
		summary.push(`- next version (from npm): ${nextVersionHint}`);
	}
	summary.push("Continue? [y/N]");
	process.stdout.write(summary.join("\n") + " ");

	const input = fs.readFileSync(0, "utf8").trim().toLowerCase();
	if (input !== "y" && input !== "yes") {
		throw new Error("Release cancelled by user.");
	}
}

function bumpVersion(target) {
	console.log(`Bumping version via npm version ${target}...`);
	const result = run("npm", ["version", target], {
		stdio: "pipe",
	});
	const out = `${result.stdout || ""}${result.stderr || ""}`;
	const match = out.match(/v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/);
	if (match) {
		const newVersion = match[1];
		console.log(`Version bumped to ${newVersion}`);
		return newVersion;
	}

	const pkgAfter = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"));
	console.log(`Version bumped to ${pkgAfter.version}`);
	return pkgAfter.version;
}

function pushChanges(skipPush) {
	if (skipPush) {
		console.log("Skipping git push.");
		return;
	}
	console.log("Pushing commit and tags...");
	run("git", ["push", "origin", "HEAD", "--follow-tags"]);
}

function publishPackage(shouldPublish) {
	if (!shouldPublish) {
		console.log("Publish step skipped. Use --publish to publish to npm.");
		return;
	}
	console.log("Publishing package to npm...");
	run("npm", ["publish"]);
}

function verifyNpmVersion(name, expectedVersion) {
	for (let attempt = 1; attempt <= 6; attempt += 1) {
		const result = run("npm", ["view", name, "version"], {
			stdio: "pipe",
			allowFailure: true,
		});
		const published = (result.stdout || "").trim();
		if (result.status === 0 && published === expectedVersion) {
			console.log(`npm registry verified: ${name}@${published}`);
			return true;
		}
		if (attempt < 6) {
			console.log(`Waiting for npm registry update (attempt ${attempt}/6)...`);
			run("node", ["-e", "setTimeout(() => {}, 4000)"]);
		}
	}
	console.log("npm registry version could not be confirmed yet.");
	return false;
}

function printCdnUrls(pkg, version) {
	const entry = resolveEntryFile(pkg);
	if (!entry) {
		console.log("No entry file metadata (jsdelivr/unpkg/browser/main) found; skipping CDN URL output.");
		return;
	}

	const pinnedJsdelivr = `https://cdn.jsdelivr.net/npm/${pkg.name}@${version}/${entry}`;
	const latestJsdelivr = `https://cdn.jsdelivr.net/npm/${pkg.name}/${entry}`;
	const pinnedUnpkg = `https://unpkg.com/${pkg.name}@${version}/${entry}`;
	const latestUnpkg = `https://unpkg.com/${pkg.name}/${entry}`;

	console.log("\nCDN URLs:");
	console.log(`- jsDelivr pinned: ${pinnedJsdelivr}`);
	console.log(`- jsDelivr latest: ${latestJsdelivr}`);
	console.log(`- unpkg pinned: ${pinnedUnpkg}`);
	console.log(`- unpkg latest: ${latestUnpkg}`);
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		printHelp();
		return;
	}

	const { pkg } = readPackageJson();

	ensureGitClean();
	ensureNpmAuth(options.skipLogin);
	runChecks(options, pkg);
	confirmOrExit(options, pkg, null);

	const newVersion = bumpVersion(options.bump);
	pushChanges(options.skipPush);
	publishPackage(options.publish);

	if (options.publish) {
		verifyNpmVersion(pkg.name, newVersion);
	}
	printCdnUrls(pkg, newVersion);

	console.log("\nRelease flow completed.");
}

try {
	main();
} catch (error) {
	console.error(`\nRelease failed: ${error.message}`);
	process.exit(1);
}
