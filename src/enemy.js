"use strict"

// enemy update clock
let enemyTime = 2000
let enemyClock = enemyTime
let enemySwooping = false
    // update the enemy
let updateEnemy = () => {
    enemyClock -= 1
    if (enemySwooping) {
        if (enemyClock < (enemyTime / 2)) {
            removeEnemy()
            enemySwooping = false
            enemyClock = enemyTime
        } else {
            if (boids.length > 0) {
                let pos = enemy.position.clone()
                let preyPos = boids[0].position.clone()
                let diff = preyPos.sub(pos)
                diff.normalize()
                enemy.position.add(diff)
            }
        }
    } else {
        if (enemyClock < 0) {
            startEnemy()
            enemySwooping = true
            enemyClock = enemyTime
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
