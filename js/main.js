(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Get = require('./get');
var get = new Get();

var exports = function() {
  var Ball = function() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.geometry;
    this.material;
    this.mesh;
  };

  Ball.prototype.init = function(scene, geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.setPosition();
    scene.add(this.mesh);
  };

  Ball.prototype.setPosition = function() {
    this.mesh.position.set(this.x, this.y, this.z);
  };
  
  return Ball;
};

module.exports = exports();

},{"./get":4}],2:[function(require,module,exports){
var Get = require('./get');
var get = new Get();

var exports = function(){
  var Camera = function() {
    this.width = 0;
    this.height = 0;
    this.rad1 = 0;
    this.rad2 = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.r = 0;
    this.obj;
    this.trackball;
  };
  
  Camera.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;
    this.r = 1200;
    this.rad1 = get.radian(-20);
    this.rad2 = get.radian(0);
    this.obj = new THREE.PerspectiveCamera(50, this.width / this.height, 1, 10000);
    this.setPosition(this.rad1, this.rad2, this.r);
    this.initTrackBall();
  };
  
  Camera.prototype.setPosition = function(rad1, rad2) {
    var points;
    this.rad1 = rad1;
    this.rad2 = rad2;
    points = get.pointSphere(this.rad1, this.rad2, this.r);
    this.obj.position.set(points[0], points[1], points[2]);
    this.obj.up.set(0, 1, 0.5);
    this.obj.lookAt({
      x: 0,
      y: 0,
      z: 0
    });
  };
  
  Camera.prototype.initTrackBall = function() {
    this.trackball = new THREE.TrackballControls(this.obj, this.canvas);
    this.trackball.screen.width = this.width;
    this.trackball.screen.height = this.height;
    this.trackball.noRotate = false;
    this.trackball.rotateSpeed = 3;
    this.trackball.noZoom = true;
    this.trackball.zoomSpeed = 1;
    this.trackball.noPan = false;
    this.trackball.maxDistance = 3000;
    this.trackball.minDistance = 500;
  };
  
  return Camera;
};

module.exports = exports();

},{"./get":4}],3:[function(require,module,exports){
module.exports = function(object, eventType, callback){
  var timer;

  object.addEventListener(eventType, function(event) {
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback(event);
    }, 500);
  }, false);
};

},{}],4:[function(require,module,exports){
var exports = function(){
  var Get = function() {};
  
  Get.prototype.randomInt = function(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  };
  
  Get.prototype.degree = function(radian) {
    return radian / Math.PI * 180;
  };
  
  Get.prototype.radian = function(degrees) {
    return degrees * Math.PI / 180;
  };
  
  Get.prototype.pointSphere = function(rad1, rad2, r) {
    var x = Math.cos(rad1) * Math.cos(rad2) * r;
    var z = Math.cos(rad1) * Math.sin(rad2) * r;
    var y = Math.sin(rad1) * r;
    return [x, y, z];
  };
  
  return Get;
};

module.exports = exports();

},{}],5:[function(require,module,exports){
var exports = function(){
  var Globe = function() {
    this.r = 2400;
    this.segment = 30;
    this.textureSrc;
    
    this.geometry;
    this.material;
    this.mesh;
  };

  Globe.prototype.init = function(scene) {
    this.textureSrc = new THREE.ImageUtils.loadTexture('img/360.jpg');
    this.geometry = new THREE.SphereGeometry(this.r, this.segment, this.segment);
    this.geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
    this.material = new THREE.MeshBasicMaterial({
      map: this.textureSrc
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    scene.add(this.mesh);
  };

  return Globe;
};

module.exports = exports();

},{}],6:[function(require,module,exports){
var Get = require('./get');
var get = new Get();
var debounce = require('./debounce');
var Camera = require('./camera');
var PointLight = require('./pointLight');
var Globe = require('./globe');
var Ball = require('./ball');
var Particle = require('./particle');

var bodyWidth = document.body.clientWidth;
var bodyHeight = document.body.clientHeight;
var fps = 60;
var frameTime = 1000 / this.fps;
var lastTimeRender;

var canvas;
var renderer;
var scene;
var camera;
var light;
var globe;
var ball;
var particleArr = [];
var particleNum = 64;

var initThree = function() {
  canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  if (!renderer) {
    alert('Three.jsの初期化に失敗しました。');
  }
  renderer.setSize(bodyWidth, bodyHeight);
  canvas.appendChild(renderer.domElement);
  renderer.setClearColor(0x111111, 1.0);
  
  scene = new THREE.Scene();
};

var init = function() {
  var ballGeometry = new THREE.SphereGeometry(120, 30, 30);
  var ballMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    opacity: 0.8,
    transparent: true
  });
  var baseGeometry = new THREE.BoxGeometry(1, 1, 1);
  var baseMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff
  });
  
  initThree();
  
  camera = new Camera();
  camera.init(bodyWidth, bodyHeight);
  
  light = new PointLight();
  light.init(scene, get.radian(90), 0, 1000, 0xffffff, 1, 10000);
  
  globe = new Globe();
  globe.init(scene);
  
  ball = new Ball();
  ball.init(scene, ballGeometry, ballMaterial);
  
  for (var i = 0; i < particleNum; i++) {
    particleArr[i] = new Particle();
    particleArr[i].init(scene, baseGeometry, baseMaterial, i, particleNum);
  };
  
  renderloop();
  debounce(window, 'resize', function(event){
    resizeRenderer();
  });
};

