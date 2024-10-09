const ResourceLoader = (() => {
  let resourceLoadedPromises = {};

  const validAttributes = {
    js: ["async", "defer", "integrity", "crossorigin", "type"],
    css: ["media", "integrity", "crossorigin"],
    img: ["alt", "crossorigin", "loading", "decoding"],
    font: ["crossorigin"],
    general: ["title", "id", "class"],
  };

  function applyAttributes(element, attributes, type) {
    const allowedAttributes = [
      ...validAttributes[type],
      ...validAttributes.general,
    ];
    Object.keys(attributes).forEach((key) => {
      if (allowedAttributes.includes(key)) {
        element.setAttribute(key, attributes[key]);
      } else {
        console.warn(
          `Invalid attribute "${key}" for resource type "${type}". Skipping.`
        );
      }
    });
  }

  async function include(urls, options = {}) {
    if (!Array.isArray(urls)) {
      urls = [urls]; // Convert to array if single resource
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

      resourceLoadedPromises[url] = new Promise((resolve, reject) => {
        const fileType = url.split(".").pop().toLowerCase();
        let element;
        let timeoutId;

        const existingElement = document.head.querySelector(
          `[src="${finalUrl}"], [href="${finalUrl}"]`
        );
        if (existingElement) {
          console.log(`Resource already loaded: ${finalUrl}`);
          resolve();
          return;
        }

        const handleTimeout = () => {
          timedOut = true;
          reject(new Error(`Resource loading timeout: ${finalUrl}`));
          if (element) {
            element.remove();
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
            applyAttributes(element, attributes, "js");
            break;
          case "css":
            element = document.createElement("link");
            element.href = finalUrl;
            element.rel = "stylesheet";
            if (crossorigin) {
              element.crossOrigin = crossorigin;
            }
            applyAttributes(element, attributes, "css");
            break;
          case "json":
            fetch(finalUrl, { signal })
              .then((response) => response.json())
              .then((data) => {
                if (!timedOut) resolve(data);
              })
              .catch((error) => {
                if (error.name === "AbortError") {
                  console.log(`Fetch aborted for: ${finalUrl}`);
                } else {
                  reject(error);
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
            applyAttributes(element, attributes, "img");
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
                if (error.name === "AbortError") {
                  console.log(`Fetch aborted for: ${finalUrl}`);
                } else {
                  reject(error);
                }
              });
            cancel = () => controller.abort();
            return;
          default:
            reject(new Error(`Unsupported file type: ${fileType}`));
            return;
        }

        timeoutId = setTimeout(handleTimeout, timeout);

        element.onload = () => {
          if (!timedOut) {
            clearTimeout(timeoutId);
            console.log(`Resource loaded from: ${finalUrl}`);
            resolve();
          }
        };

        element.onerror = () => {
          if (!timedOut) {
            clearTimeout(timeoutId);
            console.error(`Failed to load resource from: ${finalUrl}`);
            reject(new Error(`Failed to load resource ${finalUrl}`));
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
