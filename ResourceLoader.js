const ResourceLoader = (() => {
  let resourceLoadedPromises = {};
  let resourceStates = {}; // New object to track resource states

  function applyAttributes(element, attributes) {
    Object.keys(attributes).forEach((key) => {
      if (key in element) {
        element.setAttribute(key, attributes[key]);
      } else {
        console.warn(
          `Invalid attribute "${key}" for element type "${element.tagName}". Skipping.`
        );
      }
    });
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
    } = options;

    const loadResource = (url) => {
      if (resourceLoadedPromises[url]) {
        return resourceLoadedPromises[url].promise;
      }

      resourceStates[url] = "loading"; // Track state

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

      resourceLoadedPromises[url] = new Promise((resolve, reject) => {
        let element;
        let timeoutId;

        const existingElement =
          document.head.querySelector(
            `[src="${finalUrl}"], [href="${finalUrl}"]`
          ) ||
          document.body.querySelector(
            `[src="${finalUrl}"], [href="${finalUrl}"]`
          );
        if (existingElement) {
          console.log(`Resource already loaded: ${finalUrl}`);
          resourceStates[url] = "loaded"; // Mark as loaded
          resolve();
          return;
        }

        const handleTimeout = () => {
          timedOut = true;
          const error = new Error(`Timeout while loading: ${finalUrl}`);
          reject(error);
          resourceStates[url] = "unloaded"; // Mark as unloaded due to timeout
          if (element && startedLoading) {
            element.remove();
            console.log(`Resource load aborted due to timeout: ${finalUrl}`);
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
                  resourceStates[url] = "loaded"; // Mark as loaded
                  resolve(data);
                }
              })
              .catch((error) => {
                reject(error);
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
                  resourceStates[url] = "loaded"; // Mark as loaded
                  resolve();
                }
              })
              .catch(reject);
            return;
          case "pdf":
          case "zip":
          case "bin":
            fetch(finalUrl, { signal })
              .then((response) => response.blob())
              .then((data) => {
                if (!timedOut) {
                  resourceStates[url] = "loaded"; // Mark as loaded
                  resolve(data);
                }
              })
              .catch((error) => {
                reject(error);
              });
            cancel = () => controller.abort();
            return;
          default:
            reject(new Error(`Unsupported file type: ${fileType}`));
            return;
        }

        applyAttributes(element, attributes);

        startedLoading = true;

        timeoutId = setTimeout(handleTimeout, timeout);

        element.onload = () => {
          if (!timedOut) {
            clearTimeout(timeoutId);
            console.log(`Resource loaded from: ${finalUrl}`);
            resourceStates[url] = "loaded"; // Mark as loaded
            resolve();
          }
        };

        element.onerror = () => {
          clearTimeout(timeoutId);
          console.error(`Failed to load resource from: ${finalUrl}`);
          resourceStates[url] = "unloaded"; // Mark as unloaded due to error
          reject(new Error(`Failed to load resource ${finalUrl}`));
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
            console.log(`Loading cancelled and element removed: ${finalUrl}`);
            resourceStates[url] = "unloaded"; // Mark as unloaded due to cancellation
          }
        };
      });

      resourceLoadedPromises[url] = {
        promise: resourceLoadedPromises[url],
        cancel,
      };

      return resourceLoadedPromises[url].promise;
    };

    return urls.reduce((promiseChain, currentUrl) => {
      return promiseChain.then(() => loadResource(currentUrl));
    }, Promise.resolve());
  }

  function unloadResource(url) {
    const elements = document.querySelectorAll(
      `[src="${url}"], [href="${url}"]`
    );
    elements.forEach((element) => element.remove());

    if (resourceLoadedPromises[url]) {
      delete resourceLoadedPromises[url];
      console.log(`Resource ${url} unloaded and cache cleared.`);
      resourceStates[url] = "unloaded"; // Mark as unloaded
    }
  }

  function cancelResource(url) {
    if (resourceLoadedPromises[url] && resourceLoadedPromises[url].cancel) {
      resourceLoadedPromises[url].cancel();
      delete resourceLoadedPromises[url];
      console.log(`Resource ${url} loading cancelled.`);
      resourceStates[url] = "unloaded"; // Mark as unloaded due to cancellation
    }
  }

  // New function to expose resource state to users
  function getResourceState(url) {
    return resourceStates[url] || "unloaded"; // Default to 'unloaded' if no state is tracked
  }

  return {
    include,
    unloadResource,
    cancelResource,
    getResourceState, // Expose the function to get resource state
  };
})();
