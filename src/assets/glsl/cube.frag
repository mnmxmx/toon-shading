uniform bool isEdge;
uniform vec3 uEdgeColor;
uniform bool isShading;

varying vec3 vPosition;
varying vec3 vColor;
varying vec3 vNormal;


vec3 calcIrradiance_hemi(vec3 newNormal, vec3 lightPos, vec3 grd, vec3 sky){
  float dotNL = clamp(dot(newNormal, normalize(lightPos)), 0.0, 1.0);

  return mix(grd, sky, dotNL);
}

vec3 calcIrradiance_dir(vec3 newNormal, vec3 lightPos, vec3 light, float t1, float t2){
  float dotNL = clamp(dot(newNormal, normalize(lightPos)) , 0.0, 1.0);

  vec3 diffuse = (dotNL < t1) ? vec3(0.0, -0.1, 0.1) : (dotNL < t2) ? vec3(-0.1, -0.2, 0.1) : vec3(1.0);

  return light * diffuse;
}


const float PI = 3.14159265358979323846264;

// hemisphere ground color
const vec3 hemiLight_g = vec3(256.0, 246.0, 191.0) / vec3(256.0);

// hemisphere sky color
const vec3 hemiLight_s_1 = vec3(0.9,0.8,0.6);
const vec3 hemiLight_s_2 = vec3(0.9,0.6,0.7);

// directional light color
const vec3 dirLight_1 = vec3(0.02, 0.02, 0.0);
const vec3 dirLight_2 = vec3(0.0, 0.1, 0.1);

const vec3 dirLightPos_1 = vec3(4, 6, 10);
const vec3 dirLightPos_2 = vec3(-5, -5, -5);


const vec3 hemiLightPos_1 = vec3(-100.0, -100.0, 100.0);
const vec3 hemiLightPos_2 = vec3(-100.0, 100.0, -100.0);

void main() {
  // vec3 fdx = dFdx( vPosition );
  // vec3 fdy = dFdy( vPosition );
  // vec3 norm = normalize(cross(fdx, fdy));

  vec3 hemiColor = vec3(0.0);
  hemiColor += calcIrradiance_hemi(vNormal, hemiLightPos_1, hemiLight_g, hemiLight_s_1) * 0.56;
  hemiColor += calcIrradiance_hemi(vNormal, hemiLightPos_2, hemiLight_g, hemiLight_s_2) * 0.56;
  
  vec3 dirColor = vec3(0.0);
  dirColor += calcIrradiance_dir(vNormal, dirLightPos_1, dirLight_1, 0.3, 0.7);
  dirColor += calcIrradiance_dir(vNormal, dirLightPos_2, dirLight_2, 0.5, 0.6);


  vec3 color = vColor * min(vec3(1.0), hemiColor * 1.06);
  color += dirColor;

  // color =  min(vColor, color);

  color = (isEdge) ? uEdgeColor : (isShading) ? color : vColor;

  gl_FragColor = vec4(color, 1.0);
}