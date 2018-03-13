#pragma glslify: snoise = require("./noise3D");

// varying vec3 vPos;
varying vec2 vUv;



uniform float uTick;
uniform vec2 uSize;
// uniform vec3 uEdgeColor;
uniform vec3 uBgColor;



uniform sampler2D uTex_1;


vec3 calcContrast(vec3 _value){
  return _value * 1.1 - 0.1;
}

float rand(vec2 co){
  float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
  float s = a * (6.182785114200511 + a * a * (-38.026512460676566 + a * a * 53.392573080032137));
  float t = fract(s * 43758.5453);

  return t;
}


// color 
vec3 normalColor(vec4 c1, vec4 c2){
  return mix(c1.rgb + c2.rgb, c1.rgb, c1.a);
}

vec3 addColor(vec4 c1, vec4 c2){
  return c2.rgb * c2.a + c1.rgb;
}

vec3 multiplyColor(vec4 c1, vec4 c2){
  return c2.rgb * c1.rgb;
}


vec3 screenColor(vec4 c1, vec4 c2){
  return c2.rgb * (vec3(1.0) - c1.rgb) + c1.rgb;
}

vec3 overlayColor(vec4 c1, vec4 c2){
  float r = (c1.r < 0.5) ? 2.0 * c1.r * c2.r : 1.0 - 2.0 * (1.0 - c1.r) * (1.0 - c2.r);
  float g = (c1.g < 0.5) ? 2.0 * c1.g * c2.g : 1.0 - 2.0 * (1.0 - c1.g) * (1.0 - c2.g);
  float b = (c1.b < 0.5) ? 2.0 * c1.b * c2.b : 1.0 - 2.0 * (1.0 - c1.b) * (1.0 - c2.b);

  return vec3(r, g, b);
}

vec3 rgb2hsv(vec3 c){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}


vec3 hsv2rgb(vec3 c){
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec2 noiseUv(vec2 uv){
  float uvNoise = snoise(vec3(uv.x * 200.0, uv.y * 200.0, 0.0));
  float noiseRadius = 1.0;

  float _u = uv.x * uSize.x + rand(uv) * noiseRadius * (1.0 + uvNoise) * 2.0 - noiseRadius;
  float _v = uv.y * uSize.y + rand(vec2(uv.y, uv.x)) * noiseRadius * (1.0 + uvNoise) * 2.0 - noiseRadius;
  return vec2(_u, _v) / uSize * (1.0 + abs(uvNoise) * 0.001);
}




void main(){

  float time = uTick * 0.0001;

  vec4 bgColor = vec4(uBgColor, 1.0);

  vec2 st = vUv * 2.0 - 0.5;
  float faceUvOffset = snoise(vec3(st * 6.0, time));

  vec2 faceColorUv = vUv + vec2(faceUvOffset)* 0.003;


  vec4 faceColor = texture2D(uTex_1, vUv);


  vec4 color;
  // color = faceColor;
  // color.a = edgeColor.a;
  // color.rgb = normalColor(color, edgeColor);
  // color.rgb = normalColor(color, bgColor);
  // color.a = 1.0;

  color = faceColor;
  color.rgb = normalColor(color, bgColor);
  color.a = 1.0;

  // color.rgb = max(vec3(0.0), min(vec3(1.0), color.rgb));

  // vec3 hsv = rgb2hsv(color.rgb);
  // hsv.r -= 0.62;
  // hsv.g -= 0.7;
  // hsv.b -= 0.3;
  // color.rgb = hsv2rgb(hsv);


  gl_FragColor = vec4(color);
}