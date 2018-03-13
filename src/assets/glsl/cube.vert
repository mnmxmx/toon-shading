attribute float aNum;
attribute vec3 vertNormal;
// attribute float aColorNum;


uniform sampler2D posMap;
uniform sampler2D velMap;
uniform float uSize;
uniform float uTick;
uniform float uScale1;
uniform vec3 uScale2;
uniform vec3 uColorArray[4];
uniform bool isEdge;
uniform float uEdgeScale;

varying vec3 vPosition;
varying vec3 vColor;
varying vec3 vNormal;

float parabola( float x) {
  return 4.0 * (1.0 - x) * x;
}

mat2 calcRotate2D(float _deg){
  float _sin = sin(_deg);
  float _cos = cos(_deg);
  return mat2(_cos, _sin, -_sin, _cos);
}


mat3 calcLookAtMatrix(vec3 vector, float roll) {
  vec3 rr = vec3(sin(roll), cos(roll), 0.0);
  vec3 ww = normalize(vector);
  vec3 uu = normalize(cross(ww, rr));
  vec3 vv = normalize(cross(uu, ww));

  return mat3(uu, ww, vv);
}

void main() {
  float time = uTick * 0.3;

  vec2 posUv;
  posUv.x = mod(aNum + 0.5, uSize);
  posUv.y = float((aNum + 0.5) / uSize);
  posUv /= vec2(uSize);

  vec4 cubePosition = texture2D( posMap, posUv );
  vec4 cubeVelocity = texture2D( velMap, posUv );
  float alpha = cubeVelocity.a / 100.0;
  float scale = 0.025 * parabola( alpha);

  vec3 offsetEdgePos = (isEdge) ? vertNormal * uEdgeScale : vec3(0.0);

  vec3 pos = position + offsetEdgePos;
  pos.zx = calcRotate2D(time * 0.7) * pos.zx;

  mat4 localRotationMat = mat4( calcLookAtMatrix( cubeVelocity.xyz, 0.0 ) );

  vec3 modifiedVertex =  (localRotationMat * vec4( pos * scale * (vec3(1.0))  * uScale2 * uScale1, 1.0 ) ).xyz;
  vec3 modifiedPosition = modifiedVertex + cubePosition.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( modifiedPosition, 1.0 );
  vPosition = modifiedPosition;

  vNormal = normal;
  vNormal.zx = calcRotate2D(time * 0.7) * vNormal.zx;
  vNormal = (localRotationMat * vec4(vNormal, 1.0)).xyz;

  vColor = uColorArray[int(mod(aNum, 4.0))];
}