const ResourceLoader = (() => {
  let resourceLoadedPromises = {};

  async function include(url, options = {}) {
    if (resourceLoadedPromises[url]) {
      return resourceLoadedPromises[url];
    }

    const { attributes = {}, timeout = 10000, cacheBusting = false } = options;
    const finalUrl = cacheBusting ? `${url}?_=${new Date().getTime()}` : url;

    resourceLoadedPromises[url] = new Promise((resolve, reject) => {
      const fileType = url.split(".").pop().toLowerCase();
      let element;
      let timeoutId;

      const handleTimeout = () => {
        reject(new Error(`Resource loading timeout: ${finalUrl}`));
        if (element) {
          element.remove();
        }
      };

      // Determine how to handle different file types
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
          // Dynamically inject font-face rules
          const fontFace = new FontFace("customFont", `url(${finalUrl})`);
          fontFace
            .load()
            .then(() => {
              document.fonts.add(fontFace);
              resolve();
            })
            .catch(reject);
          return;
        case "pdf":
        case "zip":
        case "bin":
          // Fetch binary files (like .pdf or .zip)
          fetch(finalUrl)
            .then((response) => response.blob())
            .then(resolve)
            .catch(reject);
          return;
        default:
          reject(new Error(`Unsupported file type: ${fileType}`));
          return;
      }

      // Apply additional attributes (like integrity, media queries, etc.)
      Object.keys(attributes).forEach((key) => {
        element.setAttribute(key, attributes[key]);
      });

      // Set up the timeout race
      timeoutId = setTimeout(handleTimeout, timeout);

      element.onload = () => {
        clearTimeout(timeoutId); // Cancel the timeout
        console.log(`Resource loaded from: ${finalUrl}`);
        resolve();
      };

      element.onerror = () => {
        clearTimeout(timeoutId); // Cancel the timeout
        console.error(`Failed to load resource from: ${finalUrl}`);
        reject(new Error(`Failed to load resource ${finalUrl}`));
      };

      // Append to DOM if it’s a DOM element (e.g., JS, CSS, Image)
      if (element.tagName) {
        document.head.appendChild(element);
      }
    });

    return resourceLoadedPromises[url];
  }

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
