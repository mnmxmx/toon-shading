#define GLSLIFY 1
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 tmpPos = texture2D( posTex, uv );
  vec3 pos = tmpPos.xyz;
  vec4 tmpVel = texture2D( velTex, uv );

  vec3 vel = tmpVel.xyz;

  pos += vel;
  gl_FragColor = vec4( pos, tmpPos.a );
}