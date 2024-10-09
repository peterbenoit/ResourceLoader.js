let resourceLoadedPromises = {};

async function include(url, options = {}) {
  if (resourceLoadedPromises[url]) {
    return resourceLoadedPromises[url];
  }

  resourceLoadedPromises[url] = new Promise((resolve, reject) => {
    const fileType = url.split(".").pop();
    let element;

    const { attributes = {}, timeout = 10000, cacheBusting = false } = options;
    const finalUrl = cacheBusting ? `${url}?_=${new Date().getTime()}` : url;

    if (fileType === "js") {
      element = document.createElement("script");
      element.src = finalUrl;
      element.async = true;
    } else if (fileType === "css") {
      element = document.createElement("link");
      element.href = finalUrl;
      element.rel = "stylesheet";
    } else if (fileType === "json") {
      fetch(finalUrl)
        .then((response) => response.json())
        .then(resolve)
        .catch(reject);
      return;
    } else {
      reject(new Error(`Unsupported file type: ${fileType}`));
      return;
    }

    // Apply additional attributes (like integrity or media queries)
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });

    const timeoutId = setTimeout(() => {
      reject(new Error(`Resource loading timeout: ${finalUrl}`));
    }, timeout);

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

    document.head.appendChild(element);
  });

  return resourceLoadedPromises[url];
}

// Cleanup function
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
