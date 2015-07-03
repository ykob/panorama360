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
var exports = function(){
  var HemiLight = function() {
    this.rad1 = 0;
    this.rad2 = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.r = 0;
    this.obj;
  };
  
  HemiLight.prototype.init = function(scene, rad1, rad2, r, hex1, hex2, intensity) {
    this.r = r;
    this.obj = new THREE.HemisphereLight(hex1, hex2, intensity);
    this.setPosition(rad1, rad2);
    scene.add(this.obj);
  };
  
  HemiLight.prototype.setPosition = function(rad1, rad2) {
    this.rad1 = rad1;
    this.rad2 = rad2;
    this.x = Math.cos(this.rad1) * Math.cos(this.rad2) * this.r;
    this.y = Math.cos(this.rad1) * Math.sin(this.rad2) * this.r;
    this.z = Math.sin(this.rad1) * this.r;

    this.obj.position.set(this.x, this.y, this.z);
  };
  
  return HemiLight;
};

module.exports = exports();

},{}],6:[function(require,module,exports){
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
    pointerArr[i].modalId = i + 1;
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
  var isClick = false;
  var isDrag = false;
  var axis = new THREE.Vector3(0, 1, 0);
  var infoBack = document.getElementById('info-back');
  var close = document.getElementById('info-close');
  
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
  
  infoBack.addEventListener('mouseup', function (event) {
    event.preventDefault();
    touchEndInfoBack(event.clientX, event.clientY);
  });
  
  close.addEventListener('mouseup', function (event) {
    event.preventDefault();
    touchEndInfoBack(event.clientX, event.clientY);
  });
};

var render = function() {
  var raycastId = -1;

  renderer.clear();
  raycaster.setFromCamera(mouseVector, camera.obj);
  intersects = raycaster.intersectObjects(scene.children);
  
  if (isViewingModal) {
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

},{"./background":1,"./camera":2,"./debounce":3,"./get":4,"./hemiLight":5,"./pointer":7}],7:[function(require,module,exports){
var Get = require('./get');
var get = new Get();

var exports = function(){
  var Pointer = function() {
    this.r = 0;
    this.rad1 = 0;
    this.rad2 = 0;
    this.radRotate = 0;
    this.modalId = 0;
    this.geometry;
    this.material;
    this.mesh;
  };

  Pointer.prototype.init = function(scene, geometry, material, radian, radius) {
    this.geometry = geometry;
    this.material = material;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.r = radius;
    this.rad1 = 0;
    this.rad2 = radian;
    this.setPosition();
    scene.add(this.mesh);
  };
  
  Pointer.prototype.setPosition = function() {
    var points = get.pointSphere(this.rad1, this.rad2, this.r);
    this.mesh.position.set(points[0], points[1], points[2]);
  };

  Pointer.prototype.animateStay = function() {
    this.mesh.rotation.y = this.radRotate;
    this.mesh.position.y = Math.sin(this.radRotate) * 20 - 50;
  };

  Pointer.prototype.animateFocus = function() {
    this.radRotate += get.radian(4);
  };

  return Pointer;
};

module.exports = exports();

},{"./get":4}]},{},[6]);
