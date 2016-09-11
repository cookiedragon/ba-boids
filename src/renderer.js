"use strict"

let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
scene.add(camera)
camera.position.set(15, 10, 150)

const directional_light = new THREE.DirectionalLight(0xffffff, 1)
directional_light.position.set(1, 1, 1).normalize()
scene.add(directional_light)
const ambient_light = new THREE.AmbientLight(0x404040)
scene.add(ambient_light)

let renderer = new THREE.WebGLRenderer({
    alpha: true
})
renderer.setClearColor(0xffffff, 0);
renderer.autoClear = false
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// make pretty background
let loader = new THREE.TextureLoader()
let texture = loader.load('assets/palmtrees.jpg')
let backgroundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1024, 1024),
    new THREE.MeshBasicMaterial({
        map: texture
    }))
backgroundMesh.material.depthTest = false
backgroundMesh.material.depthWrite = false
scene.add(backgroundMesh)

// build the floor
let plane_geometry = new THREE.PlaneGeometry(800, 800)
let plane_material = new THREE.MeshBasicMaterial({
    color: 0x006600,
    side: THREE.DoubleSide,
    map: texture
})
let plane = new THREE.Mesh(plane_geometry, plane_material)
    //scene.add(plane)
    //plane.rotation.x -= 90
    //plane.position.y -= 120

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}, false)

let arrows = () => {
    const axisHelper = new THREE.AxisHelper(100)
    scene.add(axisHelper)
}

let octree = new THREE.Octree({
    //scene: scene
})

let balls = []
let id = 0
THREE.Mesh.prototype.velocity = new THREE.Vector3()
THREE.Mesh.prototype.birthday = 0
let geometry = new THREE.SphereGeometry(1, 32, 32)

let addBoidToSzene = (boid) => {
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        color: Math.random() * 0xffffff
    }));
    //let mesh = new THREE.Mesh(flamingoGeometry, flamingoMaterial)
    //let mixer = new THREE.AnimationMixer(mesh)
    //mixer.clipAction(flamingoGeometry.animations[0]).setDuration(1).play()
    //mixers.push(mixer)
    mesh.position.set(...boid.position.toArray())
    mesh.velocity = boid.velocity
    mesh.birthday = boid.boid.genotype.birthday
        //mesh.scale.set(0.3, 0.3, 0.3)
    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 5 + 2
    balls.push(mesh)
    scene.add(mesh)
    octree.add(mesh)
}

let removeBoidFromSzene = (boid) => {
    let toBeRemoved = balls.filter(ball => ball.birthday == boid.boid.genotype.birthday)[0]
    let index = balls.indexOf(toBeRemoved);
    if (index > -1) {
        balls.splice(index, 1);
    }
    scene.remove(toBeRemoved)
    octree.remove(toBeRemoved)
}

let renderWorld = () => {
    stats.begin()
    updateWorld()
    let delta = clock.getDelta();
    for (let i = 0; i < mixers.length; i++) {
        mixers[i].update(delta);
    }
    renderer.clear()
    renderer.render(scene, camera)
    octree.update()
        //octree.rebuild()
    stats.end()
    requestAnimationFrame(renderWorld)
}
