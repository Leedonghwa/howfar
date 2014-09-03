// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones,
requirejs.config({
    "baseUrl": "../lib",
    "paths": {
      "app": "../js",
      "jquery": "jquery-2.1.1.min.js"
    }
});

//Load the main app module to start the app
requirejs(["app/main"]);