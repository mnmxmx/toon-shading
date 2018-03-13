void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 tmpPos = texture2D( defTex, uv );
  gl_FragColor = vec4( tmpPos.rgb, 0.0 );
}