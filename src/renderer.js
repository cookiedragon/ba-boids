"use strict"

let renderer = new THREE.WebGLRenderer({
    antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.setClearColor(0xffffff, 0)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000)
camera.position.set(0, 0, 300)
camera.lookAt({
    x: 0,
    y: 0,
    z: 0
})

let ambient = new THREE.AmbientLight(0x444444)
scene.add(ambient)

let light = new THREE.DirectionalLight(0xffffff, 1.0)
light.position.set(1, 1, 1).normalize()
scene.add(light)

let spotLight = new THREE.SpotLight(0xFFAA88)
spotLight.target.position.set(0, -100, 0)
spotLight.position.set(20, 200, 20)
spotLight.shadow.camera.near = 0.01
spotLight.castShadow = true
scene.add(spotLight)

// make pretty background
let loader = new THREE.TextureLoader()
let texture = loader.load('assets/tongariro.jpg')
let backgroundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1024, 1024),
    new THREE.MeshLambertMaterial({
        //color: 0x00ccff,
        map: texture
    }))
backgroundMesh.receiveShadow = false
backgroundMesh.castShadow = false
backgroundMesh.material.depthTest = false
backgroundMesh.material.depthWrite = false
scene.add(backgroundMesh)

// build the floor
let groundGeometry = new THREE.CubeGeometry(400, 0.2, 400)
let groundTexture = loader.load('assets/rocks.jpg')
let groundMaterial = new THREE.MeshPhongMaterial({
    //color: 0x00ff00,
    shininess: 0,
    specular: 0x888888,
    shading: THREE.SmoothShading,
    map: groundTexture
})
var ground = new THREE.Mesh(groundGeometry, groundMaterial)
ground.position.y = -101
scene.add(ground)

ground.castShadow = false
ground.receiveShadow = true

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}, false)

let boidGeometry = new THREE.SphereGeometry(1, 32, 32)
let boidMaterial = new THREE.MeshPhongMaterial({
    color: 0xdc143c,
    shininess: 300,
    specular: 0x33AA33,
    shading: THREE.SmoothShading
})

let enemyGeometry = new THREE.SphereGeometry(1, 32, 32)
let enemyMaterial = new THREE.MeshPhongMaterial({
    color: 0x4b0082,
    shininess: 300,
    specular: 0x33AA33,
    shading: THREE.SmoothShading
})

let octree = new THREE.Octree()
let balls = []
let id = 0

let addBoidToSzene = (boid) => {
    let mesh = new THREE.Mesh(boidGeometry, boidMaterial)
    mesh.castShadow = true
    mesh.receiveShadow = false
    mesh.position.set(...boid.position.toArray())
    mesh.velocity = boid.velocity
    mesh.birthday = boid.innerboid.phenotype.birthday
    mesh.boid = boid
    let scaleFactor = 3
    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor)
    balls.push(mesh)
    scene.add(mesh)
    octree.add(mesh)
}

let removeBoidFromSzene = (boid) => {
    let toBeRemoved = balls.filter(ball => ball.birthday == boid.innerboid.phenotype.birthday)[0]
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
    updateEnemy()
    renderer.clear()
    renderer.render(scene, camera)
    octree.update()
    octree.rebuild() // keep track of moving objects
    stats.end()
    requestAnimationFrame(renderWorld)
}

// Evaluation der Population
let testRenderWorld = () => {
    stats.begin()
    updateWorld()
    test()
    renderer.clear()
    renderer.render(scene, camera)
    octree.update()
    octree.rebuild()
    stats.end()
    if (dynTest.length < 20) {
        requestAnimationFrame(renderWorld)
    } else {
        console.log("###################### dyn test #######################")
        dynTest.forEach(entry => {
            console.log(entry)
        })
        console.log("###################### gen test #######################")
        genTest.forEach(entry => {
            console.log(entry)
        })
    }
}

let dynTest = []
let genTest = []
let testCounter = 500

let test = () => {
    testCounter -= 1
    if (testCounter < 0) {
        let populationSize = boids.length
        let femaleCounter = 0
        let maleCounter = 0
        let littleLifeCounter = 0
        let bigLifeCounter = 0
        let bothLifeCounter = 0
        let littleMaxSpeedCounter = 0
        let bigMaxSpeedCounter = 0
        let bothMaxSpeedCounter = 0
        boids.forEach(boid => {
            isFemale(boid) ? femaleCounter++ : maleCounter++
                if (boid.innerboid.genotype.lifespan.includes(30000)) {
                    if (boid.innerboid.genotype.lifespan.includes(60000)) {
                        bothLifeCounter++
                    } else {
                        littleLifeCounter++
                    }
                } else {
                    bigLifeCounter++
                }
            if (boid.innerboid.genotype.maxSpeed.includes(2)) {
                if (boid.innerboid.genotype.maxSpeed.includes(4)) {
                    bothMaxSpeedCounter++
                } else {
                    littleMaxSpeedCounter++
                }
            } else {
                bigMaxSpeedCounter++
            }
        })
        genTest.push({
            littleLife: littleLifeCounter,
            bigLife: bigLifeCounter,
            bothLife: bothLifeCounter,
            littleSpeed: littleMaxSpeedCounter,
            bigSpeed: bigMaxSpeedCounter,
            bothSpeed: bothMaxSpeedCounter,
        })
        dynTest.push({
            populationSize: populationSize,
            females: femaleCounter,
            males: maleCounter,
            birthrate: birthrate,
            deathrate: deathrate
        })
        birthrate = 0
        deathrate = 0
        testCounter = 500
    }
}
