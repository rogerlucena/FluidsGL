"use strict";

var FluidsGL = FluidsGL || {};

FluidsGL.Mouse = function(grid) {
    this.grid = grid;

    this.left = false;
    this.right = false;
    this.position = new THREE.Vector2();
    this.motions = [];

    document.addEventListener("mousedown", this.mouseDown.bind(this), false);
    document.addEventListener("mouseup", this.mouseUp.bind(this), false);
    document.addEventListener("mousemove", this.mouseMove.bind(this), false);
    document.addEventListener("contextmenu", this.contextMenu.bind(this), false);
};

FluidsGL.Mouse.prototype = {
    constructor: FluidsGL.Mouse,

    mouseDown: function(event) {
        this.position.set(event.clientX, event.clientY);
        this.left = event.button === 0 ? true : this.left;
        this.right = event.button === 2 ? true : this.right;
    },

    mouseUp: function(event) {
        event.preventDefault();
        this.left = event.button === 0 ? false : this.left;
        this.right = event.button === 2 ? false : this.right;
    },

    mouseMove: function(event) {
        event.preventDefault();
        var r = this.grid.scale;

        var x = event.clientX;
        var y = event.clientY;

        if (this.left || this.right) {
            var dx = x - this.position.x;
            var dy = y - this.position.y;

            var drag = {
                x: Math.min(Math.max(dx, -r), r),
                y: Math.min(Math.max(dy, -r), r)
            };

            var position = {
                x: x,
                y: y
            };

            this.motions.push({
                left: this.left,
                right: this.right,
                drag: drag,
                position: position
            });
        }

        this.position.set(x, y);
    },

    contextMenu: function(event) {
        event.preventDefault();
    }
};
