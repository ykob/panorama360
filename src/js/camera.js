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
    this.r = 600;
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
