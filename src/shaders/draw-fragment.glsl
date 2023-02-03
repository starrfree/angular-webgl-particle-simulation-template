# version 300 es
precision highp float;

uniform float u_Width;
uniform float u_Height;
uniform sampler2D positionSampler;

in vec4 vColor;
out vec4 o_FragColor;

uint hash(uint ste);
float random(uint seed);

void main() {
  o_FragColor = vColor;
}