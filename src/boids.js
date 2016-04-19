"use strict";

var init = function(num) {
    var swarm = [];
    for (var i = 0; i < num; i++) {
        swarm.push(boid(initGenotype()));
    }
    return swarm;
}

var initGenotype = function() {
    return {
        lifespan: [between(15, 25) * 1000 * 60, between(15, 25) * 1000 * 60],
        max_stamina: [between(50, 100), between(50, 100)],
        food_capacity: [between(30, 50), between(30, 50)],
        max_speed: [between(30, 40), between(30, 40)],
        gender: ['X', 'X'],
        of_age_at: [between(5, 10) * 1000 * 60, between(5, 10) * 1000 * 60]
    };
}

var calcPhenotype = function(genotype) {
    return {
        birthday: Date.now(),
        lifespan: genotype.lifespan[rand(2)],
        max_stamina: genotype.max_stamina[rand(2)],
        food_capacity: genotype.food_capacity[rand(2)],
        max_speed: genotype.max_speed[rand(2)],
        gender: genotype.gender[0] == genotype.gender[1] ? "female" : "male",
        of_age_at: genotype.of_age_at[rand(2)]
    };
}

var boid = function(genotype) {
    var phenotype = calcPhenotype(genotype);
    return {
        genotype: genotype,
        phenotype: phenotype,
        food_level: phenotype.food_capacity,
        stamina: phenotype.max_stamina,
        age: function() {
            return this.phenotype.lifespan - (Date.now() - this.phenotype.birthday);
        },
        is_adult: function() {
            return (this.age > this.phenotype.of_age_at ? true : false);
        },
        is_hungry: function() {
            return ((this.food_level / this.phenotype.food_capacity * 100) < 10 ? true : false);
        },
        is_tired: function() {
            return ((this.stamina / this.phenotype.max_stamina * 100) < 10 ? true : false);
        },
        rests: function(energy) {
            this.stamina += energy;
        },
        feeds: function(energy) {
            this.food_level += energy;
        }
    };
}

var rand = function(num) {
    return Math.floor(Math.random() * num);
}
var between = function(lower, upper) {
    return Math.floor(Math.random() * upper + lower);
}

var gen_splicer = function(mum_gen, dad_gen) {
    return {
        lifespan: [mum_gen.lifespan[rand(2)], dad_gen.lifespan[rand(2)]],
        max_stamina: [mum_gen.max_stamina[rand(2)], dad_gen.max_stamina[rand(2)]],
        food_capacity: [mum_gen.food_capacity[rand(2)], dad_gen.food_capacity[rand(2)]],
        max_speed: [mum_gen.max_speed[rand(2)], dad_gen.max_speed[rand(2)]],
        gender: [mum_gen.gender[rand(2)], dad_gen.gender[rand(2)]],
        of_age_at: [mum_gen.of_age_at[rand(2)], dad_gen.of_age_at[rand(2)]]
    };
}

var population = init(2);
population.forEach(function(e) {
    console.log(e.genotype.lifespan);
    console.log(e.phenotype.lifespan);
});
console.log('##########BABY###########');
var baby = boid(gen_splicer(population[0].genotype, population[1].genotype));
console.log(baby.genotype.lifespan);
console.log(baby.phenotype.lifespan);
