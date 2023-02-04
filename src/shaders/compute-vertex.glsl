# version 300 es
precision highp float;

uniform float width;
uniform float height;
uniform float xRange;
uniform float yRange;
uniform sampler2D positionSampler;
uniform sampler2D velocitySampler;

in vec4 i_VertexPosition;

out vec2 newPosition;
out vec2 newVelocity;

float dt = 0.001;
float drag = 1.0;
float bounceDamp = 0.9;
uint hash(uint ste);
float random(uint seed);

void main() {
  gl_Position = i_VertexPosition * 2.0 - 1.0;
  vec2 position = texture(positionSampler, vec2(i_VertexPosition.x, i_VertexPosition.y)).xy;
  vec2 velocity = texture(velocitySampler, vec2(i_VertexPosition.x, i_VertexPosition.y)).xy;

  vec2 force = vec2(0.0);
  for(float i = 0.0; i < width; i++) {
    for(float j = 0.0; j < height; j++) {
      float x = i / width;
      float y = j / height;
      vec2 otherPosition = texture(positionSampler, vec2(x, y)).xy;
      float r = distance(position, otherPosition) + 0.005;
      if (r > 0.0) {
        vec2 dir = (position - otherPosition) / r;
        force += -0.1 * dir / (r * r);
      }
    }
  }

  newPosition = position + dt * velocity;
  newVelocity = velocity + dt * force;
  newVelocity *= drag;

  if (newPosition.x < -xRange || newPosition.x > xRange) {
    newPosition.x = clamp(newPosition.x, -xRange, xRange);
    newVelocity.x *= -bounceDamp;
  }
  if (newPosition.y < -yRange || newPosition.y > yRange) {
    newPosition.y = clamp(newPosition.y, -yRange, yRange);
    newVelocity.y *= -bounceDamp;
  }
}

uint hash(uint ste) {
  ste ^= 2747636419u;
  ste *= 2654435769u;
  ste ^= ste >> 16;
  ste *= 2654435769u;
  ste ^= ste >> 16;
  ste *= 2654435769u;
  return ste;
}

float random(uint seed) {
  return float(hash(seed)) / 4294967295.0;
}
