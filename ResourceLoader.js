const ResourceLoader = (() => {
  let resourceLoadedPromises = {};
  let resourceStates = {};

  let loggingLevel = "warn";

  function setLoggingLevel(level) {
    const validLevels = ["silent", "warn", "verbose"];
    if (validLevels.includes(level)) {
      loggingLevel = level;
    } else {
      console.warn(`Invalid logging level: ${level}. Falling back to 'warn'.`);
      loggingLevel = "warn";
    }
  }

  function log(message, level = "verbose") {
    if (loggingLevel === "verbose" && level === "verbose") {
      console.log(message);
    } else if (
      loggingLevel === "warn" &&
      (level === "warn" || level === "error")
    ) {
      console.warn(message);
    }
  }

  function categorizeError(error, fileType, url) {
    if (error.name === "AbortError") {
      return { type: "abort", message: `Fetch aborted for: ${url}` };
    } else if (error.message.includes("timeout")) {
      return { type: "timeout", message: `Timeout while loading: ${url}` };
    } else if (
      fileType &&
      ![
        "js",
        "css",
        "json",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "svg",
        "woff",
        "woff2",
        "pdf",
        "zip",
        "bin",
      ].includes(fileType)
    ) {
      return {
        type: "unsupported",
        message: `Unsupported file type: ${fileType} for ${url}`,
      };
    } else {
      return {
        type: "network",
        message: `Network error or resource not found: ${url}`,
      };
    }
  }

  function applyAttributes(element, attributes) {
    Object.keys(attributes).forEach((key) => {
      if (key in element) {
        element.setAttribute(key, attributes[key]);
      } else {
        log(
          `Invalid attribute "${key}" for element type "${element.tagName}". Skipping.`,
          "warn"
        );
      }
    });
  }

  async function include(urls, options = {}) {
    if (!Array.isArray(urls)) {
      urls = [urls];
    }

    const {
      attributes = {},
      timeout = 10000,
      cacheBusting = false,
      cacheBustingQuery = `?_=${new Date().getTime()}`,
      cacheBustingTypes = ["js", "css"],
      restrictCacheBustingToLocal = true,
      appendToBody = false,
      crossorigin = false,
      logLevel = "warn",
      onError = null,
      retries = 0,
      retryDelay = 1000,
      deferScriptsUntilReady = true,
      batchSize = 5,
      maxConcurrency = 3, // New option to control maximum concurrency
    } = options;

    setLoggingLevel(logLevel);

    const loadResource = (url, retryCount = 0) => {
      if (resourceLoadedPromises[url]) {
        // If already loading, return the existing promise
        return resourceLoadedPromises[url].promise;
      }

      resourceStates[url] = "loading";

      const isLocalResource = url.startsWith(window.location.origin);
      const fileType = url.split(".").pop().toLowerCase();
      const applyCacheBusting =
        cacheBusting &&
        (!restrictCacheBustingToLocal || isLocalResource) &&
        cacheBustingTypes.includes(fileType);
      const finalUrl = applyCacheBusting ? `${url}${cacheBustingQuery}` : url;

      const controller = new AbortController();
      const { signal } = controller;

      let cancel;
      let timedOut = false;
      let startedLoading = false;

      const loadScriptWhenReady = (resolve, reject) => {
        const existingElement =
          document.head.querySelector(
            `[src="${finalUrl}"], [href="${finalUrl}"]`
          ) ||
          document.body.querySelector(
            `[src="${finalUrl}"], [href="${finalUrl}"]`
          );
        if (existingElement) {
          log(`Resource already loaded: ${finalUrl}`, "verbose");
          resourceStates[url] = "loaded";
          resolve();
          return;
        }

        let element;
        let timeoutId;

        const handleTimeout = () => {
          timedOut = true;
          const error = new Error(`Timeout while loading: ${finalUrl}`);
          const categorizedError = categorizeError(error, fileType, finalUrl);
          reject(categorizedError);
          resourceStates[url] = "unloaded";
          if (onError) onError(categorizedError);
          if (element && startedLoading) {
            element.remove();
            log(`Resource load aborted due to timeout: ${finalUrl}`, "warn");
          }
          if (retryCount < retries) {
            log(`Retrying to load resource: ${finalUrl}`, "warn");
            setTimeout(() => loadResource(url, retryCount + 1), retryDelay);
          }
        };

        switch (fileType) {
          case "js":
            element = document.createElement("script");
            element.src = finalUrl;
            element.async = true;
            if (crossorigin) {
              element.crossOrigin = crossorigin;
            }
            break;
          case "css":
            element = document.createElement("link");
            element.href = finalUrl;
            element.rel = "stylesheet";
            if (crossorigin) {
              element.crossOrigin = crossorigin;
            }
            break;
          case "json":
            fetch(finalUrl, { signal })
              .then((response) => response.json())
              .then((data) => {
                if (!timedOut) {
                  resourceStates[url] = "loaded";
                  resolve(data);
                }
              })
              .catch((error) => {
                const categorizedError = categorizeError(
                  error,
                  fileType,
                  finalUrl
                );
                reject(categorizedError);
                if (onError) onError(categorizedError);
                if (retryCount < retries) {
                  log(`Retrying to load resource: ${finalUrl}`, "warn");
                  setTimeout(
                    () => loadResource(url, retryCount + 1),
                    retryDelay
                  );
                }
              });
            cancel = () => controller.abort();
            return;
          case "jpg":
          case "jpeg":
          case "png":
          case "gif":
          case "svg":
            element = document.createElement("img");
            element.src = finalUrl;
            if (crossorigin) {
              element.crossOrigin = crossorigin;
            }
            break;
          case "woff":
          case "woff2":
            const fontFace = new FontFace("customFont", `url(${finalUrl})`, {
              crossOrigin: crossorigin,
            });
            fontFace
              .load()
              .then(() => {
                if (!timedOut) {
                  document.fonts.add(fontFace);
                  resourceStates[url] = "loaded";
                  resolve();
                }
              })
              .catch((error) => {
                const categorizedError = categorizeError(
                  error,
                  fileType,
                  finalUrl
                );
                reject(categorizedError);
                if (onError) onError(categorizedError);
                if (retryCount < retries) {
                  log(`Retrying to load resource: ${finalUrl}`, "warn");
                  setTimeout(
                    () => loadResource(url, retryCount + 1),
                    retryDelay
                  );
                }
              });
            return;
          case "pdf":
          case "zip":
          case "bin":
            fetch(finalUrl, { signal })
              .then((response) => response.blob())
              .then((data) => {
                if (!timedOut) {
                  resourceStates[url] = "loaded";
                  resolve(data);
                }
              })
              .catch((error) => {
                const categorizedError = categorizeError(
                  error,
                  fileType,
                  finalUrl
                );
                reject(categorizedError);
                if (onError) onError(categorizedError);
                if (retryCount < retries) {
                  log(`Retrying to load resource: ${finalUrl}`, "warn");
                  setTimeout(
                    () => loadResource(url, retryCount + 1),
                    retryDelay
                  );
                }
              });
            cancel = () => controller.abort();
            return;
          default:
            const unsupportedError = categorizeError(
              new Error("Unsupported file type"),
              fileType,
              finalUrl
            );
            reject(unsupportedError);
            if (onError) onError(unsupportedError);
            if (retryCount < retries) {
              log(`Retrying to load resource: ${finalUrl}`, "warn");
              setTimeout(() => loadResource(url, retryCount + 1), retryDelay);
            }
            return;
        }

        applyAttributes(element, attributes);

        startedLoading = true;

        timeoutId = setTimeout(handleTimeout, timeout);

        element.onload = () => {
          if (!timedOut) {
            clearTimeout(timeoutId);
            log(`Resource loaded from: ${finalUrl}`, "verbose");
            resourceStates[url] = "loaded";
            resolve();
          }
        };

        element.onerror = () => {
          clearTimeout(timeoutId);
          const loadError = new Error(`Failed to load resource`);
          const categorizedError = categorizeError(
            loadError,
            fileType,
            finalUrl
          );
          log(`Failed to load resource from: ${finalUrl}`, "warn");
          resourceStates[url] = "unloaded";
          reject(categorizedError);
          if (onError) onError(categorizedError);
          if (retryCount < retries) {
            log(`Retrying to load resource: ${finalUrl}`, "warn");
            setTimeout(() => loadResource(url, retryCount + 1), retryDelay);
          }
        };

        if (element.tagName) {
          if (appendToBody && fileType === "js") {
            document.body.appendChild(element);
          } else {
            document.head.appendChild(element);
          }
        }

        cancel = () => {
          clearTimeout(timeoutId);
          if (element && element.parentNode) {
            element.parentNode.removeChild(element);
            log(`Loading cancelled and element removed: ${finalUrl}`, "warn");
            resourceStates[url] = "unloaded";
          }
        };
      };

      if (
        fileType === "js" &&
        deferScriptsUntilReady &&
        document.readyState !== "complete"
      ) {
        window.addEventListener("DOMContentLoaded", () => {
          log(`Deferring script load until DOM ready: ${finalUrl}`, "verbose");
          loadScriptWhenReady();
        });
      } else {
        loadScriptWhenReady();
      }

      // Store the resource load promise to prevent duplicates
      resourceLoadedPromises[url] = {
        promise: new Promise(loadScriptWhenReady),
        cancel,
      };

      return resourceLoadedPromises[url].promise;
    };

    // Helper to load resources with max concurrency
    const loadWithConcurrencyLimit = async (
      resources,
      loadFn,
      maxConcurrency
    ) => {
      let active = 0;
      let index = 0;

      const processNext = async () => {
        while (active < maxConcurrency && index < resources.length) {
          const currentUrl = resources[index++];
          active++;
          loadFn(currentUrl).finally(() => {
            active--;
            processNext(); // Keep processing until all are done
          });
        }
      };

      await processNext();
    };

    // Load resources with concurrency limit
    await loadWithConcurrencyLimit(urls, loadResource, maxConcurrency);
  }

  function unloadResource(url) {
    const elements = document.querySelectorAll(
      `[src="${url}"], [href="${url}"]`
    );
    elements.forEach((element) => element.remove());

    if (resourceLoadedPromises[url]) {
      delete resourceLoadedPromises[url];
      log(`Resource ${url} unloaded and cache cleared.`, "verbose");
      resourceStates[url] = "unloaded";
    }
  }

  function cancelResource(url) {
    if (resourceLoadedPromises[url] && resourceLoadedPromises[url].cancel) {
      resourceLoadedPromises[url].cancel();
      delete resourceLoadedPromises[url];
      log(`Resource ${url} loading cancelled.`, "warn");
      resourceStates[url] = "unloaded";
    }
  }

  function cancelAll() {
    Object.keys(resourceLoadedPromises).forEach((url) => {
      if (resourceLoadedPromises[url] && resourceLoadedPromises[url].cancel) {
        resourceLoadedPromises[url].cancel();
      }
    });
    resourceLoadedPromises = {}; // Clear all promises
    log("All resource loading operations cancelled.", "warn");
  }

  function getResourceState(url) {
    return resourceStates[url] || "unloaded";
  }

  return {
    include,
    unloadResource,
    cancelResource,
    cancelAll, // Expose the new cancelAll function
    getResourceState,
    setLoggingLevel,
  };
})();
