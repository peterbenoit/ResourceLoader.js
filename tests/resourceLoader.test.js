// @vitest-environment jsdom
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loaderPath = path.resolve(process.cwd(), "resourceLoader.js");
const loaderSource = fs.readFileSync(loaderPath, "utf8");

function loadLibrary() {
	delete window.ResourceLoader;
	// Evaluate the browser build as-is so tests reflect runtime behavior.
	(0, eval)(loaderSource);
	return window.ResourceLoader;
}

describe("ResourceLoader", () => {
	beforeEach(() => {
		document.head.innerHTML = "";
		document.body.innerHTML = "";
		vi.restoreAllMocks();
	});

	it("resolves include when all element resources load", async () => {
		const ResourceLoader = loadLibrary();

		vi.spyOn(document.head, "appendChild").mockImplementation((element) => {
			queueMicrotask(() => element.onload && element.onload());
			return element;
		});

		const results = await ResourceLoader.include(["https://cdn.example.com/site.css"]);

		expect(results).toHaveLength(1);
		expect(results[0]).toMatchObject({ status: "fulfilled" });
		expect(ResourceLoader.getResourceState("https://cdn.example.com/site.css")).toBe("loaded");
	});

	it("rejects include when any resource fails", async () => {
		const ResourceLoader = loadLibrary();

		vi.spyOn(document.head, "appendChild").mockImplementation((element) => {
			const url = element.src || element.href || "";
			queueMicrotask(() => {
				if (url.includes("bad")) {
					element.onerror && element.onerror(new Event("error"));
				} else {
					element.onload && element.onload();
				}
			});
			return element;
		});

		await expect(
			ResourceLoader.include([
				"https://cdn.example.com/good.css",
				"https://cdn.example.com/bad.css",
			])
		).rejects.toMatchObject({
			type: "aggregate",
			message: "One or more resources failed to load.",
		});
	});

	it("retries failed JSON fetch and eventually succeeds", async () => {
		const ResourceLoader = loadLibrary();
		let calls = 0;

		global.fetch = vi.fn(() => {
			calls += 1;
			if (calls === 1) {
				return Promise.reject(new Error("temporary failure"));
			}
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ ok: true }),
			});
		});

		const results = await ResourceLoader.include(["https://example.com/data.json"], {
			retries: 1,
			retryDelay: 0,
		});

		expect(calls).toBe(2);
		expect(results[0]).toMatchObject({ status: "fulfilled" });
		expect(ResourceLoader.getResourceState("https://example.com/data.json")).toBe("loaded");
	});

	it("cancels an in-flight JSON request", async () => {
		const ResourceLoader = loadLibrary();
		const url = "https://example.com/slow.json";

		global.fetch = vi.fn((_, { signal }) => {
			return new Promise((resolve, reject) => {
				signal.addEventListener("abort", () => {
					const abortError = new Error("aborted");
					abortError.name = "AbortError";
					reject(abortError);
				});
			});
		});

		const promise = ResourceLoader.include([url]);
		ResourceLoader.cancelResource(url);

		await expect(promise).rejects.toMatchObject({ type: "aggregate" });
		expect(ResourceLoader.getResourceState(url)).toBe("unloaded");
	});

	it("infers JSON type for extensionless API URLs", async () => {
		const ResourceLoader = loadLibrary();

		global.fetch = vi.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ users: [] }),
			})
		);

		await ResourceLoader.include(["https://example.com/api/users"]);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		expect(ResourceLoader.getResourceState("https://example.com/api/users")).toBe("loaded");
	});
});
