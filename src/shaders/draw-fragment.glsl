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
  // vec2 sampleCoord = vec2(gl_FragCoord.x / u_Width, gl_FragCoord.y / u_Height);
  o_FragColor = vColor;//texture(positionSampler, sampleCoord);
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
