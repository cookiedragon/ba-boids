"use strict"

let initBoids = (num) => {
    var swarm = []
    for (var i = 0; i < num; i++) {
        swarm.push(addRandomBoid())
    }
    return swarm
}

let addRandomBoid = () => {
    const genotype = initGenotype()
    const phenotype = calcPhenotype(genotype)
    let boid = {
        innerboid: makeInnerBoid(genotype, phenotype),
        position: new THREE.Vector3(between(-50, 50), between(-50, 50), between(-50, 50)),
        velocity: randVelocity(),
        velocities: [randVelocity(), randVelocity(), randVelocity()]
    }
    addBoidToSzene(boid)
    return boid
}

let makeNewBabyBoid = (mum, dad) => {
    const genotype = genSplicer(mum.innerboid.genotype, dad.innerboid.genotype)
    const phenotype = calcPhenotype(genotype)
    let boid = {
        innerboid: makeInnerBoid(genotype, phenotype),
        position: babyPosition(mum, dad),
        velocity: randVelocity(),
        velocities: [randVelocity(), randVelocity(), randVelocity()]
    }
    addBoidToSzene(boid)
    return boid
}

let initGenotype = () => {
    return {
        lifespan: [30000, 60000],
        maxStamina: [100, 200],
        foodCapacity: [30, 50],
        maxForce: [0.4, 0.6],
        maxSpeed: [2, 4],
        gender: randGender(),
        ofAgeAt: [180, 300]
    }
}

let calcPhenotype = (genotype) => {
    return {
        birthday: Date.now(),
        lifespan: genotype.lifespan[rand(2)],
        maxStamina: genotype.maxStamina[rand(2)],
        foodCapacity: genotype.foodCapacity[rand(2)],
        maxForce: genotype.maxForce[rand(2)],
        maxSpeed: genotype.maxSpeed[rand(2)],
        gender: genotype.gender[between(0, 1)],
        ofAgeAt: genotype.ofAgeAt[rand(2)]
    }
}

let makeInnerBoid = (genotype, phenotype) => {
    return {
        genotype: genotype,
        phenotype: phenotype,
        foodLevel: phenotype.foodCapacity,
        stamina: phenotype.maxStamina,
        status: 'SWARMING',
        age() {
            return (Date.now() - this.phenotype.birthday)
        },
        readyToDieOfOldAge() {
            return ((this.phenotype.lifespan - this.age()) < 0) ? true : false
        },
        readyToDieOfEnergyDeficit() {
            return ((this.foodLevel < 0) || (this.stamina < 0) ? true : false)
        },
        isAdult() {
            return (this.age() > this.phenotype.ofAgeAt ? true : false)
        },
        isHungry() {
            return ((this.foodLevel / this.phenotype.foodCapacity * 100) < 10 ? true : false)
        },
        isTired() {
            return ((this.stamina / this.phenotype.maxStamina * 100) < 2 ? true : false)
        },
        isFullyRecovered() {
            return ((this.stamina / this.phenotype.maxStamina * 100) > 99 ? true : false)
        },
        isSwarming() {
            return (this.status === 'SWARMING')
        },
        isSearchingTheGround() {
            return (this.status === 'SEARCHINGGROUND')
        }
    }
}

let genSplicer = (mumGen, dadGen) => {
    return {
        lifespan: [mumGen.lifespan[rand(2)], dadGen.lifespan[rand(2)]],
        maxStamina: [mumGen.maxStamina[rand(2)], dadGen.maxStamina[rand(2)]],
        foodCapacity: [mumGen.foodCapacity[rand(2)], dadGen.foodCapacity[rand(2)]],
        maxForce: [mumGen.maxForce[rand(2)], dadGen.maxForce[rand(2)]],
        maxSpeed: [mumGen.maxSpeed[rand(2)], dadGen.maxSpeed[rand(2)]],
        gender: randGender(),
        ofAgeAt: [mumGen.ofAgeAt[rand(2)], dadGen.ofAgeAt[rand(2)]]
    }
}

let updateWorld = () => {
    countdownUpdateTimer()
    countdownBreedingTimer()
    if (isUpdateTimerUp()) {
        resetUpdateTimer()
        boids = updatePopulationStatus()
    }
    //swarmingInitCounter -= 1
    let newBoids = []
    let i = -1
    boids.forEach(boid => {
        newBoids.push(updateSwarmingSingle(boid))
        balls[i += 1].position.set(...boid.position.toArray())
    })
    boids = newBoids
}

let deathrate = 0
let birthrate = 0

let updatePopulationStatus = () => {
    let newPopulation = []
    let dr = 0
    boids.forEach(boid => {
        if (boid.innerboid.readyToDieOfOldAge() || boid.innerboid.readyToDieOfEnergyDeficit() || (isInDanger() && caughtByEnemy(boid))) {
            removeBoidFromSzene(boid)
            deathrate += 1
        } else {
            newPopulation.push(updateSingle(boid))
        }
    })
    if (isBreedingTime()) {
        let eligible = boids.filter((boid) => (onGround(boid) && boid.innerboid.isAdult()))
        let females = eligible.filter(isFemale)
        let males = eligible.filter(isMale)
        females.forEach(female => {
            let randomMale = randMale(eligible)
            let baby = makeNewBabyBoid(female, randomMale)
            birthrate += 1
            newPopulation.push(baby)
        })
    }
    return newPopulation
}

