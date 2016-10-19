"use strict"

// start a certain amount of randomly generated boids
let startBoids = (num) => {
    for (var i = 0; i < num; i++) {
        // add them to the population
        boids.push(addRandomBoid())
    }
}

// add a random boid
let addRandomBoid = () => {
    // init a random genotype
    const genotype = initGenotype()
        // calculate the corresponding phenotype
    const phenotype = calcPhenotype(genotype)
        // build the boid
    let boid = {
            // set the inner boid with genotype and phenotype
            innerboid: makeInnerBoid(genotype, phenotype),
            // add a random position
            position: new THREE.Vector3(between(-50, 50), between(-50, 50), between(-50, 50)),
            // add a random velocity to start
            velocity: randVelocity(),
            // add random velocities as a history
            velocities: [randVelocity(), randVelocity(), randVelocity()]
        }
        // finally add the boid to the scene, so it can be rendered, too
    addBoidToSzene(boid)
    return boid
}

// make a new baby boid using the genetic data from its parents
let makeNewBabyBoid = (mum, dad) => {
    // calculate the inherited genetic data
    const genotype = genSplicer(mum.innerboid.genotype, dad.innerboid.genotype)
        // calculate the corresponding phenotype
    const phenotype = calcPhenotype(genotype)
        // build the boid
    let boid = {
            // set the inner boid with genotype and phenotype
            innerboid: makeInnerBoid(genotype, phenotype),
            // place the baby between its parents
            position: babyPosition(mum, dad),
            // add a random velocity to start
            velocity: randVelocity(),
            // add random velocities as a history
            velocities: [randVelocity(), randVelocity(), randVelocity()]
        }
        // finally add the boid to the scene, so it can be rendered, too
    addBoidToSzene(boid)
    return boid
}

// init the genotype with init values, this is done at start time
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

