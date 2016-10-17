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
        } else {
            console.log("swooping")
            if (boids.length > 0) {
                let pos = enemy.position.clone()
                let diff = pos.sub(boids[0].position)
                diff.normalize()
                diff.multiplyScalar(-2.5)
                enemy.position.add(diff)
            }
        }
    } else {
        if (enemyClock < 0) {
            startEnemy()
            enemySwooping = true
            enemyClock = 500
        }
    }
}

let enemy = 0

let startEnemy = () => {
    console.log("start enemy")
    //let material = boid_material.clone()
    //material.color = 0x4b0082
    let mesh = new THREE.Mesh(enemy_geometry, enemy_material)
    mesh.castShadow = true
    mesh.receiveShadow = true
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
