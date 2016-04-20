"use strict"

let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
scene.add(camera)
camera.position.x = 15
camera.position.y = 10
camera.position.z = 150

let directional_light = new THREE.DirectionalLight(0xffffff, 1)
directional_light.position.set(1, 1, 1).normalize()
scene.add(directional_light)
const ambient_light = new THREE.AmbientLight(0x404040)
scene.add(ambient_light)

let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function arrows() {
    const xdir = new THREE.Vector3(1, 0, 0)
    const ydir = new THREE.Vector3(0, 1, 0)
    const zdir = new THREE.Vector3(0, 0, 1)
    const origin = new THREE.Vector3(0, 0, 0)
    const length = 100
    const hex = 0xffff00
    const x_arrow = new THREE.ArrowHelper(xdir, origin, length, hex)
    const y_arrow = new THREE.ArrowHelper(ydir, origin, length, hex)
    const z_arrow = new THREE.ArrowHelper(zdir, origin, length, hex)
    scene.add(x_arrow)
    scene.add(y_arrow)
    scene.add(z_arrow)
}

let balls = []

function init(boids) {
    let geometry = new THREE.SphereGeometry(1, 32, 32)
    boids.forEach(boid => {
        let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: Math.random() * 0xffffff
        }));
        mesh.position.set(...boid.movement.position)
        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 5 + 2
        balls.push(mesh)
        scene.add(mesh)
    })
}

function renderWorld() {
    stats.begin()
    renderer.render(scene, camera)
    stats.end()
    requestAnimationFrame(renderWorld)
}