let findClosest = (position) => {
    let radius = 0.1
    let closest = []
    closest = octree.search(position, radius)
    if (closest.length < 7) {
        radius += 5
        closest = octree.search(position, radius, true)
    }
    return closest
}

let onGround = (boid) => {
    if (boid.position.y < -99) {
        boid.innerboid.status = 'ONGROUND'
        boid.velocity = new THREE.Vector3()
    }
    return (boid.innerboid.status === 'ONGROUND')
}

let isInDanger = () => {
    return (enemy === 0 ? false : true)
}

let caughtByEnemy = (boid) => {
    let d = boid.position.distanceTo(enemy.position)
    return (d < 10 ? true : false)
}

let updateSingle = (boid) => {
    if (onGround(boid)) {
        if (boid.innerboid.isFullyRecovered() && !isBreedingTime()) {
            boid.innerboid.status = 'SWARMING'
            boid.velocity = randVelocity()
        } else {
            boid.innerboid.stamina += 10
        }
    } else {
        boid.innerboid.stamina -= 1
        if (boid.innerboid.isTired() || boid.innerboid.isHungry()) {
            boid.innerboid.status = 'SEARCHINGGROUND'
        } else if (isBreedingTime() && boid.innerboid.isAdult()) {
            boid.innerboid.status = 'SEARCHINGGROUND'
        }
    }
    return boid
}

let swarmingInitCounter = 3

let updateSwarmingSingle = (boid) => {
    let acceleration = new THREE.Vector3()
    const maxspeed = boid.innerboid.phenotype.maxSpeed
    const maxforce = boid.innerboid.phenotype.maxForce
    const r = 100

    let sep = new THREE.Vector3()
    let ali = new THREE.Vector3()
    let coh = new THREE.Vector3()

    const desiredseparation = 10.0
    let ssteer = new THREE.Vector3()
    let scount = 0
    const neighbordist = 50
    let asum = new THREE.Vector3()
    let acount = 0
    let csum = new THREE.Vector3()
    let ccount = 0

    let position = boid.position.clone()
    let velocity = boid.velocity.clone()

    if (swarmingInitCounter > 0) {
        boids.forEach(other => {
            let otherPos = other.position.clone()
            let d = position.distanceTo(otherPos)
            if ((d > 0) && (d < desiredseparation)) {
                let diff = otherPos.sub(position)
                diff.normalize()
                diff.divideScalar(d)
                ssteer.add(otherPos)
                scount++
            }
            if ((d > 0) && (d < neighbordist) && boid.innerboid.isSwarming() && other.innerboid.isSwarming()) {
                asum.add(other.velocity)
                acount++
                csum.add(otherPos)
                ccount++
            }
        })
    } else {
        let closest = findClosest(boid)
        if (closest[0] == undefined) {
            return boid
        }
        closest.forEach(other => {
            let otherPos = other.object.position.clone()
            let d = position.distanceTo(otherPos)
            if ((d > 0) && (d < desiredseparation)) {
                let diff = otherPos.sub(position)
                diff.normalize()
                diff.divideScalar(d)
                ssteer.add(otherPos)
                scount++
            }
            if ((d > 0) && (d < neighbordist) && boid.innerboid.isSwarming() && other.innerboid.isSwarming()) {
                asum.add(other.velocity)
                acount++
                csum.add(otherPos)
                ccount++
            }
        })
    }

    if (isInDanger()) {
        let enemyPos = enemy.position.clone()
        let diff = enemyPos.sub(position)
        diff.normalize()
        ssteer.add(diff)
        ssteer.add(diff)
        ssteer.add(diff)
        scount += 3
    }

    if (scount > 0) {
        ssteer.divideScalar(scount)
    }
    if (ssteer.length() > 0) {
        ssteer.normalize()
        ssteer.multiplyScalar(maxspeed)
        ssteer = velocity.sub(ssteer)
        ssteer.clampLength(0, maxforce)
    }
    sep = ssteer

    if (boid.innerboid.isSwarming()) {
        if (acount > 0) {
            asum.divideScalar(acount)
            asum.normalize()
            asum.multiplyScalar(maxspeed)
            let steer = asum.sub(velocity)
            steer.clampLength(0, maxforce)
            ali = steer
        }

        if (ccount > 0) {
            csum.divideScalar(ccount)
            let desired = csum.sub(position)
            desired.normalize()
            desired.multiplyScalar(maxspeed)
            let steer = desired.sub(velocity)
            steer.clampLength(0, maxforce)
            coh = steer
        }
    } else if (boid.innerboid.isSearchingTheGround()) {
        coh = new THREE.Vector3(0, -1, 0)
    }

    sep.multiplyScalar(1.5)
    ali.multiplyScalar(1.0)
    coh.multiplyScalar(1.0)
    acceleration.add(sep)
    acceleration.add(ali)
    acceleration.add(coh)

    velocity.add(acceleration)
    velocity.clampLength(0, maxspeed)

    let velocities = boid.velocities.slice()
    velocities.pop()
    velocities.forEach(velo => velocity.lerp(velo, 0.5))
    velocities.unshift(velocity)

    position.add(velocity)
    position.clamp(new THREE.Vector3(-r, -r, -r), new THREE.Vector3(r, r, r))

    return {
        innerboid: boid.innerboid,
        position: position,
        velocity: velocity,
        velocities: velocities
    }
}
