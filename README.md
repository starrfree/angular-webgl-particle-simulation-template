# Angular + WebGL particle simulaition template 
This is a quick start WebGL particle simulation project template for Angular.

- [**Workflow**](#workflow)
  - [**WebGL**](#webgl)
    - [Particles Simulation](#1-particles-simulation)
    - [Particles render](#2-particles-render)
  - [**Angular**](#angular)
- [**How to use**](#how-to-use)
- [**Examples**](#examples)

## Workflow

### WebGL

There are two passes for each frame:

#### 1. Particles Simulation

The simulation of the particles is done in the vertex shader to take advantage of the GPU.<br>
Particles attributes (position, velocity) are stored in textures.<br>
Particles behaviour is controlled by the shader at [/src/shaders/compute-vertex.glsl](/src/shaders/compute-vertex.glsl), this is where the code must be changed to control the particle simulation.

Here is a recap of the different variables:

| Variable  | Description |
| ------------- | ------------- |
| width  | width of the particle attributes textures  |
| height  | height of the particle attributes textures  |
| xRange | defines left and right edge of the simulation domain |
| yRange | defines top and bottom edge of the simulation domain |
| positionSampler | texture storing the position attribute |
| velocitySampler | texture storing the velocity attribute |
| i_VertexPosition | defines the index of the currently calculated particle in the attributes textures |
| newPosition | defines the position that will be written to the output texture |
| newVelocity | defines the velocity that will be written to the output texture |
| dt | time step |
| drag | velocity is multiplied by **drag** every frame |
| bounceDamp | velocity is multiplied by **bounceDamp** every time the particle bounces off the edge |

In order for the particles to interact with one another, all particles position can be sampled through the texture.
The following code loops through all particles and computes the total gravitationnal force acting on the curently calculated particle:
```GLSL
vec2 force = vec2(0.0);
for(float i = 0.0; i < width; i++) {
    for(float j = 0.0; j < height; j++) {
        float x = (i + 0.1) / (width);
        float y = (j + 0.1) / (height);
        vec2 otherPosition = texture(positionSampler, vec2(x, y)).xy;
        float r = distance(position, otherPosition) + 0.005;
        if (r > 0.0) {
            vec2 dir = (position - otherPosition) / r;
            force += -0.1 * dir / (r * r);
        }
    }
}
```
Then, the velociy of the particles are updated based on the force and the position is updated based on velocity:
```GLSL
newVelocity = velocity + dt * force;
newVelocity *= drag;
newPosition = position + dt * velocity;
```
The particles bounce off the edge of the simulation:
```GLSL
if (newPosition.x < -xRange || newPosition.x > xRange) {
    newPosition.x = clamp(newPosition.x, -xRange, xRange);
    newVelocity.x *= -bounceDamp;
}
if (newPosition.y < -yRange || newPosition.y > yRange) {
    newPosition.y = clamp(newPosition.y, -yRange, yRange);
    newVelocity.y *= -bounceDamp;
}
```
The new velocity and position are then written to the output textures that will be swapped with the input textures and serve as input for the next frame.

#### 2. Particles render

When the calculation is done, particles are rendered as points to the canvas. Color and size attributes are controlled by the shader at [/src/shaders/draw-vertex.glsl](/src/shaders/draw-vertex.glsl).<br>
``gl_PointSize`` defines the size of the point drawn to the canvas.<br>
``vec3 color`` defines the color of the point.<br>

### Angular

Simulation and render are called from **scene-canvas** component located at [/src/app/scene-canvas/scene-canvas.component.ts](src/app/scene-canvas/scene-canvas.component.ts).<br>
The number of particles is given by ``particleTextureSize: [number, number]``: it defines the **width** and **height** of the particles attribute texture. The total number of particles is given by **width * height** i.e. ``particleTextureSize[0] * particleTextureSize[1]``.<br><br>
The ``main()`` function is responsible for initializing **WebGL context**, **buffers**, **textures**, **programs**, **program info**, handling **window resize** and **animation loop**.<br>
The ``frame(gl: WebGL2RenderingContext, programInfo: any)`` function is called each animation loop. It computes ``iterations: number`` simulation steps and then renders particles to the canvas.


## How to use

*The website is an [Angular](https://angular.io/docs) application.*<br>
Install [Angular CLI](https://angular.io/cli)<br>
Clone this repository<br>
Run ``npm install`` command in the project root to install all packages<br>
Run ``ng serve`` command to start a local server

## Examples


https://user-images.githubusercontent.com/98308569/230007615-f3477f3f-08f8-45bf-a698-d29830c202f3.mov


https://user-images.githubusercontent.com/98308569/230009365-7c72b92d-9777-4cc8-b77b-5146ce92bef1.mp4




