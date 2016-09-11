// init the enemy
// load flamingo
let enemy = {}
let mixers = []
let clock = new THREE.Clock()

let jsonLoader = new THREE.JSONLoader()
let flamingoMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    morphTargets: true,
    vertexColors: THREE.FaceColors,
    shading: THREE.FlatShading
})
let flamingoGeometry = {}
jsonLoader.load("src/flamingo.js", function(geometry) {
    flamingoGeometry = geometry
    console.log('flamingo geometry: ', flamingoGeometry)
    enemy = new THREE.Mesh(flamingoGeometry, flamingoMaterial)
    enemy.scale.set(0.3, 0.3, 0.3)
    enemy.hungerLevel = 0
    scene.add(enemy)
    let mixer = new THREE.AnimationMixer(enemy)
    mixer.clipAction(flamingoGeometry.animations[0]).setDuration(1).play()
    mixers.push(mixer)
})

// enemy update clock
let enemyClock = 5
// update the enemy
let updateEnemy = () => {
  enemyClock =- 1
  if (enemyClock >= 0) {
    enemyClock = 5
    enemy.hungerLevel =+ 1
  }
  // act accordingly
  if (enemy.hungerLevel > 8) {
    // look for a tasty treat
  } else {
    // randomly swoop around
  }
}
