// enemy update clock
let enemyClock = 500
let enemySwooping = false
    // update the enemy
let updateEnemy = () => {
    enemyClock -= 1
    if (enemySwooping) {
        if (enemyClock < 0) {
            removeEnemy()
            enemySwooping = false
            enemyClock = 500
        }
    } else {
        if (enemyClock < 0) {
            startEnemy()
            enemySwooping = true
            enemyClock = 500
        }
    }
}

let enemy_geometry = new THREE.SphereGeometry(1, 32, 32)
let enemy_material = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    shininess: 300,
    specular: 0x33AA33,
    shading: THREE.SmoothShading
})

let enemy = 0

let startEnemy = () => {
    console.log("start enemy")
    let mesh = new THREE.Mesh(enemy_geometry, enemy_material)
    mesh.castShadow = true
    mesh.receiveShadow = false
    let position = new THREE.Vector3(between(-50, 50), between(-50, 50), between(-50, 50))
    mesh.position.set(...position.toArray())
    mesh.velocity = rand_velocity()
    mesh.birthday = Date.now()
    let scale_factor = 6
    mesh.scale.set(scale_factor, scale_factor, scale_factor)
    enemy = mesh
    scene.add(enemy)
}

let removeEnemy = () => {
    scene.remove(enemy)
    enemy = 0
}
