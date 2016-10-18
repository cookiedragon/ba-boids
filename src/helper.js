"use strict"

let rand = (num) => {
    const rand = Math.random() * num
    return Number.isInteger(num) ? Math.floor(rand) : rand
}

let between = (lower, upper) => {
    const rand = Math.random() * (upper - lower + 1) + lower
    return (Number.isInteger(lower) && Number.isInteger(upper)) ? Math.floor(rand) : rand
}

let randVelocity = () => {
    return new THREE.Vector3(between(-1, 1), between(-1, 1), between(-1, 1))
}

let randGender = () => {
    let gender = ["m", "f"]
    return gender[between(0, 1)]
}

let randMale = (males) => {
    return males[between(0, males.length - 1)]
}

let isMale = (boid) => {
    return boid.innerboid.genotype.gender == "m"
}

let isFemale = (boid) => {
    return boid.innerboid.genotype.gender == "f"
}

let babyPosition = (mum, dad) => {
    return new THREE.Vector3(between(mum.position.x, dad.position.x), between(mum.position.y, dad.position.y), between(mum.position.z, dad.position.z))
}

let updateTimer = 3

let resetUpdateTimer = () => {
    updateTimer = 3
}

let countdownUpdateTimer = () => {
    updateTimer -= 1
}

let isUpdateTimerUp = () => {
    return (updateTimer < 0) ? true : false
}

let breedingTimer = 1000

let resetBreedingTimer = () => {
    breedingTimer = 1000
}

let countdownBreedingTimer = () => {
    breedingTimer -= 1
}

let isBreedingTime = () => {
    if (breedingTimer < 0) {
        resetBreedingTimer()
    } else if (breedingTimer < 20) {
        return true
    }
    return false
}
