# version 300 es
precision highp float;

uniform sampler2D positionSampler;
uniform sampler2D velocitySampler;

in vec4 i_VertexPosition;
out vec4 vColor;

void main() {
  gl_PointSize = 3.0;
  vec2 position = texture(positionSampler, vec2(i_VertexPosition.x, i_VertexPosition.y)).xy;//i_VertexPosition;//
  vec2 velocity = texture(velocitySampler, vec2(i_VertexPosition.x, i_VertexPosition.y)).xy;
  position += velocity;
  gl_Position = vec4(position, 0.0, 1.0);
  vec3 color = vec3(1.0, 1.0, 1.0);
  vColor = vec4(color, 1.0);
}