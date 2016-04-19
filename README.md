# Modellierung und Visualisierung einer Population von Boids
Projekt meiner BA im SS2016

## What is it about?
In this project, I want to visualize a population of swarm birds. There is nothing new about that, we have been doing that for approximately 30 years, when Craig Reynolds invented the Boids model.
But that model has a rather limited purpose: all it does is visualize (or rather descibe) the swarming. What about other situations? When the birds get tired or hungry? Are they immortal and never die?
I'd like to model a more wholesome approach in order to show the lifecycle of those birds in a population. I will do so by using the Boids model as a basis and adding a bit more on top, like genetics and a more complex behaviour decision making process.
My approach is based on alife rather than seeing these birds as dumb particles. And while multi agent systems have a lot in common with my birds, multi agent systems usually have a problem to solve (which my birds don't) and there GA are used to optimize the solution. My GA are instead biologically inspired. The "fitness function" is natural selection.
Naturally, I will also implement a visualization in 3D.

## How to run
Checkout the project into a folder hosted on a web server, e.g. lighttp. Open up a browser of your choice, go to http://localhost/ba-boids/ and enjoy.