var render = function() {
  renderer.clear();
  
  for (var i = 0; i < particleArr.length; i++) {
    particleArr[i].rad1Base += get.radian(1);
    particleArr[i].rad2Base += get.radian(2);
    particleArr[i].move();
    particleArr[i].setPosition();
    particleArr[i].setRotation();
  };
  
  renderer.render(scene, camera.obj);
  camera.trackball.update();
};

var renderloop = function() {
  var now = +new Date();
  requestAnimationFrame(renderloop);

  if (now - lastTimeRender < frameTime) {
    return;
  }
  render();
  lastTimeRender = +new Date();
};

var resizeRenderer = function() {
  bodyWidth  = document.body.clientWidth;
  bodyHeight = document.body.clientHeight;
  renderer.setSize(bodyWidth, bodyHeight);
  camera.init(bodyWidth, bodyHeight);
};

init();

},{"./ball":1,"./camera":2,"./debounce":3,"./get":4,"./globe":5,"./particle":7,"./pointLight":8}],7:[function(require,module,exports){
var Get = require('./get');
var get = new Get();

var exports = function() {
  var Particle = function() {
    this.size = 1;
    this.scale = 0;
    this.rad1Base = 0;
    this.rad1 = 0;
    this.rad2Base = 0;
    this.rad2 = 0;
    this.r = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rotateX = 0;
    this.rotateY = 0;
    this.rotateZ = 0;
    this.geometry;
    this.material;
    this.mesh;
  };

  Particle.prototype.init = function(scene, geometry, material, index, all) {
    this.geometry = geometry;
    this.material = material;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scale = 60;
    this.r = 320;

    this.changeScale();
    this.rad1Base = get.radian(360 * index / all);
    this.rad2Base = get.radian(360 * index / all);
    this.move(index);
    this.setPosition();
    this.setRotation();
    scene.add(this.mesh);
  };

  Particle.prototype.changeScale = function() {
    this.mesh.scale.x = this.scale * this.size;
    this.mesh.scale.y = this.scale * this.size;
    this.mesh.scale.z = this.scale * this.size;
  };

  Particle.prototype.move = function(index) {
    this.rad1 = get.radian(Math.sin(this.rad1Base) * 10);
    this.rad2 = this.rad2Base;
  };

  Particle.prototype.setPosition = function() {
    var points = get.pointSphere(this.rad1, this.rad2, this.r);
    this.mesh.position.set(points[0], points[1], points[2]);
  };

  Particle.prototype.setRotation = function() {
    this.rotateX = this.rad1 * 3;
    this.rotateY = this.rad1 * 3;
    this.rotateZ = this.rad1 * 3;
    this.mesh.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
  };
  
  return Particle;
};

module.exports = exports();

},{"./get":4}],8:[function(require,module,exports){
var Get = require('./get');
var get = new Get();

var exports = function(){
  var PointLight = function() {
    this.rad1 = 0;
    this.rad2 = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.r = 0;
    this.obj;
  };
  
  PointLight.prototype.init = function(scene, rad1, rad2, r, hex, intensity, distance) {
    this.r = r;
    this.obj = new THREE.PointLight(hex, intensity, distance);
    this.setPosition(rad1, rad2);
    scene.add(this.obj);
  };
  
  PointLight.prototype.setPosition = function(rad1, rad2) {
    var points;
    this.rad1 = rad1;
    this.rad2 = rad2;
    points = get.pointSphere(this.rad1, this.rad2, this.r);
    this.obj.position.set(points[0], points[1], points[2]);
  };
  
  return PointLight;
};

module.exports = exports();

},{"./get":4}]},{},[6]);
