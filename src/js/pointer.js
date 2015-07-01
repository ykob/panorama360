var Get = require('./get');
var get = new Get();

var exports = function(){
  var Pointer = function() {
    this.r = 0;
    this.rad1 = 0;
    this.rad2 = 0;
    this.radRotate = 0;
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

  return Pointer;
};

module.exports = exports();
