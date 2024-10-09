const ResourceLoader = (() => {
  let resourceLoadedPromises = {};

  async function include(url, options = {}) {
    if (resourceLoadedPromises[url]) {
      return resourceLoadedPromises[url];
    }

    // Options for cache busting, timeout, etc.
    const {
      attributes = {},
      timeout = 10000,
      cacheBusting = false,
      restrictCacheBustingToLocal = true,
    } = options;

    // Determine if cache busting should be applied
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

      // Function to handle timeout
      const handleTimeout = () => {
        reject(new Error(`Resource loading timeout: ${finalUrl}`));
        if (element) {
          element.remove(); // Remove the element if timeout occurs
        }
      };

      // Handle different resource types
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
          return; // JSON does not need to append to the document
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

      // Apply additional attributes (like integrity, async, media, etc.)
      Object.keys(attributes).forEach((key) => {
        element.setAttribute(key, attributes[key]);
      });

      // Set up a timeout to reject if the resource takes too long
      timeoutId = setTimeout(handleTimeout, timeout);

      // Handle successful resource loading
      element.onload = () => {
        clearTimeout(timeoutId); // Cancel the timeout if loaded successfully
        console.log(`Resource loaded from: ${finalUrl}`);
        resolve();
      };

      // Handle resource load error
      element.onerror = () => {
        clearTimeout(timeoutId); // Cancel the timeout if an error occurs
        console.error(`Failed to load resource from: ${finalUrl}`);
        reject(new Error(`Failed to load resource ${finalUrl}`));
      };

      // Append the resource to the document head if it's a DOM element (e.g., JS, CSS, Image)
      if (element.tagName) {
        document.head.appendChild(element);
      }
    });

    return resourceLoadedPromises[url];
  }

  // Cleanup function to remove loaded resources from the DOM and clear cache
  function unloadResource(url) {
    const elements = document.head.querySelectorAll(
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
