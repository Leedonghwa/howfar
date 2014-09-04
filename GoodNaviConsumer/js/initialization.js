// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones,
requirejs.config({
    "baseUrl": "./lib",
    "paths": {
      "js": "../js",
      "jquery": "jquery.js"
    }
});

console.log("initialization.js: requirejs.config");

//Load the main app module to start the app
requirejs(["js/main"]);