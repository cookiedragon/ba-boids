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

let make_new_baby_boid = (mum, dad) => {
    const genotype = gen_splicer(mum.boid.genotype, dad.boid.genotype)
    const phenotype = calcPhenotype(genotype)
    let boid = {
        boid: makeBoid(genotype, phenotype),
        position: baby_position(mum, dad),
        //position: new THREE.Vector3(between(-50, 50), between(-50, 50), between(-50, 50)),
        velocity: rand_velocity(),
        velocities: [rand_velocity(), rand_velocity(), rand_velocity()]
    }
    addBoidToSzene(boid)
    return boid
}

let initGenotype = () => {
    return {
        lifespan: [between(100, 200) * 10 * 60, between(100, 200) * 10 * 60],
        max_stamina: [between(100, 200), between(100, 200)],
        food_capacity: [between(30, 50), between(30, 50)],
        max_force: [0.4, 0.6],
        max_speed: [2.5, 3.5],
        gender: rand_gender(),
        of_age_at: [between(3, 5) * 1 * 60, between(3, 5) * 1 * 60]
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
        gender: genotype.gender,
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
            return (Date.now() - this.phenotype.birthday)
        },
        ready_to_die_of_old_age() {
            return ((this.phenotype.lifespan - this.age()) < 0) ? true : false
        },
        is_adult() {
            return (this.age() > this.phenotype.of_age_at ? true : false)
        },
        is_hungry() {
            return ((this.food_level / this.phenotype.food_capacity * 100) < 10 ? true : false)
        },
        is_tired() {
            return ((this.stamina / this.phenotype.max_stamina * 100) < 2 ? true : false)
        },
        is_fully_recovered() {
            return ((this.stamina / this.phenotype.max_stamina * 100) > 99 ? true : false)
        }
    }
}

let gen_splicer = (mum_gen, dad_gen) => {
    return {
        lifespan: [mum_gen.lifespan[rand(2)], dad_gen.lifespan[rand(2)]],
        max_stamina: [mum_gen.max_stamina[rand(2)], dad_gen.max_stamina[rand(2)]],
        food_capacity: [mum_gen.food_capacity[rand(2)], dad_gen.food_capacity[rand(2)]],
        max_force: [mum_gen.max_force[rand(2)], dad_gen.max_force[rand(2)]],
        max_speed: [mum_gen.max_speed[rand(2)], dad_gen.max_speed[rand(2)]],
        gender: rand_gender(),
        of_age_at: [mum_gen.of_age_at[rand(2)], dad_gen.of_age_at[rand(2)]]
    }
}

let updateWorld = () => {
    //countdown_update_timer()
    //countdown_breeding_timer()
    if (is_update_timer_up()) {
        resetUpdateTimer()
        boids = updatePopulationStatus()
    }
    //swarming_init_counter -= 1
    let newBoids = []
    let i = -1
    boids.forEach(boid => {
        newBoids.push(updateSwarmingSingle(boid))
        balls[i += 1].position.set(...boid.position.toArray())
    })
    boids = newBoids
}

let updatePopulationStatus = () => {
    let newPopulation = []
    boids.forEach(boid => {
        if (boid.boid.ready_to_die_of_old_age()) {
            removeBoidFromSzene(boid)
        } else {
            newPopulation.push(updateSingle(boid))
        }
    })
    if (is_breeding_time()) {
        let eligible = boids.filter((boid) => (on_ground(boid) && boid.boid.is_adult()))
        let females = eligible.filter(is_female)
        let males = eligible.filter(is_male)
        females.forEach(female => {
            let randomMale = rand_male(eligible)
            let baby = make_new_baby_boid(female, randomMale)
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

let on_ground = (boid) => {
    if (boid.position.y < -99) {
        boid.boid.status = 'ONGROUND'
        boid.velocity = new THREE.Vector3()
    }
    return (boid.boid.status === 'ONGROUND')
}

let is_swarming = (boid) => {
    return (boid.boid.status === 'SWARMING')
}

let is_searching_the_ground = (boid) => {
    return (boid.boid.status === 'SEARCHINGGROUND')
}

let is_in_danger = () => {
  return (enemy === 0 ? false : true)
}

let updateSingle = (boid) => {
    if (on_ground(boid)) {
        if (boid.boid.is_fully_recovered() && !is_breeding_time()) {
            boid.boid.status = 'SWARMING'
            boid.velocity = rand_velocity()
        } else {
            boid.boid.stamina += 10
        }
    } else {
        boid.boid.stamina -= 1
        if (boid.boid.is_tired() || boid.boid.is_hungry()) {
            boid.boid.status = 'SEARCHINGGROUND'
        } else if (is_breeding_time() && boid.boid.is_adult()) {
            boid.boid.status = 'SEARCHINGGROUND'
        }
    }
    return boid
}

let swarming_init_counter = 3

let updateSwarmingSingle = (boid) => {
    let acceleration = new THREE.Vector3()
    const maxspeed = boid.boid.phenotype.max_speed
    const maxforce = boid.boid.phenotype.max_force
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

    if (swarming_init_counter > 0) {
      boids.forEach(other => {
          let other_pos = other.position.clone()
          let d = position.distanceTo(other_pos)
          if ((d > 0) && (d < desiredseparation)) {
              let diff = other_pos.sub(position)
              diff.normalize()
              diff.divideScalar(d)
              ssteer.add(other_pos)
              scount++
          }
          if ((d > 0) && (d < neighbordist) && is_swarming(boid) && is_swarming(other)) {
              asum.add(other.velocity)
              acount++
              csum.add(other_pos)
              ccount++
          }
      })
    } else {
      let closest = findClosest(boid)
      if (closest[0] == undefined) {
          return boid
      }
      closest.forEach(other => {
          let other_pos = other.object.position.clone()
          let d = position.distanceTo(other_pos)
          if ((d > 0) && (d < desiredseparation)) {
              let diff = other_pos.sub(position)
              diff.normalize()
              diff.divideScalar(d)
              ssteer.add(diff)
              scount++
          }
          if ((d > 0) && (d < neighbordist) && is_swarming(boid) && is_swarming(other.object.boid)) {
              asum.add(other.object.velocity)
              acount++
              csum.add(other_pos)
              ccount++
          }
      })
    }

    if (is_in_danger()) {
      let enemy_pos = enemy.position.clone()
      let diff = enemy_pos.sub(position)
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
        //ssteer.sub(velocity)
        ssteer = velocity.sub(ssteer)
        ssteer.clampLength(0, maxforce)
    }
    sep = ssteer

    if (is_swarming(boid)) {
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
    } else if (is_searching_the_ground(boid)) {
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
        boid: boid.boid,
        position: position,
        velocity: velocity,
        velocities: velocities
    }
}
