export const noiseVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const noiseFragmentShader = `
  uniform float u_amplitude;
  uniform float u_saturation;
  uniform int u_layers;
  uniform float u_lacunarity;
  uniform float u_gain;
  uniform float u_warpStrength;
  uniform int u_halftonePattern;
  uniform float u_halftoneScale;
  uniform sampler2D originalTexture;
  uniform bool useOriginalTexture;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+10.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p, int layers) {
    float value = 0.0, amplitude = u_amplitude, frequency = 1.0;
    for(int i = 0; i < 8; i++) {
      if(i >= layers) break;
      value += amplitude * snoise(p * frequency);
      frequency *= u_lacunarity;
      amplitude *= u_gain;
    }
    return value;
  }

  vec3 getColorFromScheme(float t) {
    vec3 c[6];
    c[0] = vec3(0.024, 0.016, 0.169); // #06042b 진한 네이비
    c[1] = vec3(0.231, 0.102, 0.369); // #3b1a5e 진한 보라색
    c[2] = vec3(0.722, 0.212, 0.169); // #b8362b 진한 빨간색
    c[3] = vec3(0.847, 0.482, 0.196); // #d87b32 주황색
    c[4] = vec3(0.580, 0.737, 0.882); // #94bce1 하늘색
    c[5] = vec3(0.043, 0.039, 0.114); // #0b0a1d 매우 진한 네이비

    if (t < 0.09) return mix(c[0], c[1], t / 0.09);
    if (t < 0.24) return mix(c[1], c[2], (t - 0.09) / 0.15);
    if (t < 0.36) return mix(c[2], c[3], (t - 0.24) / 0.12);
    if (t < 0.52) return mix(c[3], c[4], (t - 0.36) / 0.16);
    if (t < 0.81) return mix(c[4], c[5], (t - 0.52) / 0.29);
    return mix(c[5], c[0], (t - 0.81) / 0.19);
  }

  float applyHalftone(vec2 uv, float value) {
    if (u_halftonePattern == 0) return 0.0;
    vec2 st = uv * u_halftoneScale * 2.5;
    float d = length(fract(st) - 0.5) * 2.0;
    if (value < 0.3) return 0.0;
    float r = ((value - 0.3) / 0.7) * 0.3 + 0.1;
    return 1.0 - smoothstep(r - 0.02, r, d);
  }

  void main() {
    vec3 color;
    if (useOriginalTexture) {
      color = texture2D(originalTexture, vUv).rgb;
    } else {
      vec2 p = (vUv * 2.0 - 1.0);
      p.x *= 1.5;
      vec2 w = p + vec2(fbm(p * 0.3, 3), fbm(p * 0.5, 2)) * u_warpStrength;
      float n = 0.0;
      for(int i = 0; i < 5; i++) {
        n += snoise(w * 0.5 * pow(2.0, float(i))) / pow(2.0, float(i));
      }
      float c = clamp(pow(n * 0.5 + 0.5, 1.2), 0.0, 1.0);
      color = getColorFromScheme(c);
      if (u_halftonePattern > 0 && applyHalftone(vUv, c) > 0.5) {
        color = mix(color, vec3(1.0), c * 0.3 + 0.2);
      }
    }
    color = mix(vec3(dot(color, vec3(0.299, 0.587, 0.114))), color, u_saturation);
    vec3 n = normalize(vNormal);
    vec3 l = normalize(vec3(1.0, 1.0, 2.0));
    vec3 v = normalize(cameraPosition - vPosition);
    float d = max(dot(n, l), 0.0);
    vec3 f = color * (0.5 + d * 0.5) + vec3(0.15) * pow(max(dot(v, reflect(-l, n)), 0.0), 32.0);
    gl_FragColor = vec4(f, 1.0);
  }
`;
