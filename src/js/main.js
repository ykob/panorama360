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
var focusedPointerId = 0;

var canvas;
var renderer;
var scene;
var camera;
var light;
var background;
var ball;
var pointerArr = [];
var information = document.getElementById('information');

var isFocusPointer = false;
var isViewingModal = false;
var isViewedModal = false;

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
  
  light = new HemiLight();
  light.init(scene, 0, get.radian(180), 10000, 0xffffff, 0x666666, 1);
  
  background = new Bakcground();
  background.init(scene);

  
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
  var isClick = false;
  var isDrag = false;
  var axis = new THREE.Vector3(0, 1, 0);
  
  var eventTouchStart = function(x, y) {
    if (!isClick) {
      mousedownX = x;
      mousedownY = y;
      mouseVector.x = (x / window.innerWidth) * 2 - 1;
      mouseVector.y = - (y / window.innerHeight) * 2 + 1;
      isClick = true;
    }
  };
  
  var eventTouchMove = function(x, y) {
    mousemoveX = x;
    mousemoveY = y;
    mouseVector.x = (x / window.innerWidth) * 2 - 1;
    mouseVector.y = - (y / window.innerHeight) * 2 + 1;
    if (isClick) {
      if (Math.abs(mousedownX - mousemoveX) > 5 || Math.abs(mousedownY - mousemoveY) > 5) {
        isClick = false;
        isDrag = true;
      }
    }
    if (isDrag) {
      rad1 = radBase1 + get.radian((mousedownY - mousemoveY) / 4);
      rad2 = radBase2 + get.radian((mousedownX - mousemoveX) / 4);
      if (get.degree(rad1) > 90) {
          rad1 = get.radian(90);
      }
      if (get.degree(rad1) < -90) {
          rad1 = get.radian(-90);
      }
      camera.setPosition(rad1, rad2);
    }
  };
  
  var eventTouchEnd = function() {
    mouseVector.x = -2;
    mouseVector.y = -2;
    if (isDrag) {
      radBase1 = rad1;
      radBase2 = rad2;
      isDrag = false;
    } else if (isFocusPointer && !isViewingModal) {
      isViewingModal = true;
    }
    if (isClick) {
      isClick = false;
    }
  };
  
  var touchEndInfoBack = function(x, y) {
    if (isViewedModal && !isViewingModal) {
      mouseVector.x = (x / window.innerWidth) * 2 - 1;
      mouseVector.y = - (y / window.innerHeight) * 2 + 1;
      document.body.className = '';
      information.className = 'information';
      isViewedModal = false;
      focusedPointerId = 0;
    }
  };

  canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('selectstart', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('mousedown', function (event) {
    event.preventDefault();
    eventTouchStart(event.clientX, event.clientY);
  });

  canvas.addEventListener('mousemove', function (event) {
    event.preventDefault();
    eventTouchMove(event.clientX, event.clientY);
  });

  canvas.addEventListener('mouseup', function (event) {
    event.preventDefault();
    eventTouchEnd();
  });

  canvas.addEventListener('touchstart', function (event) {
    event.preventDefault();
    eventTouchStart(event.touches[0].clientX, event.touches[0].clientY);
  });

  canvas.addEventListener('touchmove', function (event) {
    event.preventDefault();
    eventTouchMove(event.touches[0].clientX, event.touches[0].clientY);
  });

  canvas.addEventListener('touchend', function (event) {
    event.preventDefault();
    eventTouchEnd();
  });
};

var render = function() {
  var raycastId = -1;

  renderer.clear();
  raycaster.setFromCamera(mouseVector, camera.obj);
  intersects = raycaster.intersectObjects(scene.children);
  
  if (isViewingModal) {
    mouseVector.x = -2;
    mouseVector.y = -2;
    document.body.className = 'is-viewing-modal';
    information.className = 'information viewing-modal-id-0' + focusedPointerId;
    setTimeout(function() {
      isViewingModal = false;
      isViewedModal = true;
    }, 400);
  }
  if (intersects.length > 1 && !isViewingModal) {
    raycastId = intersects[0].object.id;
  }
  if (intersects.length > 1 && !isViewingModal && !isFocusPointer) {
     isFocusPointer = true;
     document.body.className = 'is-focus';
  }
  if (intersects.length < 2 && !isViewedModal && isFocusPointer) {
    isFocusPointer = false;
    document.body.className = '';
  }
  
  for (var i = 0; i < pointerArr.length; i++) {
    pointerArr[i].radRotate += get.radian(2);
    pointerArr[i].animateStay();
    if (raycastId == pointerArr[i].mesh.id) {
      pointerArr[i].animateFocus();
      focusedPointerId = pointerArr[i].modalId;
    } else {
      pointerArr[i].outFocus();
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
