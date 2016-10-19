"use strict"

// enemy update clock
let enemyTime = 2000
let enemyClock = enemyTime
    // flag to check, if the enemy is active
let enemySwooping = false
    // update the enemy
let updateEnemy = () => {
    enemyClock -= 1
        // if the enemy is active...
    if (enemySwooping) {
        // but running out of time...
        if (enemyClock < (enemyTime / 2)) {
            // ... remove the enemy and restart the waiting
            removeEnemy()
            enemySwooping = false
            enemyClock = enemyTime
        } else {
            // otherwise, as long as boids are out there...
            if (boids.length > 0) {
                let pos = enemy.position.clone()
                let preyPos = boids[0].position.clone()
                let diff = preyPos.sub(pos)
                diff.normalize()
                    // ...chase them
                enemy.position.add(diff)
            }
        }
    } else {
        // if it is time, get swooping
        if (enemyClock < 0) {
            startEnemy()
            enemySwooping = true
            enemyClock = enemyTime
        }
    }
}

// flag to see, if there is an enemy active, zero if not
let enemy = 0

// start the enemy
let startEnemy = () => {
    // create enemy just like the boid mesh, but with a different colour
    let mesh = new THREE.Mesh(enemyGeometry, enemyMaterial)
    mesh.castShadow = true
    mesh.receiveShadow = true
    let position = new THREE.Vector3(between(-50, 50), between(-50, 50), between(-50, 50))
    mesh.position.set(...position.toArray())
    mesh.velocity = randVelocity()
    mesh.birthday = Date.now()
        // ...and a different size
    let scaleFactor = 6
    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor)
        // set mesh to enemy, so we know, there is an active enemy around
    enemy = mesh
    scene.add(enemy)
}

// removing the enemy
let removeEnemy = () => {
    scene.remove(enemy)
        // and set the flag back to zero
    enemy = 0
}
