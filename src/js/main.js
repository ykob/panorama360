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
  camera.init(canvas, bodyWidth, bodyHeight, rad1Default, rad2Default);
  
  light = new PointLight();
  light.init(scene, get.radian(90), 0, 1000, 0xffffff, 1, 10000);
  
  globe = new Globe();
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
      rad1 = radBase1 + get.radian((mousemoveY - mousedownY) / 4);
      rad2 = radBase2 + get.radian((mousemoveX - mousedownX) / 4);
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
      rad1 = radBase1 + get.radian((mousedownY - mousemoveY) / 4);
      rad2 = radBase2 + get.radian((mousedownX - mousemoveX) / 4);
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
  camera.init(bodyWidth, bodyHeight);
};

init();
