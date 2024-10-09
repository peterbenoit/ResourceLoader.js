const ResourceLoader = (() => {
  let resourceLoadedPromises = {};

  async function include(url, options = {}) {
    if (resourceLoadedPromises[url]) {
      return resourceLoadedPromises[url];
    }

    const {
      attributes = {},
      timeout = 10000,
      cacheBusting = false,
      restrictCacheBustingToLocal = true,
      appendToBody = false,
    } = options;

    const isLocalResource = url.startsWith(window.location.origin);
    const applyCacheBusting =
      cacheBusting && (!restrictCacheBustingToLocal || isLocalResource);
    const finalUrl = applyCacheBusting
      ? `${url}?_=${new Date().getTime()}`
      : url;

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
          break;
        case "css":
          element = document.createElement("link");
          element.href = finalUrl;
          element.rel = "stylesheet";
          break;
        case "json":
          fetch(finalUrl)
            .then((response) => response.json())
            .then(resolve)
            .catch(reject);
          return;
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "svg":
          element = document.createElement("img");
          element.src = finalUrl;
          break;
        case "woff":
        case "woff2":
          // Load font using FontFace API
          const fontFace = new FontFace("customFont", `url(${finalUrl})`);
          fontFace
            .load()
            .then(() => {
              document.fonts.add(fontFace);
              resolve();
            })
            .catch(reject);
          return; // Font doesn't append a DOM element
        case "pdf":
        case "zip":
        case "bin":
          // Fetch binary files (like .pdf or .zip)
          fetch(finalUrl)
            .then((response) => response.blob())
            .then(resolve)
            .catch(reject);
          return; // Binary files don't append to the DOM
        default:
          reject(new Error(`Unsupported file type: ${fileType}`));
          return;
      }

      Object.keys(attributes).forEach((key) => {
        element.setAttribute(key, attributes[key]);
      });

      timeoutId = setTimeout(handleTimeout, timeout);

      element.onload = () => {
        clearTimeout(timeoutId);
        console.log(`Resource loaded from: ${finalUrl}`);
        resolve();
      };

      element.onerror = () => {
        clearTimeout(timeoutId);
        console.error(`Failed to load resource from: ${finalUrl}`);
        reject(new Error(`Failed to load resource ${finalUrl}`));
      };

      // Append the element to <body> or <head> based on the option
      if (element.tagName) {
        if (appendToBody && fileType === "js") {
          document.body.appendChild(element);
        } else {
          document.head.appendChild(element);
        }
      }
    });

    return resourceLoadedPromises[url];
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

  return {
    include,
    unloadResource,
  };
})();
