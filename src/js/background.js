var exports = function(){
  var Background = function() {
    this.r = 500;
    this.segment = 30;
    this.video = document.getElementById('video');
    this.textureSrc;
    this.geometry;
    this.material;
    this.mesh;
  };

  Background.prototype.init = function(scene) {
    this.video.muted = true;
    this.texture = new THREE.VideoTexture(this.video);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.format = THREE.RGBFormat;
    this.geometry = new THREE.SphereGeometry(this.r, this.segment, this.segment);
    this.geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    scene.add(this.mesh);
  };

  return Background;
};

module.exports = exports();
