"use strict"

// load the webgl renderer
let renderer = new THREE.WebGLRenderer({
        antialias: true
    })
    // fill the entire window
renderer.setSize(window.innerWidth, window.innerHeight)
    // and attach it to the document
document.body.appendChild(renderer.domElement)
    // setting clear colour
renderer.setClearColor(0xffffff, 0)
    // enable the shadows
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// load the scene
let scene = new THREE.Scene()

// load the camera
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000)
    // set it further back (i.e. front), so the viewer can see the whole scene
camera.position.set(0, 0, 300)
    // look at the middle point of the scene, straight ahead
camera.lookAt({
    x: 0,
    y: 0,
    z: 0
})

// add soft ambient light
let ambient = new THREE.AmbientLight(0x444444)
scene.add(ambient)

// add directional light, so the background gets light
let light = new THREE.DirectionalLight(0xffffff, 1.0)
light.position.set(1, 1, 1)
scene.add(light)

// add a spot light to light the boids
let spotLight = new THREE.SpotLight(0xFFAA88)
    // set the target at the middle of the ground
spotLight.target.position.set(0, -100, 0)
    // set position up high
spotLight.position.set(20, 200, 20)
    // set boundaries for the light clipping
spotLight.shadow.camera.near = 0.01
spotLight.shadow.camera.far = 4000
spotLight.shadow.camera.fov = 100
    // enable the casting of shadows from this light source
spotLight.castShadow = true
scene.add(spotLight)

// make pretty background
let loader = new THREE.TextureLoader()
    // load the background picture as texture
let texture = loader.load('assets/tongariro.jpg')
    // add a plane mesh with the picture as texture
let backgroundMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1024, 1024),
        new THREE.MeshLambertMaterial({
            map: texture
        }))
    // the background is supposed to be far away, so the shadows of the boids do not reach far enough out
backgroundMesh.receiveShadow = false
backgroundMesh.castShadow = false
    // make sure the background is always rendered at the far back
backgroundMesh.material.depthTest = false
backgroundMesh.material.depthWrite = false
scene.add(backgroundMesh)

// build the floor with a cube
let groundGeometry = new THREE.CubeGeometry(400, 0.2, 400)
    // load the ground picture as texture
let groundTexture = loader.load('assets/rocks.jpg')
    // add a plane mesh with the picture as texture
let groundMaterial = new THREE.MeshPhongMaterial({
    shininess: 0,
    specular: 0x888888,
    shading: THREE.SmoothShading,
    map: groundTexture
})
var ground = new THREE.Mesh(groundGeometry, groundMaterial)
    // set the ground a tiny bit lower than the lower limit of the bounding box of the scene
ground.position.y = -101
    // let the ground receive the shadows
ground.castShadow = false
ground.receiveShadow = true
scene.add(ground)

// resize the inner window, if  the browser gets resized
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}, false)

// init the geometry and material of the boids to be reused
let boidGeometry = new THREE.SphereGeometry(1, 32, 32)
let boidMaterial = new THREE.MeshPhongMaterial({
    color: 0xdc143c, // crimson
    shininess: 300,
    specular: 0x33AA33,
    shading: THREE.SmoothShading
})

// init the geometry and material of the enemy to be reused
let enemyGeometry = new THREE.SphereGeometry(1, 32, 32)
let enemyMaterial = new THREE.MeshPhongMaterial({
    color: 0x4b0082, // indigo
    shininess: 300,
    specular: 0x33AA33,
    shading: THREE.SmoothShading
})

// init the octree
let octree = new THREE.Octree()
    // init the helper array to convert between boids and the boid meshes
let balls = []

// add a new boid to the scene
let addBoidToSzene = (boid) => {
    // the boid is a mesh using the prepared geometry and material
    let mesh = new THREE.Mesh(boidGeometry, boidMaterial)
        // let the boids cast shadows on the ground
    mesh.castShadow = true
        // but not on each other
    mesh.receiveShadow = false
        // set the position...
    mesh.position.set(...boid.position.toArray())
        // ...and velocity to match the actual boid
    mesh.velocity = boid.velocity
        // set birthday to the mesh, so we can identify it later at removal time
    mesh.birthday = boid.innerboid.phenotype.birthday
        // set the actual boid as a carry-on
    mesh.boid = boid
        // scale the boid mesh a bit so we can see it on the screen
    let scaleFactor = 3
    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor)
        // add new boid mesh to all the relevant collections
    balls.push(mesh)
    scene.add(mesh)
    octree.add(mesh)
}

// removing a boid from a scene
let removeBoidFromSzene = (boid) => {
    // filter the helper array for a boid that matches the birthday
    let toBeRemoved = balls.filter(ball => ball.birthday == boid.innerboid.phenotype.birthday)[0]
        // find the corresponding mesh boid
    let index = balls.indexOf(toBeRemoved);
    if (index > -1) {
        balls.splice(index, 1);
    }
    // and remove it from the scene
    scene.remove(toBeRemoved)
        // and the octree
    octree.remove(toBeRemoved)
}

// render the world, this is the main entry point for the simulation
let renderWorld = () => {
    // start performance measure loop
    stats.begin()
        // update the world, i.e. the population
    updateWorld()
        // update the enemy
    updateEnemy()
        // renderer the current state of the world
    renderer.clear()
    renderer.render(scene, camera)
        // make sure old boids are removed and new ones added, doing it after the rendering, of course
    octree.update()
        // keep track of moving objects
    octree.rebuild()
        // end performance measure loop
    stats.end()
        // and start the loop again
    requestAnimationFrame(renderWorld)
}

// evaluation of the population, tests the simulation without the enemy
let testRenderWorld = () => {
    updateWorld()
        // this collects the test data
    test()
    renderer.clear()
    renderer.render(scene, camera)
    octree.update()
    octree.rebuild()
        // if test is finished, stop the simulation and print out the data on the console
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

// collections for the test
let dynTest = []
let genTest = []
let testCounter = 500

// gather the current test data, here we test e.g. the population size, the lifespan and the maxspeed
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
