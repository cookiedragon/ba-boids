"use strict"

let rand = (num) => {
    const rand = Math.random() * num
    return Number.isInteger(num) ? Math.floor(rand) : rand
}

let between = (lower, upper) => {
    const rand = Math.random() * (upper - lower + 1) + lower
    return (Number.isInteger(lower) && Number.isInteger(upper)) ? Math.floor(rand) : rand
}

let rand_velocity = () => {
    return new THREE.Vector3(between(-1, 1), between(-1, 1), between(-1, 1))
}
