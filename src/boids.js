"use strict"

let init_boids = (num) => {
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
        boid: makeBoid(genotype, phenotype),
        position: new THREE.Vector3(between(-50, 50), between(-50, 50), between(-50, 50)),
        velocity: rand_velocity(),
        velocities: [rand_velocity(), rand_velocity(), rand_velocity()]
    }
    addBoidToSzene(boid)
    return boid
}

let initGenotype = () => {
    return {
        lifespan: [between(15, 25) * 10 * 60, between(15, 25) * 10 * 60],
        max_stamina: [between(5, 1), between(5, 1)],
        food_capacity: [between(30, 50), between(30, 50)],
        max_force: [0.4, 0.6],
        max_speed: [2.5, 3.5],
        gender: ['X', 'X'],
        of_age_at: [between(5, 10) * 1000 * 60, between(5, 10) * 1000 * 60]
    }
}

let calcPhenotype = (genotype) => {
    return {
        birthday: Date.now(),
        lifespan: genotype.lifespan[rand(2)],
        max_stamina: genotype.max_stamina[rand(2)],
        food_capacity: genotype.food_capacity[rand(2)],
        max_force: genotype.max_force[rand(2)],
        max_speed: genotype.max_speed[rand(2)],
        gender: genotype.gender[0] == genotype.gender[1] ? "female" : "male",
        of_age_at: genotype.of_age_at[rand(2)]
    }
}

let makeBoid = (genotype, phenotype) => {
    return {
        genotype: genotype,
        phenotype: phenotype,
        food_level: phenotype.food_capacity,
        stamina: phenotype.max_stamina,
        status: 'SWARMING',
        age() {
            return this.phenotype.lifespan - (Date.now() - this.phenotype.birthday)
        },
        is_adult() {
            return (this.age > this.phenotype.of_age_at ? true : false)
        },
        is_hungry() {
            return ((this.food_level / this.phenotype.food_capacity * 100) < 10 ? true : false)
        },
        is_tired() {
            return ((this.stamina / this.phenotype.max_stamina * 10) < 10 ? true : false)
        }
    }
}

let gen_splicer = (mum_gen, dad_gen) => {
    return {
        lifespan: [mum_gen.lifespan[rand(2)], dad_gen.lifespan[rand(2)]],
        max_stamina: [mum_gen.max_stamina[rand(2)], dad_gen.max_stamina[rand(2)]],
        food_capacity: [mum_gen.food_capacity[rand(2)], dad_gen.food_capacity[rand(2)]],
        max_speed: [mum_gen.max_speed[rand(2)], dad_gen.max_speed[rand(2)]],
        gender: [mum_gen.gender[rand(2)], dad_gen.gender[rand(2)]],
        of_age_at: [mum_gen.of_age_at[rand(2)], dad_gen.of_age_at[rand(2)]]
    }
}

let updateWorld = () => {
    //boids = weedOutTheOld(boids)
    let newBoids = []
    let i = -1
    boids.forEach(boid => {
        newBoids.push(updateSingle(boid))
        balls[i += 1].position.set(...boid.position.toArray())
    })
    boids = newBoids
}

let weedOutTheOld = (boids) => {
    // reduce energy or increase
    let weedOutTheOld = []
    boids.forEach(boid => {
        if (boid.boid.age() > 0) {
            if (on_ground(boid)) {
                boid.boid.stamina += 5
            } else {
                boid.boid.stamina -= 5
            }
            weedOutTheOld.push(boid)
        } else {
            removeBoidFromSzene(boid)
        }
    })
    return weedOutTheOld
}

let findClosest = (position) => {
    let radius = 20
    let closest = []
    closest = octree.search(position, radius)
    return closest
}

let on_ground = (boid) => {
    return (boid.boid.status === 'ONGROUND')
}

let is_swarming = (boid) => {
    return (boid.boid.status === 'SWARMING')
}

let is_searching_the_ground = (boid) => {
    return (boid.boid.status === 'SEARCHINGGROUND')
}

let updateSingle = (boid) => {
    if (boid.boid.is_tired() && !on_ground(boid)) {
        boid.boid.status = 'SEARCHINGGROUND'
        return swarmToGround(boid)
    }
    return updateSwarmingSingle(boid)
}

let swarmToGround = (boid) => {
    console.log('swarm to ground')
    return {
        boid: boid.boid,
        position: position,
        velocity: velocity,
        velocities: velocities
    }
}

let updateSwarmingSingle = (boid) => {

    let acceleration = new THREE.Vector3()
    const maxspeed = boid.boid.phenotype.max_speed
    const maxforce = boid.boid.phenotype.max_force
    const r = 100

    let sep = new THREE.Vector3()
    let ali = new THREE.Vector3()
    let coh = new THREE.Vector3()

    const desiredseparation = 25.0
    let ssteer = new THREE.Vector3()
    let scount = 0
    const neighbordist = 50
    let asum = new THREE.Vector3()
    let acount = 0
    let csum = new THREE.Vector3()
    let ccount = 0

    let position = boid.position.clone()
    let velocity = boid.velocity.clone()

    let closest = findClosest(boid)
    if (closest[0] == undefined) {
        return boid
    }
    boids.forEach(other => {
        let other_pos = other.position.clone()
        let d = position.distanceTo(other_pos)
        if ((d > 0) && (d < desiredseparation)) {
            let diff = other_pos.sub(position)
            diff.normalize()
            diff.divideScalar(d)
            ssteer.add(diff)
            scount++
        }
        if ((d > 0) && (d < neighbordist)) {
            asum.add(other.velocity)
            acount++
            csum.add(other_pos)
            ccount++
        }
    })

    if (scount > 0) {
        ssteer.divideScalar(scount)
    }
    if (ssteer.length() > 0) {
        ssteer.normalize()
        ssteer.multiplyScalar(maxspeed)
        ssteer.sub(velocity)
        ssteer = velocity.sub(ssteer)
        ssteer.clampLength(0, maxforce)
    }
    sep = ssteer

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

    sep.multiplyScalar(1.5)
    ali.multiplyScalar(1.0)
    coh.multiplyScalar(1.0)
    acceleration.add(sep)
    acceleration.add(ali)
    acceleration.add(coh)

    velocity.add(acceleration)
    velocity.clampLength(0, 3)

    let velocities = boid.velocities.slice()
    velocities.pop()
    velocities.forEach(velo => velocity.lerp(velo, 0.5))
    velocities.unshift(velocity)

    position.add(velocity)
    position.clamp(new THREE.Vector3(-r, -r, -r), new THREE.Vector3(r, r, r))

    return {
        boid: boid.boid,
        position: position,
        velocity: velocity,
        velocities: velocities
    }
}
