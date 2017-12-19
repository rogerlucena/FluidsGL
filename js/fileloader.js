var FluidsGL = FluidsGL || {};

"use strict";
// Loads arbitrary number of files in a batch and gives a callback when every
// file has been loaded with its response text.

// Construct a file loader with a suffix path that is prepended to all
// names.
FluidsGL.FileLoader = function(path, names) {
    this.path = path;
    this.queue = [];
    for (var i = 0; i < names.length; i++) {
        var name = names[i];
        var url = path + "/" + name;
        var file = {
            name: name,
            url: url
        };
        this.queue.push(file);
    }
};

FluidsGL.FileLoader.prototype = {
    constructor: FluidsGL.FileLoader,

    // Load all files currently in the queue, calls onDone when all files
    // has been downloaded.
    run: function(onDone) {
        var files = {};
        var filesRemaining = this.queue.length;

        var fileLoaded = function(file) {
            files[file.name] = file.text;
            filesRemaining--;
            if (filesRemaining === 0) {
                onDone(files);
            }
        };

        var loadFile = function(file) {
            var request = new XMLHttpRequest();
            request.onload = function() {
                if (request.status === 200) {
                    file.text = request.responseText;
                }
                fileLoaded(file);
            };
            request.open("GET", file.url, true);
            request.send();
        };

        for (var i = 0; i < this.queue.length; i++) {
            loadFile(this.queue[i]);
        }
        this.queue = [];
    }
};