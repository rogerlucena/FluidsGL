"use strict";

var FluidsGL = FluidsGL || {};

FluidsGL.DoubleBuffer = function(width, height, options) {
  this.read = new THREE.WebGLRenderTarget(width, height, options);
  this.write = this.read.clone();
};

FluidsGL.DoubleBuffer.prototype = {
  constructor: FluidsGL.DoubleBuffer,
  flip: function() {
      var tmp = this.read;
      this.read = this.write;
      this.write = tmp;
  },
  clear: function(GLRenderer){
    GLRenderer.clearTarget(this.write, true, false, false);
    this.flip();
  }
};

FluidsGL.DoubleBuffer.make = function(width, height) {
  var options = {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
    shareDepthFrom: null
  };
  return new FluidsGL.DoubleBuffer(width, height, options);
}