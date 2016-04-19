"use strict";

var flock = function(num) {
	var population = [];
	for (var i = 0; i < num; i++) {
		population.push({x: rand(100), y: rand(100), z: rand(100), velocity: rand(1)});
	}
	return population;
} 

var update = function(swarm) {
	var next = [];
	swarm.forEach(function(bird) {
		var neighbours = find_neighbours(bird,swarm);
		var l = neighbours.length;
		var x = 0;
		var y = 0;
		var z = 0;
		var velocity = 0;
		neighbours.forEach(function(neighbour) {
			velocity += neighbour.velocity;
			x += neighbour.x;
			y += neighbour.y;
			z += neighbour.z;
		});
		velocity = velocity/l;
		x = x/l * velocity;
		y = y/l * velocity;
		z = z/l * velocity;
		next.push({x: x, y: y, z: z, velocity: velocity});
	});
	return next;
}

var find_neighbours = function(bird, swarm) {
	var dist = 50;
	var x1 = bird.x - dist;
	var x2 = bird.x + dist;
	var y1 = bird.y - dist;
	var y2 = bird.y + dist;
	var z1 = bird.z - dist;
	var z2 = bird.z + dist;
	var neighbours = [];
	swarm.forEach(function(bird2) {
		if (bird2.x > x1 && bird2.x < x2 && bird2.y > y1 && bird2.y < y2 && bird2.z > z1 && bird2.z < z2) {
			if (bird != bird2) {
				neighbours.push(bird2);
			}
		}
	});
	return neighbours;
}

var rand = function(num) {
	return Math.floor(Math.random() * num);
}

