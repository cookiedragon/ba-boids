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

let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}, false)

let arrows = () => {
    const axisHelper = new THREE.AxisHelper(100)
    scene.add(axisHelper)
}

let balls = []

let init = (boids) => {
    let geometry = new THREE.SphereGeometry(1, 32, 32)
    boids.forEach(boid => {
        let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: Math.random() * 0xffffff
        }));
        mesh.position.set(...boid.position.toArray())
        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 5 + 2
        balls.push(mesh)
        scene.add(mesh)
    })
}

let renderWorld = () => {
    stats.begin()
    boids = update(boids)
    let i = -1
    boids.forEach(boid => {
        balls[i += 1].position.set(...boid.position.toArray())
            // scene.add(new THREE.ArrowHelper(boid.velocity, boid.position, 10, 0xffff00))
    })
    renderer.render(scene, camera)
    stats.end()
    requestAnimationFrame(renderWorld)
}
