'use strict';

var FluidsGL = FluidsGL || {};

FluidsGL.Renderer = function(options, fs, vs) {
  this.grid = options.grid;
  this.uniforms = options.uniforms;

  var geometry = new THREE.PlaneBufferGeometry(
      2 * (this.grid.size.x - 2) / this.grid.size.x,
      2 * (this.grid.size.y - 2) / this.grid.size.y);
  var materialOptions = {
    uniforms: this.uniforms,
    fragmentShader: fs,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NoBlending
  };
  if (vs) materialOptions.vertexShader = vs;
  this.material = new THREE.ShaderMaterial(materialOptions);
  var quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);

  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  this.scene = new THREE.Scene();
  this.scene.add(quad);
};

FluidsGL.Renderer.prototype = {
  constructor: FluidsGL.Renderer,
  render: function(
      GLRenderer, uniformsValues, output = undefined, iterations = 1,
      flip = true) {
    for (var i = 0; i < iterations; i++) {
      for (var uniform in uniformsValues){
        if(uniformsValues[uniform].value instanceof FluidsGL.DoubleBuffer)
          this.uniforms[uniform].value = uniformsValues[uniform].value.read;
        else
          this.uniforms[uniform].value  = uniformsValues[uniform].value; 
      }
      if (output) {
        GLRenderer.render(this.scene, this.camera, output.write, false);
        if (flip) output.flip();
      } else {
        GLRenderer.render(this.scene, this.camera);
      }
    }
  }
};

FluidsGL.Renderer.make = function(options, fs, vs = undefined) {
  return new FluidsGL.Renderer(options, fs, vs);
}