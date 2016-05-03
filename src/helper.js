"use strict"

function rand(num) {
    return Math.floor(Math.random() * num)
}

function randF(num) {
    return Math.random() * num
}

function between(lower, upper) {
    return Math.floor(Math.random() * (upper - lower + 1)) + lower
}

function betweenF(lower, upper) {
    return Math.random() * (upper - lower + 1) + lower
}

function rand_velocity() {
    return new THREE.Vector3(betweenF(-1, 1), betweenF(-1, 1), betweenF(-1, 1))
}
