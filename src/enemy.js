"use strict"

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
            if (boids.length > 0) {
                let pos = enemy.position.clone()
                let diff = pos.sub(boids[0].position)
                diff.normalize()
                diff.multiplyScalar(-1.5)
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
    let mesh = new THREE.Mesh(enemyGeometry, enemyMaterial)
    mesh.castShadow = true
    mesh.receiveShadow = true
    let position = new THREE.Vector3(between(-50, 50), between(-50, 50), between(-50, 50))
    mesh.position.set(...position.toArray())
    mesh.velocity = randVelocity()
    mesh.birthday = Date.now()
    let scaleFactor = 6
    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor)
    enemy = mesh
    scene.add(enemy)
}

let removeEnemy = () => {
    scene.remove(enemy)
    enemy = 0
}
