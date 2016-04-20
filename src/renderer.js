"use strict"

let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

let directional_light = new THREE.DirectionalLight(0xffffff, 1)
directional_light.position.set(1, 1, 1).normalize()
scene.add(directional_light)
let ambient_light = new THREE.AmbientLight(0x404040)
scene.add(ambient_light)

let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

let balls = []

function init(boids) {
    let geometry = new THREE.SphereGeometry(1, 32, 32)
    const len = boids.length
    for (let i = 0; i < len; i++) {
        let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: Math.random() * 0xffffff
        }));
        mesh.position.x = boids[i].movement.position.x
        mesh.position.y = boids[i].movement.position.y
        mesh.position.z = boids[i].movement.position.z
        mesh.rotation.x = Math.random() * 2 * Math.PI
        mesh.rotation.y = Math.random() * 2 * Math.PI
        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 5 + 5
        balls.push(mesh)
        scene.add(mesh)
    }
    camera.position.x = 100
    camera.position.y = 100
    camera.position.z = 150
}

function renderWorld() {

    stats.begin()

    const len = balls.length
    for (var i = 0; i < len; i++) {
        balls[i].position.x += boids[i].movement.velocity
        balls[i].position.y += boids[i].movement.velocity
    }
    renderer.render(scene, camera)

    stats.end()

    requestAnimationFrame(renderWorld)
}
