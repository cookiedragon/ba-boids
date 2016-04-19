"use strict";

var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms
document.body.appendChild(stats.dom);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var directional_light = new THREE.DirectionalLight(0xffffff, 1);
directional_light.position.set(1, 1, 1).normalize();
scene.add(directional_light);
var ambient_light = new THREE.AmbientLight(0x404040);
scene.add(ambient_light);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var balls = [];

var init = function(boids) {
	var geometry = new THREE.SphereGeometry(1, 32, 32);
	for (var i = 0; i < boids.length; i ++) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff}));
		mesh.position.x = boids[i].x;
		mesh.position.y = boids[i].y;
		mesh.position.z = boids[i].z;
		mesh.rotation.x = Math.random() * 2 * Math.PI;
		mesh.rotation.y = Math.random() * 2 * Math.PI;
		mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 5 + 5;
		balls.push(mesh);
		scene.add(mesh);
	}
	camera.position.x = 100;
	camera.position.y = 100;
	camera.position.z = 150;
}

var time = Date.now();
var sign = 1;

function renderWorld() {

    stats.begin();
	if (Date.now() - time > 5000) {
		sign *= -1;
		time = Date.now();
	}
	boids = update(boids);
	for (var i = 0; i < balls.length; i++) {
		//var zahl = Math.floor(Math.random() * 3);
		balls[i].position.x = boids[i].x;
		balls[i].position.y = boids[i].y;
		balls[i].position.z = boids[i].z;
	}
	renderer.render(scene, camera);

    stats.end();

    requestAnimationFrame(renderWorld);
}
