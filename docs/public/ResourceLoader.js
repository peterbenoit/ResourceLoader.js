const ResourceLoader = (() => {
    let resourceLoadedPromises = {};
    let resourceStates = {};

    let loggingLevel = 'warn';

    function setLoggingLevel(level) {
        const validLevels = ['silent', 'warn', 'verbose'];
        if (validLevels.includes(level)) {
            loggingLevel = level;
        } else {
            console.warn(`Invalid logging level: ${level}. Falling back to 'warn'.`);
            loggingLevel = 'warn';
        }
    }

    function log(message, level = 'verbose') {
        if (loggingLevel === 'verbose' && level === 'verbose') {
            console.log(message);
        } else if (loggingLevel === 'warn' && (level === 'warn' || level === 'error')) {
            console.warn(message);
        }
    }

    function categorizeError(error, fileType, url) {
        if (error.name === 'AbortError') {
            return { type: 'abort', message: `Fetch aborted for: ${url}` };
        } else if (error.message.includes('timeout')) {
            return { type: 'timeout', message: `Timeout while loading: ${url}` };
        } else if (
            fileType &&
            ![
                'js',
                'css',
                'json',
                'jpg',
                'jpeg',
                'png',
                'gif',
                'svg',
                'woff',
                'woff2',
                'pdf',
                'zip',
                'bin',
            ].includes(fileType)
        ) {
            return {
                type: 'unsupported',
                message: `Unsupported file type: ${fileType} for ${url}`,
            };
        } else {
            return {
                type: 'network',
                message: `Network error or resource not found: ${url}`,
            };
        }
    }

    function validateSecurityAttributes(element, fileType, attributes) {
        if (fileType === 'js' || fileType === 'css') {
            if (
                attributes.crossorigin &&
                !['anonymous', 'use-credentials'].includes(attributes.crossorigin)
            ) {
                log(
                    `Invalid "crossorigin" attribute for ${fileType} resource: ${attributes.crossorigin}. Using default "anonymous".`,
                    'warn'
                );
                element.crossOrigin = 'anonymous';
            }
        }

        if (fileType === 'js' || fileType === 'css') {
            if (!attributes.integrity) {
                log(
                    `"integrity" attribute missing for ${fileType} resource. This is required for secure resource loading.`,
                    'warn'
                );
            } else {
                element.integrity = attributes.integrity;
            }
        }
    }

    function applyAttributes(element, attributes, fileType) {
        Object.keys(attributes).forEach((key) => {
            if (key in element) {
                element.setAttribute(key, attributes[key]);
            } else {
                log(
                    `Invalid attribute "${key}" for element type "${element.tagName}". Skipping.`,
                    'warn'
                );
            }
        });

        validateSecurityAttributes(element, fileType, attributes);
    }

    function include(urls, options = {}) {
        if (!Array.isArray(urls)) {
            urls = [urls];
        }

        const {
            attributes = {},
            timeout = 10000,
            cacheBusting = false,
            cacheBustingQuery = `?_=${new Date().getTime()}`,
            cacheBustingTypes = ['js', 'css'],
            restrictCacheBustingToLocal = true,
            appendToBody = false,
            crossorigin = false,
            logLevel = 'warn',
            onError = null,
            onSuccess = null,
            retries = 0,
            retryDelay = 1000,
            deferScriptsUntilReady = true,
            batchSize = 5,
            maxConcurrency = 3,
            priority = 0,
            removeFailedElements = true,
        } = options;

        setLoggingLevel(logLevel);

        const sortedUrls = urls.sort((a, b) => {
            const priorityA = a.priority || 0;
            const priorityB = b.priority || 0;
            return priorityB - priorityA;
        });

        const loadResource = (url, retryCount = 0) => {
            if (resourceLoadedPromises[url]) {
                return resourceLoadedPromises[url].promise;
            }

            resourceStates[url] = 'loading';

            const isLocalResource = url.startsWith(window.location.origin);
            const fileType = url.split('.').pop().toLowerCase();
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

            return (resourceLoadedPromises[url] = {
                promise: new Promise((resolve, reject) => {
                    const loadScriptWhenReady = () => {
                        const existingElement =
                            document.head.querySelector(
                                `[src="${finalUrl}"], [href="${finalUrl}"]`
                            ) ||
                            document.body.querySelector(
                                `[src="${finalUrl}"], [href="${finalUrl}"]`
                            );
                        if (existingElement) {
                            log(`Resource already loaded: ${finalUrl}`, 'verbose');
                            resourceStates[url] = 'loaded';
                            resolve(finalUrl);
                            return;
                        }

                        let element;
                        let timeoutId;

                        const handleTimeout = () => {
                            timedOut = true;
                            const error = new Error(`Timeout while loading: ${finalUrl}`);
                            const categorizedError = categorizeError(error, fileType, finalUrl);
                            reject(categorizedError);
                            resourceStates[url] = 'unloaded';
                            if (element && startedLoading) {
                                element.remove();
                                log(`Resource load aborted due to timeout: ${finalUrl}`, 'warn');
                            }
                            if (retryCount < retries) {
                                log(`Retrying to load resource: ${finalUrl}`, 'warn');
                                setTimeout(() => {
                                    loadResource(url, retryCount + 1)
                                        .then(resolve)
                                        .catch(reject);
                                }, retryDelay);
                            }
                        };

                        switch (fileType) {
                            case 'js':
                                element = document.createElement('script');
                                element.src = finalUrl;
                                element.async = true;
                                if (crossorigin) {
                                    element.crossOrigin = crossorigin;
                                }
                                break;
                            case 'css':
                                element = document.createElement('link');
                                element.href = finalUrl;
                                element.rel = 'stylesheet';
                                if (crossorigin) {
                                    element.crossOrigin = crossorigin;
                                }
                                break;
                            case 'json':
                                fetch(finalUrl, { signal })
                                    .then((response) => {
                                        if (!response.ok) {
                                            throw new Error(
                                                `HTTP error! status: ${response.status}`
                                            );
                                        }
                                        return response.json(); // Ensure the response is parsed as JSON
                                    })
                                    .then((data) => {
                                        if (!timedOut) {
                                            resourceStates[url] = 'loaded';
                                            resolve(data); // Resolve with the JSON data
                                            if (onSuccess) onSuccess(data); // Trigger onSuccess
                                        }
                                    })
                                    .catch((error) => {
                                        const categorizedError = categorizeError(
                                            error,
                                            fileType,
                                            finalUrl
                                        );
                                        reject(categorizedError);
                                        if (onError) onError(categorizedError, url);
                                        if (retryCount < retries) {
                                            log(`Retrying to load resource: ${finalUrl}`, 'warn');
                                            setTimeout(() => {
                                                loadResource(url, retryCount + 1)
                                                    .then(resolve)
                                                    .catch(reject);
                                            }, retryDelay);
                                        }
                                    });
                                cancel = () => controller.abort();
                                return;
                            case 'jpg':
                            case 'jpeg':
                            case 'png':
                            case 'gif':
                            case 'svg':
                            case 'webp':
                                element = document.createElement('img');
                                element.src = finalUrl;
                                if (crossorigin) {
                                    element.crossOrigin = crossorigin;
                                }
                                break;
                            case 'woff':
                            case 'woff2':
                                const fontFace = new FontFace('customFont', `url(${finalUrl})`, {
                                    crossOrigin: crossorigin,
                                });
                                fontFace
                                    .load()
                                    .then(() => {
                                        if (!timedOut) {
                                            document.fonts.add(fontFace);
                                            resourceStates[url] = 'loaded';
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
                                        if (onError) onError(categorizedError, url);
                                        if (retryCount < retries) {
                                            log(`Retrying to load resource: ${finalUrl}`, 'warn');
                                            setTimeout(() => {
                                                loadResource(url, retryCount + 1)
                                                    .then(resolve)
                                                    .catch(reject);
                                            }, retryDelay);
                                        }
                                    });
                                return;
                            case 'pdf':
                            case 'zip':
                            case 'bin':
                            case 'mp3':
                            case 'mp4':
                            case 'avi':
                            case 'webm':
                            case 'ogg':
                            case 'wav':
                                fetch(finalUrl, { signal })
                                    .then((response) => {
                                        console.log('Fetch response status:', response.status);
                                        return response.blob();
                                    })
                                    .then((data) => {
                                        console.log('Blob data received:', data);
                                        if (!timedOut) {
                                            resourceStates[url] = 'loaded';
                                            resolve(data);
                                            if (onSuccess) onSuccess(data); // Invoke onSuccess callback
                                        }
                                    })
                                    .catch((error) => {
                                        const categorizedError = categorizeError(
                                            error,
                                            fileType,
                                            finalUrl
                                        );
                                        reject(categorizedError);
                                        if (onError) onError(categorizedError, url);
                                        if (retryCount < retries) {
                                            log(`Retrying to load resource: ${finalUrl}`, 'warn');
                                            setTimeout(() => {
                                                loadResource(url, retryCount + 1)
                                                    .then(resolve)
                                                    .catch(reject);
                                            }, retryDelay);
                                        }
                                    });
                                cancel = () => controller.abort();
                                return;
                            default:
                                const error = new Error(`Unsupported file type: ${fileType}`);
                                reject(error);
                                log(`Failed to load unsupported file type: ${finalUrl}`, 'error');
                                return;
                        }

                        applyAttributes(element, attributes, fileType);
                        startedLoading = true;
                        timeoutId = setTimeout(handleTimeout, timeout);

                        element.onload = () => {
                            if (!timedOut) {
                                clearTimeout(timeoutId);
                                log(`Resource loaded from: ${finalUrl}`, 'verbose');
                                resourceStates[url] = 'loaded';
                                resolve();
                                if (onSuccess) onSuccess(url);
                            }
                        };

                        element.onerror = () => {
                            clearTimeout(timeoutId);

                            const loadError = new Error(
                                `Failed to load resource from: ${finalUrl}`
                            );

                            const categorizedError = categorizeError(loadError, fileType, finalUrl);

                            reject(categorizedError);

                            log(`Failed to load resource from: ${finalUrl}`, 'warn');

                            resourceStates[url] = 'unloaded';

                            if (removeFailedElements && element && element.parentNode) {
                                element.parentNode.removeChild(element);
                                log(`Removed failed element: ${finalUrl}`, 'verbose');
                            }

                            if (onError) onError(categorizedError, url);

                            if (retryCount < retries) {
                                log(`Retrying to load resource: ${finalUrl}`, 'warn');
                                setTimeout(() => {
                                    loadResource(url, retryCount + 1)
                                        .then(resolve)
                                        .catch(reject);
                                }, retryDelay);
                            }
                        };

                        if (element.tagName) {
                            if (appendToBody && fileType === 'js') {
                                document.body.appendChild(element);
                            } else {
                                document.head.appendChild(element);
                            }
                        }

                        cancel = () => {
                            clearTimeout(timeoutId);
                            if (element && element.parentNode) {
                                element.parentNode.removeChild(element);
                                log(`Loading cancelled and element removed: ${finalUrl}`, 'warn');
                                resourceStates[url] = 'unloaded';
                            }
                        };
                    };

                    if (
                        fileType === 'js' &&
                        deferScriptsUntilReady &&
                        document.readyState !== 'complete'
                    ) {
                        window.addEventListener('DOMContentLoaded', () => {
                            log(`Deferring script load until DOM ready: ${finalUrl}`, 'verbose');
                            loadScriptWhenReady();
                        });
                    } else {
                        loadScriptWhenReady();
                    }
                }),
                cancel,
            }).promise;
        };

        function loadWithConcurrencyLimit(resources, loadFn, maxConcurrency) {
            let index = 0;
            const results = [];
            const total = resources.length;

            return new Promise((resolve) => {
                const startNext = () => {
                    if (index >= total) {
                        if (results.length === total) {
                            resolve(results);
                        }
                        return;
                    }

                    const currentIndex = index++;
                    const url = resources[currentIndex];

                    loadFn(url)
                        .then(() => {
                            results[currentIndex] = { status: 'fulfilled', value: url };
                            startNext();
                        })
                        .catch((error) => {
                            results[currentIndex] = {
                                status: 'rejected',
                                reason: error,
                                url,
                            };
                            startNext();
                        });
                };

                // Start initial batch
                for (let i = 0; i < Math.min(maxConcurrency, total); i++) {
                    startNext();
                }
            });
        }

        return loadWithConcurrencyLimit(sortedUrls, loadResource, maxConcurrency);
    }

    function unloadResource(url) {
        const elements = document.querySelectorAll(`[src="${url}"], [href="${url}"]`);
        elements.forEach((element) => element.remove());

        if (resourceLoadedPromises[url]) {
            delete resourceLoadedPromises[url];
            log(`Resource ${url} unloaded and cache cleared.`, 'verbose');
            resourceStates[url] = 'unloaded';
        }
    }

    function cancelResource(url) {
        if (resourceLoadedPromises[url] && resourceLoadedPromises[url].cancel) {
            resourceLoadedPromises[url].cancel();
            delete resourceLoadedPromises[url];
            log(`Resource ${url} loading cancelled.`, 'warn');
            resourceStates[url] = 'unloaded';
        }
    }

    function cancelAll() {
        Object.keys(resourceLoadedPromises).forEach((url) => {
            if (resourceLoadedPromises[url] && resourceLoadedPromises[url].cancel) {
                resourceLoadedPromises[url].cancel();
            }
        });
        resourceLoadedPromises = {};
        log('All resource loading operations cancelled.', 'warn');
    }

    function getResourceState(url) {
        return resourceStates[url] || 'unloaded';
    }

    return {
        include,
        unloadResource,
        cancelResource,
        cancelAll,
        getResourceState,
        setLoggingLevel,
    };
})();
