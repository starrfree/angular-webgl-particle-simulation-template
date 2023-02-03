# version 300 es
precision highp float;

uniform sampler2D positionSampler;
uniform sampler2D velocitySampler;

in vec4 i_VertexPosition;

out vec2 newPosition;
out vec2 newVelocity;

float dt = 0.01;
uint hash(uint ste);
float random(uint seed);

void main() {
  gl_Position = i_VertexPosition * 2.0 - 1.0;
  vec2 position = texture(positionSampler, vec2(i_VertexPosition.x, i_VertexPosition.y)).xy;
  vec2 velocity = texture(velocitySampler, vec2(i_VertexPosition.x, i_VertexPosition.y)).xy;
  newPosition = position + dt * velocity;
  newVelocity = velocity;
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
