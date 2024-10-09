let resourceLoadedPromises = {};

async function include(url, options = {}) {
  if (resourceLoadedPromises[url]) {
    return resourceLoadedPromises[url];
  }

  const { attributes = {}, timeout = 10000, cacheBusting = false } = options;
  const finalUrl = cacheBusting ? `${url}?_=${new Date().getTime()}` : url;

  resourceLoadedPromises[url] = new Promise((resolve, reject) => {
    const fileType = url.split(".").pop();
    let element;
    let timeoutId;

    const handleTimeout = () => {
      reject(new Error(`Resource loading timeout: ${finalUrl}`));
      if (element) {
        element.remove();
      }
    };

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

    document.head.appendChild(element);
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
