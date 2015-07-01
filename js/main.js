(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var exports = function(){
  var Globe = function() {
    this.r = 2000;
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

},{}],2:[function(require,module,exports){
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
    this.r = 800;
    this.obj;
  };
  
  Camera.prototype.init = function(canvas, width, height, rad1, rad2) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.rad1 = rad1;
    this.rad2 = rad2;
    this.obj = new THREE.PerspectiveCamera(50, this.width / this.height, 1, 10000);
    this.setPosition(this.rad1, this.rad2);
  };
  
  Camera.prototype.setPosition = function(rad1, rad2) {
    var points;
    this.rad1 = rad1;
    this.rad2 = rad2;
    points = get.pointSphere(this.rad1, this.rad2, this.r);
    this.obj.position.set(points[0], points[1], points[2]);
    this.obj.up.set(0, 1, 0);
    this.obj.lookAt({
      x: 0,
      y: 0,
      z: 0
    });
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
var Get = require('./get');
var get = new Get();
var debounce = require('./debounce');
var Camera = require('./camera');
var PointLight = require('./pointLight');
var Bakcground = require('./background');

var bodyWidth = document.body.clientWidth;
var bodyHeight = document.body.clientHeight;
var fps = 60;
var frameTime = 1000 / this.fps;
var lastTimeRender;
var rad1Default = 0;
var rad2Default = 0;

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
  
  
  initThree();
  
  camera = new Camera();
  camera.init(canvas, bodyWidth, bodyHeight, rad1Default, rad2Default);
  
  light = new PointLight();
  light.init(scene, get.radian(90), 0, 1000, 0xffffff, 1, 10000);
  
  globe = new Bakcground();
  globe.init(scene);
  
  setEvent();
  renderloop();
  debounce(window, 'resize', function(event){
    resizeRenderer();
  });
};

var setEvent = function () {
  var mousedownX = 0;
  var mousedownY = 0;
  var mousemoveX = 0;
  var mousemoveY = 0;
  var radBase1 = rad1Default;
  var radBase2 = rad2Default;
  var rad1 = radBase1;
  var rad2 = radBase2;
  var isDrag = false;
  var axis = new THREE.Vector3(0, 1, 0);
  
  var eventTouchMove = function() {
    rad1 = radBase1 + get.radian((mousedownY - mousemoveY) / 4);
    rad2 = radBase2 + get.radian((mousedownX - mousemoveX) / 4);
    if (get.degree(rad1) > 90) {
        rad1 = get.radian(90);
    }
    if (get.degree(rad1) < -90) {
        rad1 = get.radian(-90);
    }
    camera.setPosition(rad1, rad2);
  };
  
  var eventTouchEnd = function() {
    if (isDrag) {
      radBase1 = rad1;
      radBase2 = rad2;
      isDrag = false;
    }
  };

  canvas.addEventListener('mousedown', function (event) {
    if (!isDrag) {
      mousedownX = event.clientX;
      mousedownY = event.clientY;
      isDrag = true;
    }
  });

  canvas.addEventListener('mousemove', function (event) {
    if (isDrag) {
      mousemoveX = event.clientX;
      mousemoveY = event.clientY;
      eventTouchMove();
    }
  });

  canvas.addEventListener('mouseup', function () {
    eventTouchEnd();
  });

  canvas.addEventListener('touchstart', function (event) {
    if (!isDrag) {
      mousedownX = event.touches[0].clientX;
      mousedownY = event.touches[0].clientY;
      isDrag = true;
    }
  });

  canvas.addEventListener('touchmove', function (event) {
    if (isDrag) {
      mousemoveX = event.touches[0].clientX;
      mousemoveY = event.touches[0].clientY;
      eventTouchMove();
    }
  });

  canvas.addEventListener('touchend', function () {
    eventTouchEnd();
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
  camera.init(canvas, bodyWidth, bodyHeight, rad1Default, rad2Default);
};

init();

},{"./background":1,"./camera":2,"./debounce":3,"./get":4,"./pointLight":6}],6:[function(require,module,exports){
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

},{"./get":4}]},{},[5]);
