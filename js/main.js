'use strict';

var FluidsGL = FluidsGL || {};

var windowSize = new THREE.Vector2(window.innerWidth, window.innerHeight);

var GLRenderer = new THREE.WebGLRenderer();
GLRenderer.autoClear = false;
GLRenderer.sortObjects = false;
GLRenderer.clearBeforeRender = false;
GLRenderer.setPixelRatio(window.devicePixelRatio);
GLRenderer.setSize(windowSize.x, windowSize.y);
// GLRenderer.setClearColor(0x000000);
document.body.appendChild(GLRenderer.domElement);

var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);


// GUI parameters
var gui;

var grid = {size: new THREE.Vector2(640, 360), scale: 1};
var time = {timestep: 1};
var parameters = {dissipation : 1.0, radius : 0.2, pause : false};
var displaySettings = {slab: 'density'};

// Display and renderers declaration
var scalarDisplay, vectorDisplay;
var renderers;

// DoubleBuffers declaration
var doubleBuffers;

// Mouse declaration
var mouse = new FluidsGL.Mouse(grid);

function init(shaders) {
  // Create GUI
  gui = new dat.GUI();
  gui.add(
      displaySettings, 'slab',
      ['density', 'velocity', 'divergence', 'pressure']);
  gui.add(time, 'timestep', 1, 10);
  gui.add(parameters, 'dissipation', 0.98, 1.0);
  gui.add(parameters, 'radius', 0, 1.0);
  gui.add(parameters, 'pause');
  // Create displays
  scalarDisplay = FluidsGL.Renderer.make(
      {
        grid: grid,
        uniforms: {read: {type: 't'}, bias: {type: 'v3'}, scale: {type: 'v3'}}
      },
      shaders.scalardisplay, shaders.basic);

  vectorDisplay = FluidsGL.Renderer.make(
      {grid: grid, uniforms: {read: {type: 't'}}}, shaders.vectordisplay,
      shaders.basic);

  // Create renderers
  renderers = {
    mouse: FluidsGL.Renderer.make(
        {
          grid: grid,
          uniforms: {
            read: {type: 't'},
            gridSize: {type: 'v2'},
            color: {type: 'v3'},
            point: {type: 'v2'},
            radius: {type: 'f'}
          }
        },
        shaders.mouse),
    advect: FluidsGL.Renderer.make(
        {
          grid: grid,
          uniforms: {
            velocity: {type: 't'},
            advected: {type: 't'},
            gridSize: {type: 'v2'},
            gridScale: {type: 'f'},
            timestep: {type: 'f'},
            dissipation: {type: 'f'}
          }
        },
        shaders.advect),
    gradient: FluidsGL.Renderer.make(
        {
          grid: grid,
          uniforms: {
            p: {type: 't'},
            w: {type: 't'},
            gridSize: {type: 'v2'},
            gridScale: {type: 'f'}
          }
        },
        shaders.gradient),
    divergence: FluidsGL.Renderer.make(
        {
          grid: grid,
          uniforms: {
            velocity: {type: 't'},
            gridSize: {type: 'v2'},
            gridScale: {type: 'f'}
          }
        },
        shaders.divergence),
    jacobis: FluidsGL.Renderer.make(
        {
          grid: grid,
          uniforms: {
            x: {type: 't'},
            b: {type: 't'},
            gridSize: {type: 'v2'},
            alpha: {type: 'f'},
            beta: {type: 'f'}
          }
        },
        shaders.jacobiscalar)
  };
  // Create double buffers
  doubleBuffers = {
    velocity: FluidsGL.DoubleBuffer.make(grid.size.x, grid.size.y),
    density: FluidsGL.DoubleBuffer.make(grid.size.x, grid.size.y),
    velocityDivergence: FluidsGL.DoubleBuffer.make(grid.size.x, grid.size.y),
    pressure: FluidsGL.DoubleBuffer.make(grid.size.x, grid.size.y)
  };

  gui.add({ clear:function(){ 
    for (var buffer in doubleBuffers) {
      doubleBuffers[buffer].clear(GLRenderer);
      doubleBuffers[buffer].clear(GLRenderer);
    }
  }}, 'clear')
  requestAnimationFrame(update);
}