// calculate the phenotype from the given genotype
let calcPhenotype = (genotype) => {
    return {
        // set the birthday
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

// create the inner boid, that carries all the biologically relevant data
let makeInnerBoid = (genotype, phenotype) => {
    return {
        genotype: genotype,
        phenotype: phenotype,
        foodLevel: phenotype.foodCapacity,
        stamina: phenotype.maxStamina,
        // set the initial status to 'SWARMING'
        status: 'SWARMING',
        // return the current age in milliseconds
        age() {
            return (Date.now() - this.phenotype.birthday)
        },
        // check, if the boid has passed its natural lifespan
        readyToDieOfOldAge() {
            return ((this.phenotype.lifespan - this.age()) < 0) ? true : false
        },
        // check, if the boid ought to die of either exhaustion or starvation
        readyToDieOfEnergyDeficit() {
            return ((this.foodLevel < 0) || (this.stamina < 0) ? true : false)
        },
        // check, if the boid is an adult and therefore romantically inclined
        isAdult() {
            return (this.age() > this.phenotype.ofAgeAt ? true : false)
        },
        // check, if the boid is hungry
        isHungry() {
            return ((this.foodLevel / this.phenotype.foodCapacity * 100) < 10 ? true : false)
        },
        // check, if the boid is tired
        isTired() {
            return ((this.stamina / this.phenotype.maxStamina * 100) < 10 ? true : false)
        },
        // check, if boid is both fed and well rested
        isFullyRecovered() {
            return ((this.stamina / this.phenotype.maxStamina * 100) > 99 && (this.foodLevel / this.phenotype.foodCapacity * 100) > 99 ? true : false)
        },
        // check, if the boid is currently swarming
        isSwarming() {
            return (this.status === 'SWARMING')
        },
        // check, if the boid is looking for the ground for whatever reason
        isSearchingTheGround() {
            return (this.status === 'SEARCHINGGROUND')
        }
    }
}

// the gen splicer calculates the new dna of the new baby boid from its parents genotypes
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

// update the world, this is the main update cycle
let updateWorld = () => {
    // countdown the timers
    countdownUpdateTimer()
    countdownBreedingTimer()
        // if update timer is up...
    if (isUpdateTimerUp()) {
        // ...reset...
        resetUpdateTimer()
            // ...and update the population
        boids = updatePopulationStatus()
    }
    //swarmingInitCounter -= 1
    // update the boids for rendering
    let newBoids = []
    let i = -1
    boids.forEach(boid => {
        // ...while updating the new individual boids swarming
        newBoids.push(updateSwarmingSingle(boid))
        balls[i += 1].position.set(...boid.position.toArray())
    })
    boids = newBoids
}

// used for the testing
let deathrate = 0
let birthrate = 0

// update the population
let updatePopulationStatus = () => {
    let newPopulation = []
    let dr = 0
        // check each boid
    boids.forEach(boid => {
            // if boid ought to die for some reason...
            if (boid.innerboid.readyToDieOfOldAge() || boid.innerboid.readyToDieOfEnergyDeficit() || (isInDanger() && caughtByEnemy(boid))) {
                // ...remove it
                removeBoidFromSzene(boid)
                    // testing: count the dead
                deathrate += 1
            } else {
                // ...otherwise add it to the remaining boids
                newPopulation.push(updateSingle(boid))
            }
        })
        // if it is breeding time...
    if (isBreedingTime()) {
        // ...filter for all the eligle adult boids, that are on the ground
        let eligible = boids.filter((boid) => (onGround(boid) && boid.innerboid.isAdult()))
        let females = eligible.filter(isFemale)
        let males = eligible.filter(isMale)
            // let all the females breed...
        females.forEach(female => {
            // ...with random males...
            let randomMale = randMale(eligible)
                // ...and make a new baby boid
            let baby = makeNewBabyBoid(female, randomMale)
                // testing: count the babies
            birthrate += 1
                // and add the new baby boid to the population
            newPopulation.push(baby)
        })
    }
    return newPopulation
}

// find the closest neighbours in the octree
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

// check, if the boid is currently on the ground
let onGround = (boid) => {
    // check position
    if (boid.position.y < -99) {
        // update the status
        boid.innerboid.status = 'ONGROUND'
            // and make it sit still
        boid.velocity = new THREE.Vector3()
    }
    // if not on ground due to position, just check the status
    return (boid.innerboid.status === 'ONGROUND')
}

// check, if an enemy is active in the scene
let isInDanger = () => {
    return (enemy === 0 ? false : true)
}

// check, if the boid got too close to an enemy
let caughtByEnemy = (boid) => {
    // calculate the distance
    let d = boid.position.distanceTo(enemy.position)
        // check, if it is too close
    return (d < 10 ? true : false)
}

// update the individual boid
let updateSingle = (boid) => {
    // if the boid is on the ground...
    if (onGround(boid)) {
        // ...and if the boid is recovered and it is nor currently breeding time
        if (boid.innerboid.isFullyRecovered() && !isBreedingTime()) {
            // return to swarming
            boid.innerboid.status = 'SWARMING'
                // start with a random velocity
            boid.velocity = randVelocity()
        } else {
            // otherwise get some more rest and nourishment
            boid.innerboid.stamina += 3
            boid.innerboid.foodLevel += 1
        }
    } else {
        // if not on the ground, lower the energy levels
        boid.innerboid.stamina -= 0.3
        boid.innerboid.foodLevel -= 0.1
            // if those levels are too low or it is breeding time, head for the ground
        if (boid.innerboid.isTired() || boid.innerboid.isHungry()) {
            boid.innerboid.status = 'SEARCHINGGROUND'
        } else if (isBreedingTime() && boid.innerboid.isAdult()) {
            boid.innerboid.status = 'SEARCHINGGROUND'
        }
    }
    return boid
}

let swarmingInitCounter = 3

// update the swarming data of a single boid
let updateSwarmingSingle = (boid) => {

    // init the acceleration to the new position with a zero vector
    let acceleration = new THREE.Vector3()
        // get the values for maximum speed and force
    const maxspeed = boid.innerboid.phenotype.maxSpeed
    const maxforce = boid.innerboid.phenotype.maxForce
        // half size of the bounding box
    const r = 100

    // init the three desires separation, alignment and cohesion with zero vectors
    let sep = new THREE.Vector3()
    let ali = new THREE.Vector3()
    let coh = new THREE.Vector3()

    // init the minimum separation distance
    const desiredseparation = 10.0
        // init the maximum neighbour distance, i.e. the field of view
    const neighbordist = 50

    // init the helper vectors and the counters
    let ssteer = new THREE.Vector3()
    let scount = 0
    let asum = new THREE.Vector3()
    let acount = 0
    let csum = new THREE.Vector3()
    let ccount = 0

    // init the field of view for the enemy
    const enemydist = 100

    // get the current position and velocity of the boid
    let position = boid.position.clone()
    let velocity = boid.velocity.clone()

    if (swarmingInitCounter > 0) {
        // we need to scan the entire population
        boids.forEach(other => {
            // get the others position
            let otherPos = other.position.clone()
            let d = position.distanceTo(otherPos)
                // if it is too close
            if ((d > 0) && (d < desiredseparation)) {
                // calculate a vector away from the other
                let diff = otherPos.sub(position)
                diff.normalize()
                diff.divideScalar(d)
                ssteer.add(otherPos)
                scount++
            }
            // if it is just close enough to be a neighbour
            if ((d > 0) && (d < neighbordist) && boid.innerboid.isSwarming() && other.innerboid.isSwarming()) {
                // let it influence the current boid
                asum.add(other.velocity)
                acount++
                csum.add(otherPos)
                ccount++
            }
        })
    } else {
        // find the closest neighbours by asking the octree
        let closest = findClosest(boid)
        if (closest[0] == undefined) {
            return boid
        }
        // we need to scan the entire list of neighbours
        closest.forEach(other => {
            // get the others position
            let otherPos = other.object.position.clone()
            let d = position.distanceTo(otherPos)
                // if it is too close
            if ((d > 0) && (d < desiredseparation)) {
                // calculate a vector away from the other
                let diff = otherPos.sub(position)
                diff.normalize()
                diff.divideScalar(d)
                ssteer.add(otherPos)
                scount++
            } else {
                // otherwise let it influence the current boid
                asum.add(other.object.boid.velocity)
                acount++
                csum.add(otherPos)
                ccount++
            }
        })
    }

    // if the boid is in danger, i.e. an active enemy might be around
    if (isInDanger()) {
        // check the position of the enemy
        let enemyPos = enemy.position.clone()
        let d = position.distanceTo(enemyPos)
            // is the enemy is too close
        if (d < enemydist) {
            let diff = enemyPos.sub(position)
            diff.normalize()
                // get away, NOW
            ssteer.add(diff)
            ssteer.add(diff)
            ssteer.add(diff)
            scount += 3
        }
    }

    // calculate the separation by averaging over all the accumulated data
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

    // if the boid is currently swarming
    if (boid.innerboid.isSwarming()) {
        // calculate the alignment by averaging over all the accumulated data
        if (acount > 0) {
            asum.divideScalar(acount)
            asum.normalize()
            asum.multiplyScalar(maxspeed)
            let steer = asum.sub(velocity)
            steer.clampLength(0, maxforce)
            ali = steer
        }
        // calculate the cohesion by averaging over all the accumulated data
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
      // if seeking the ground, just lower the boid to the ground
        coh = new THREE.Vector3(0, -1, 0)
    }

    // prioritize the desires
    sep.multiplyScalar(1.5)
    ali.multiplyScalar(1.0)
    coh.multiplyScalar(1.0)
        // and add them to the acceleration
    acceleration.add(sep)
    acceleration.add(ali)
    acceleration.add(coh)

    // add the acceleration to the old velocity
    velocity.add(acceleration)
        // make sure not to exceed the limit capabilities of the boid
    velocity.clampLength(0, maxspeed)

    // smooth the flight path by taking the previous velocities into account
    let velocities = boid.velocities.slice()
    velocities.pop()
    velocities.forEach(velo => velocity.lerp(velo, 0.5))
    velocities.unshift(velocity)

    // add the velocity to the position to get the target position
    position.add(velocity)
        // make sure the boid stays in its bounding box
    position.clamp(new THREE.Vector3(-r, -r, -r), new THREE.Vector3(r, r, r))

    // finally return the boid with its updated swarming data
    return {
        innerboid: boid.innerboid,
        position: position,
        velocity: velocity,
        velocities: velocities
    }
}
