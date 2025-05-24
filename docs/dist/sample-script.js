/* Sample JavaScript file for testing ResourceLoader */
(function () {
	console.log('Sample script loaded successfully');

	// Create a global object to demonstrate the script was loaded
	window.ResourceLoaderTest = {
		loaded: true,
		timestamp: new Date().toISOString(),
		sayHello: function () {
			return 'Hello from sample-script.js!';
		}
	};
})();