function advect() {
  renderers.advect.render(
      GLRenderer, {
        velocity: {value: doubleBuffers.velocity},
        advected: {value: doubleBuffers.velocity},
        gridSize: {value: grid.size},
        gridScale: {value: grid.scale},
        timestep: {value: time.timestep},
        dissipation: {value: 1.0}
      },
      doubleBuffers.velocity);
  renderers.advect.render(
      GLRenderer, {
        velocity: {value: doubleBuffers.velocity},
        advected: {value: doubleBuffers.density},
        gridSize: {value: grid.size},
        gridScale: {value: grid.scale},
        timestep: {value: time.timestep},
        dissipation: {value: parameters.dissipation}
      },
      doubleBuffers.density);
}
function addForces() {
  var color = new THREE.Vector3(1.0, 1.0, 1.0);

  var point = new THREE.Vector2();
  var force = new THREE.Vector3();
  for (var i = 0; i < mouse.motions.length; i++) {
    var motion = mouse.motions[i];

    point.set(motion.position.x, windowSize.y - motion.position.y);
    
    point.x = (point.x / windowSize.x) * grid.size.x;
    point.y = (point.y / windowSize.y) * grid.size.y;

    if (motion.left) {
      force.set(motion.drag.x, -motion.drag.y, 0);

      renderers.mouse.render(
          GLRenderer, {
            read: {value: doubleBuffers.velocity},
            gridSize: {value: grid.size},
            color: {value: force},
            point: {value: point},
            radius: {value: parameters.radius}
          },
          doubleBuffers.velocity);
    }

    if (motion.right) {
      renderers.mouse.render(
          GLRenderer, {
            read: {value: doubleBuffers.density},
            gridSize: {value: grid.size},
            color: {value: color},
            point: {value: point},
            radius: {value: parameters.radius}
          },
          doubleBuffers.density);
    }
  }
  mouse.motions = [];
}
function project() {
  doubleBuffers.pressure.clear(GLRenderer);
  
  renderers.divergence.render(
      GLRenderer, {
        velocity: {value: doubleBuffers.velocity},
        gridSize: {value: grid.size},
        gridScale: {value: grid.scale}
      },
      doubleBuffers.velocityDivergence);

  renderers.jacobis.render(
      GLRenderer, {
        x: {value: doubleBuffers.pressure},
        b: {value: doubleBuffers.velocityDivergence},
        gridSize: {value: grid.size},
        alpha: {value: -grid.scale * grid.scale},
        beta: {value: 4}
      },
      doubleBuffers.pressure, 50);

  renderers.gradient.render(
      GLRenderer, {
        p: {value: doubleBuffers.pressure},
        w: {value: doubleBuffers.velocity},
        gridSize: {value: grid.size},
        gridScale: {value: grid.scale}
      },
      doubleBuffers.velocity);
}
function step() {
  if(!parameters.pause)
    advect();
  addForces();
  if(!parameters.pause)
    project();
}

function update() {
  stats.begin();
  step();
  render();
  stats.end();
  requestAnimationFrame(update);
}

function render() {
  switch (displaySettings.slab) {
    case 'velocity':
      vectorDisplay.render(
          GLRenderer, {read: {value: doubleBuffers.velocity.read}});
      break;
    case 'density':
      scalarDisplay.render(GLRenderer, {
        read: {value: doubleBuffers.density.read},
        bias: {value: new THREE.Vector3(0.0, 0.0, 0.0)},
        scale: {value: new THREE.Vector3(1.0, 1.0, 1.0)}
      });
      break;
    case 'divergence':
      scalarDisplay.render(GLRenderer, {
        read: {value: doubleBuffers.velocityDivergence.read},
        bias: {value: new THREE.Vector3(0.5, 0.5, 0.5)},
        scale: {value: new THREE.Vector3(0.5, 0.5, 0.5)}
      });
      break;
    case 'pressure':
      scalarDisplay.render(GLRenderer, {
        read: {value: doubleBuffers.pressure.read},
        bias: {value: new THREE.Vector3(0.5, 0.5, 0.5)},
        scale: {value: new THREE.Vector3(0.5, 0.5, 0.5)}
      });
      break;
  }
}

var loader = new FluidsGL.FileLoader('shaders', [
  'advect.fs', 'basic.vs', 'scalardisplay.fs', 'vectordisplay.fs',
  'divergence.fs', 'gradient.fs', 'jacobiscalar.fs', 'jacobivector.fs',
  'mouse.fs'
]);

loader.run(function(files) {
  var shaders = {};
  for (var name in files) {
    shaders[name.split('.')[0]] = files[name];
  }
  init(shaders);
});