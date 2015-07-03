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
var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector2();
var intersects;

var canvas;
var renderer;
var scene;
var camera;
var light;
var background;
var ball;
var pointerArr = [];

var isFocusPointer = false;
var isViewingModal = false;

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
  var pointerValArr = [
    [0, 1200],
    [90, 1500],
    [120, 1000],
    [200, 1700],
    [270, 1200]
  ];
  var pointerGeometry1 = new THREE.CylinderGeometry(40, 0, 160, 6);
  var pointerGeometry2 = new THREE.SphereGeometry(30, 20, 20);
  var pointerMaterial = new THREE.MeshLambertMaterial({
    color: 0xcc3333
  });
  var pointerMatrix = new THREE.Matrix4().makeTranslation(0, 130, 0);
  pointerGeometry1.merge(pointerGeometry2, pointerMatrix);
  
  initThree();
  
  camera = new Camera();
  camera.init(canvas, bodyWidth, bodyHeight, rad1Default, rad2Default);
  
  light = new HemiLight();
  light.init(scene, 0, get.radian(180), 10000, 0xffffff, 0x666666, 1);
  
  background = new Bakcground();
  background.init(scene);
  
  for (var i = 0; i < pointerValArr.length; i++) {
    var radian = get.radian(pointerValArr[i][0]);
    var radius = pointerValArr[i][1];
    pointerArr[i] = new Pointer();
    pointerArr[i].init(scene, pointerGeometry1, pointerMaterial, radian, radius);
    pointerArr[i].radRotate = get.radian(get.randomInt(0, 360));
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
    if (isFocusPointer && !isViewingModal) {
      isViewingModal = true;
      return false;
    }
    if (!isDrag) {
      mousedownX = event.clientX;
      mousedownY = event.clientY;
      isDrag = true;
      return false;
    }
  });

  canvas.addEventListener('mousemove', function (event) {
    if (isDrag) {
      mousemoveX = event.clientX;
      mousemoveY = event.clientY;
      eventTouchMove();
    }
    mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseVector.y = - (event.clientY / window.innerHeight) * 2 + 1;
    return false;
  });

  canvas.addEventListener('mouseup', function () {
    eventTouchEnd();
    return false;
  });

  canvas.addEventListener('touchstart', function (event) {

    if (!isDrag) {
      mousedownX = event.touches[0].clientX;
      mousedownY = event.touches[0].clientY;
      isDrag = true;
      return false;
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
  var raycastId = 0;
  
  renderer.clear();
  raycaster.setFromCamera(mouseVector, camera.obj);
  intersects = raycaster.intersectObjects(scene.children);
  
  if (isViewingModal) {
    document.body.className = 'isViewingModal';
  }
  if (intersects.length > 1 && !isViewingModal) {
    raycastId = intersects[0].object.id;
  }
  if (intersects.length > 1 && !isViewingModal && !isFocusPointer) {
     isFocusPointer = true;
     document.body.className = 'isFocus';
  }
  if (intersects.length < 2 && isFocusPointer) {
    isFocusPointer = false;
    document.body.className = '';
  }
  
  for (var i = 0; i < pointerArr.length; i++) {
    pointerArr[i].radRotate += get.radian(2);
    pointerArr[i].animateStay();
    if (raycastId == pointerArr[i].mesh.id) {
      pointerArr[i].animateFocus();
    }
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
