const ResourceLoader = (() => {
  let resourceLoadedPromises = {};

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
      restrictCacheBustingToLocal = true,
      appendToBody = false,
      crossorigin = false,
    } = options;

    const loadResource = (url) => {
      if (resourceLoadedPromises[url]) {
        return resourceLoadedPromises[url].promise;
      }

      const isLocalResource = url.startsWith(window.location.origin);
      const applyCacheBusting =
        cacheBusting && (!restrictCacheBustingToLocal || isLocalResource);
      const finalUrl = applyCacheBusting
        ? `${url}?_=${new Date().getTime()}`
        : url;

      const controller = new AbortController();
      const { signal } = controller;

      let cancel;
      let timedOut = false;
      let startedLoading = false;

      resourceLoadedPromises[url] = new Promise((resolve, reject) => {
        const fileType = url.split(".").pop().toLowerCase();
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
          resolve();
          return;
        }

        const handleTimeout = () => {
          timedOut = true;
          const error = new Error(`Timeout while loading: ${finalUrl}`);
          reject(error);
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
                if (!timedOut) resolve(data);
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
                if (!timedOut) resolve(data);
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
            resolve();
          }
        };

        element.onerror = () => {
          clearTimeout(timeoutId);
          console.error(`Failed to load resource from: ${finalUrl}`);
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
    }
  }

  function cancelResource(url) {
    if (resourceLoadedPromises[url] && resourceLoadedPromises[url].cancel) {
      resourceLoadedPromises[url].cancel();
      delete resourceLoadedPromises[url];
      console.log(`Resource ${url} loading cancelled.`);
    }
  }

  return {
    include,
    unloadResource,
    cancelResource,
  };
})();
