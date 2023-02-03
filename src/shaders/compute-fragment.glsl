# version 300 es
precision highp float;

uniform float u_Width;
uniform float u_Height;
uniform sampler2D positionSampler;

in vec2 newPosition;
in vec2 newVelocity;

layout(location = 0) out vec4 o_Position;
layout(location = 1) out vec4 o_Velocity;

void main() {
  o_Position = vec4(newPosition, 0.0, 1.0);
  o_Velocity = vec4(newVelocity, 0.0, 1.0);
}