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

  uniform int u_colorStopCount;
  uniform float u_colorPositions[10];
  uniform vec3 u_colorValues[10];

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Improved Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+10.0)*x); }

  // Quintic interpolation for smoother transitions
  float quintic(float t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  vec2 quintic(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

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

  // Improved FBM with smoother blending
  float fbm(vec2 p, int layers) {
    float value = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float totalAmplitude = 0.0;

    for(int i = 0; i < 8; i++) {
      if(i >= layers) break;

      // Rotational variation per octave
      float angle = float(i) * 0.5;
      mat2 rot = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
      vec2 rotatedP = rot * p;

      value += amplitude * snoise(rotatedP * frequency);
      totalAmplitude += amplitude;

      frequency *= u_lacunarity;
      amplitude *= u_gain;
    }

    // Normalize and apply amplitude as overall strength multiplier
    return (value / totalAmplitude) * u_amplitude;
  }

  vec3 getColorFromScheme(float t) {
    t = clamp(t, 0.0, 1.0);

    // Find which color segment we're in
    for(int i = 0; i < 9; i++) {
      if(i >= u_colorStopCount - 1) break;

      float pos1 = u_colorPositions[i];
      float pos2 = u_colorPositions[i + 1];

      if(t >= pos1 && t <= pos2) {
        float blend = smoothstep(pos1, pos2, t);
        return mix(u_colorValues[i], u_colorValues[i + 1], blend);
      }
    }

    // If we're at or past the last position, blend back to first color for smooth cycling
    float lastPos = u_colorPositions[u_colorStopCount - 1];
    if(t >= lastPos && u_colorStopCount > 1) {
      float blend = smoothstep(lastPos, 1.0, t);
      return mix(u_colorValues[u_colorStopCount - 1], u_colorValues[0], blend * 0.3);
    }

    return u_colorValues[u_colorStopCount - 1];
  }

  float applyHalftone(vec2 uv, float value) {
    if (u_halftonePattern == 0) return 0.0;
    vec2 st = uv * u_halftoneScale * 2.5;
    vec2 gridPos = floor(st);
    vec2 cellPos = fract(st);
    float d = length(cellPos - 0.5) * 2.0;
    float r = value * 0.4 + 0.05;
    return 1.0 - smoothstep(r - 0.02, r, d);
  }

  // Dithering for smooth gradients
  float dither(vec2 uv) {
    float noise1 = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    float noise2 = fract(sin(dot(uv, vec2(93.9898, 67.345))) * 43758.5453);
    return (noise1 + noise2) * 0.5 - 0.5;
  }

  void main() {
    vec3 color;
    if (useOriginalTexture) {
      color = texture2D(originalTexture, vUv).rgb;
    } else {
      vec2 p = (vUv * 2.0 - 1.0);
      p.x *= 1.5;

      // Multi-scale domain warping
      vec2 warp1 = vec2(
        fbm(p * 0.5, 3),
        fbm(p * 0.5 + vec2(5.2, 1.3), 3)
      ) * u_warpStrength * 0.5;

      vec2 warp2 = vec2(
        fbm((p + warp1) * 1.2, 2),
        fbm((p + warp1) * 1.2 + vec2(3.7, 2.9), 2)
      ) * u_warpStrength * 0.3;

      vec2 finalPos = p + warp1 + warp2;

      // Enhanced FBM
      float n = fbm(finalPos * 0.8, u_layers);

      // Smooth remapping with quintic
      float t = n * 0.5 + 0.5;
      t = quintic(clamp(t, 0.0, 1.0));

      // Apply dithering
      float ditherAmount = dither(vUv * 1000.0) / 255.0;
      t = clamp(t + ditherAmount, 0.0, 1.0);

      color = getColorFromScheme(t);
      if (u_halftonePattern > 0 && applyHalftone(vUv, t) > 0.5) {
        color = mix(color, vec3(1.0), t * 0.3 + 0.2);
      }
    }

    color = mix(vec3(dot(color, vec3(0.299, 0.587, 0.114))), color, u_saturation);

    // Enhanced lighting with softer shadows
    vec3 n = normalize(vNormal);
    vec3 l = normalize(vec3(1.0, 1.0, 2.0));
    vec3 v = normalize(cameraPosition - vPosition);
    float d = max(dot(n, l), 0.0);

    // Softer diffuse lighting
    float diffuse = 0.4 + d * 0.6;

    // Subtle specular highlights
    vec3 specular = vec3(0.08) * pow(max(dot(v, reflect(-l, n)), 0.0), 32.0);

    vec3 f = color * diffuse + specular;
    gl_FragColor = vec4(f, 1.0);
  }
`;
