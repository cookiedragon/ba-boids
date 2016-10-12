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

let rand_gender = () => {
    let gender = ["MALE", "FEMALE"]
    return gender[between(0, 1)]
}

let rand_male = (males) => {
    return males[between(0, males.length - 1)]
}

let is_male = (boid) => {
    return boid.boid.genotype.gender == "MALE"
}

let is_female = (boid) => {
    return boid.boid.genotype.gender == "FEMALE"
}

let baby_position = (mum, dad) => {
    return new THREE.Vector3(between(mum.position.x, dad.position.x), between(mum.position.y, dad.position.y), between(mum.position.z, dad.position.z))
}

let updateTimer = 3

let resetUpdateTimer = () => {
    updateTimer = 3
}

let countdown_update_timer = () => {
    updateTimer -= 1
}

let is_update_timer_up = () => {
    return (updateTimer < 0) ? true : false
}

let breedingTimer = 1000

let resetBreedingTimer = () => {
    breedingTimer = 1000
}

let countdown_breeding_timer = () => {
    breedingTimer -= 1
}

let is_breeding_time = () => {
    if (breedingTimer < 0) {
        resetBreedingTimer()
    } else if (breedingTimer < 20) {
        return true
    }
    return false
}
