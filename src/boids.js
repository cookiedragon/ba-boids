"use strict"

function initSwarm(num) {
    var swarm = []
    for (var i = 0; i < num; i++) {
        const genotype = initGenotype()
        const phenotype = calcPhenotype(genotype)
        swarm.push(boid(genotype, phenotype))
    }
    return swarm
}

function initGenotype() {
    return {
        lifespan: [between(15, 25) * 1000 * 60, between(15, 25) * 1000 * 60],
        max_stamina: [between(50, 100), between(50, 100)],
        food_capacity: [between(30, 50), between(30, 50)],
        max_speed: [between(30, 40), between(30, 40)],
        gender: ['X', 'X'],
        of_age_at: [between(5, 10) * 1000 * 60, between(5, 10) * 1000 * 60]
    }
}

function calcPhenotype(genotype) {
    return {
        birthday: Date.now(),
        lifespan: genotype.lifespan[rand(2)],
        max_stamina: genotype.max_stamina[rand(2)],
        food_capacity: genotype.food_capacity[rand(2)],
        max_speed: genotype.max_speed[rand(2)],
        gender: genotype.gender[0] == genotype.gender[1] ? "female" : "male",
        of_age_at: genotype.of_age_at[rand(2)]
    }
}

function boid(genotype, phenotype) {
    return {
        genotype: genotype,
        phenotype: phenotype,
        food_level: phenotype.food_capacity,
        stamina: phenotype.max_stamina,
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
            return ((this.stamina / this.phenotype.max_stamina * 100) < 10 ? true : false)
        }
    }
}

function rest(boid, energy) {
    let new_boid = boid(boid.genotype, boid.phenotype)
    new_boid.stamina += energy
    return new_boid
}

function feed(boid, energy) {
    let new_boid = boid(boid.genotype, boid.phenotype)
    new_boid.food_level += energy
    return new_boid
}

function gen_splicer(mum_gen, dad_gen) {
    return {
        lifespan: [mum_gen.lifespan[rand(2)], dad_gen.lifespan[rand(2)]],
        max_stamina: [mum_gen.max_stamina[rand(2)], dad_gen.max_stamina[rand(2)]],
        food_capacity: [mum_gen.food_capacity[rand(2)], dad_gen.food_capacity[rand(2)]],
        max_speed: [mum_gen.max_speed[rand(2)], dad_gen.max_speed[rand(2)]],
        gender: [mum_gen.gender[rand(2)], dad_gen.gender[rand(2)]],
        of_age_at: [mum_gen.of_age_at[rand(2)], dad_gen.of_age_at[rand(2)]]
    }
}

function update(swarm) {
    let next = []
    swarm.forEach(bird => {
        const neighbours = find_neighbours(bird, swarm)
        const l = neighbours.length
        let x = 0
        let y = 0
        let z = 0
        let velocity = 0
        neighbours.forEach(neighbour => {
            velocity += neighbour.velocity
            x += neighbour.x
            y += neighbour.y
            z += neighbour.z
        })
        velocity = velocity / l
        x = x / l * velocity
        y = y / l * velocity
        z = z / l * velocity
        next.push({
            x: x,
            y: y,
            z: z,
            velocity: velocity
        })
    })
    return next
}

function init_swarm_with_movement(num) {
    return initSwarm(num).map(boid => ({
        boid,
        movement: rand_movement()
    }))
}

function rand_movement() {
    return {
        position: {
            x: between(-50, 50),
            y: between(-50, 50),
            z: between(-50, 50)
        },
        velocity: between(1, 2)
    }
}

function find_neighbours(boid, swarm) {
    const dist = 50
    const x1 = boid.x - dist
    const x2 = boid.x + dist
    const y1 = boid.y - dist
    const y2 = boid.y + dist
    const z1 = boid.z - dist
    const z2 = boid.z + dist
    let neighbours = []
    swarm.forEach((bird2) => {
        if (bird2.x > x1 && bird2.x < x2 && bird2.y > y1 && bird2.y < y2 && bird2.z > z1 && bird2.z < z2) {
            if (bird != bird2) {
                neighbours.push(bird2)
            }
        }
    })
    return neighbours
}
