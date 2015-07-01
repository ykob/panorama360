var Get = require('./get');
var get = new Get();
var debounce = require('./debounce');
var Camera = require('./camera');
var HemiLight = require('./hemiLight');
var Bakcground = require('./background');
var Pointer = require('./pointer');

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
var pointerArr = [];

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
  var pointerArr = [
    [0, 50000],
    [90, 100000],
    [120, 70000],
    [200, 100000],
    [270, 80000]
  ];
  var pointerGeometry1 = new THREE.CylinderGeometry(40, 0, 160, 8);
  var pointerGeometry2 = new THREE.SphereGeometry(30, 20, 20);
  var pointerMaterial = new THREE.MeshLambertMaterial({
    color: 0x44aaff
  });
  var pointerMatrix = new THREE.Matrix4().makeTranslation(0, 130, 0);
  console.log(pointerMatrix);
  pointerGeometry1.merge(pointerGeometry2, pointerMatrix);
  
  initThree();
  
  camera = new Camera();
  camera.init(canvas, bodyWidth, bodyHeight, rad1Default, rad2Default);
  
  light = new HemiLight();
  light.init(scene, 0, get.radian(180), 10000, 0xffffff, 0x222222, 1);
  
  globe = new Bakcground();
  globe.init(scene);
  
  for (var i = 0; i < pointerArr.length; i++) {
    var radian = get.radian(pointerArr[i][0]);
    var radius = get.radian(pointerArr[i][1]);
    pointerArr[i] = new Pointer();
    pointerArr[i].init(scene, pointerGeometry1, pointerMaterial, radian, radius);
  }
  
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
