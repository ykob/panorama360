var Get = require('./get');
var get = new Get();

var exports = function(){
  var Pointer = function() {
    this.r = 0;
    this.h = 0;
    this.s = 0.8;
    this.l = 0.6;
    this.rad1 = 0;
    this.rad2 = 0;
    this.radRotate = 0;
    this.modalId = 0;
    this.geometry;
    this.material;
    this.mesh;
    this.cd = 0.5;
    this.k  = 0.05;
    this.colorR  = 0;
    this.colorRBase = this.colorR;
    this.colorG  = 0;
    this.colorGBase = this.colorG;
    this.colorB  = 0;
    this.colorBBase = this.colorB;
    this.ar = 0;
    this.ag = 0;
    this.ab = 0;
    this.vr = 0;
    this.vg = 0;
    this.vb = 0;
  };

  Pointer.prototype.init = function(scene, geometry, material, radian, radius) {
    this.geometry = geometry;
    this.material = new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.2, 0.9, 0.8)
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.r = radius;
    this.rad1 = 0;
    this.rad2 = radian;
    this.setPosition();
    scene.add(this.mesh);
  };
  
  Pointer.prototype.changeColor = function() {
    this.ar = (this.colorRBase - this.colorR) * this.k;
    this.ag = (this.colorGBase - this.colorG) * this.k;
    this.ab = (this.colorBBase - this.colorB) * this.k;
    this.ar -= this.cd * this.vr;
    this.ag -= this.cd * this.vg;
    this.ab -= this.cd * this.vb;
    this.vr += this.ar;
    this.vg += this.ag;
    this.vb += this.ab;
    this.colorR += this.vr;
    this.colorG += this.vg;
    this.colorB += this.vb;
    
    this.material.color.setRGB(this.colorR / 1000, this.colorG / 1000, this.colorB / 1000);
  };
  
  Pointer.prototype.setPosition = function() {
    var points = get.pointSphere(this.rad1, this.rad2, this.r);
    this.mesh.position.set(points[0], points[1], points[2]);
  };

  Pointer.prototype.animateStay = function() {
    this.changeColor();
    this.mesh.rotation.y = this.radRotate;
    this.mesh.position.y = Math.sin(this.radRotate) * 20 - 50;
  };

  Pointer.prototype.animateFocus = function() {
    this.colorRBase = 200;
    this.colorGBase = 800;
    this.colorBBase = 800;
    this.radRotate += get.radian(4);
  };

  Pointer.prototype.outFocus = function() {
    this.colorRBase = 800;
    this.colorGBase = 200;
    this.colorBBase = 200;
  };

  return Pointer;
};

module.exports = exports();
