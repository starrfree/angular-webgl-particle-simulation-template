# version 300 es
precision highp float;

uniform sampler2D positionSampler;

in vec4 vColor;
out vec4 o_FragColor;

uint hash(uint ste);
float random(uint seed);

void main() {
  float r = 0.0, delta = 0.0, alpha = 1.0;
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  r = length(cxy);
  if (r > 1.0) {
      discard;
  }
  o_FragColor = vColor * alpha;
}