"use strict"

// generate random number between 0 and the given number
let rand = (num) => {
    const rand = Math.random() * num
    return Number.isInteger(num) ? Math.floor(rand) : rand
}

// generate random number between two numbers
let between = (lower, upper) => {
    const rand = Math.random() * (upper - lower + 1) + lower
    return (Number.isInteger(lower) && Number.isInteger(upper)) ? Math.floor(rand) : rand
}

// generate a random velocity, used e.g. at start time
let randVelocity = () => {
    return new THREE.Vector3(between(-1, 1), between(-1, 1), between(-1, 1))
}

// choose a random gender
let randGender = () => {
    let gender = ["m", "f"]
    return gender[between(0, 1)]
}

// search for a random male in the group of eligle males
let randMale = (males) => {
    return males[between(0, males.length - 1)]
}

// check if the boid is a male
let isMale = (boid) => {
    return boid.innerboid.genotype.gender == "m"
}

// check if the boid is a female
let isFemale = (boid) => {
    return boid.innerboid.genotype.gender == "f"
}

// calculate the new baby boids position between its parents
let babyPosition = (mum, dad) => {
    return new THREE.Vector3(between(mum.position.x, dad.position.x), between(mum.position.y, dad.position.y), between(mum.position.z, dad.position.z))
}

// the update timer for the world update cycle
let updateTimer = 3

// resetting the update timer
let resetUpdateTimer = () => {
    updateTimer = 3
}

// countdown the update timer
let countdownUpdateTimer = () => {
    updateTimer -= 1
}

// check, if the update timer is up
let isUpdateTimerUp = () => {
    return (updateTimer < 0) ? true : false
}

// the breeding timer
let breedingTime = 800
let breedingTimer = breedingTime

// reset the breeding time
let resetBreedingTimer = () => {
    breedingTimer = breedingTime
}

// countdown the breeding timer
let countdownBreedingTimer = () => {
    breedingTimer -= 1
}

// check, if it is breeding time
let isBreedingTime = () => {
    if (breedingTimer < 0) {
        resetBreedingTimer()
    } else if (breedingTimer < 30) {
        return true
    }
    return false
}
