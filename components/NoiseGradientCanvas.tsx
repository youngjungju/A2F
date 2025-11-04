'use client';

import { useRef, useEffect } from 'react';
import { NoiseParams } from '@/lib/types';

const vertexShaderSource = `
  attribute vec4 a_position;
  varying vec2 v_uv;

  void main() {
    gl_Position = a_position;
    v_uv = a_position.xy * 0.5 + 0.5;
  }
`;

const fragmentShaderSource = `
  precision highp float;
  varying vec2 v_uv;

  uniform float u_amplitude;
  uniform float u_saturation;
  uniform int u_layers;
  uniform float u_lacunarity;
  uniform float u_gain;
  uniform float u_warpStrength;
  uniform int u_halftonePattern;
  uniform float u_halftoneScale;

  uniform int u_colorStopCount;
  uniform float u_colorPositions[10];
  uniform vec3 u_colorValues[10];

  // Improved Simplex noise implementation with better interpolation
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+10.0)*x); }

  // Quintic interpolation for smoother transitions (6x^5 - 15x^4 + 10x^3)
  float quintic(float t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  vec2 quintic(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  // Enhanced Simplex noise with quintic interpolation
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

      // Add rotational variation per octave for more organic patterns
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

    // Unrolled loop for WebGL compatibility
    if (u_colorStopCount >= 2) {
      if (t >= u_colorPositions[0] && t <= u_colorPositions[1]) {
        float blend = (t - u_colorPositions[0]) / (u_colorPositions[1] - u_colorPositions[0]);
        return mix(u_colorValues[0], u_colorValues[1], blend);
      }
    }
    if (u_colorStopCount >= 3) {
      if (t >= u_colorPositions[1] && t <= u_colorPositions[2]) {
        float blend = (t - u_colorPositions[1]) / (u_colorPositions[2] - u_colorPositions[1]);
        return mix(u_colorValues[1], u_colorValues[2], blend);
      }
    }
    if (u_colorStopCount >= 4) {
      if (t >= u_colorPositions[2] && t <= u_colorPositions[3]) {
        float blend = (t - u_colorPositions[2]) / (u_colorPositions[3] - u_colorPositions[2]);
        return mix(u_colorValues[2], u_colorValues[3], blend);
      }
    }
    if (u_colorStopCount >= 5) {
      if (t >= u_colorPositions[3] && t <= u_colorPositions[4]) {
        float blend = (t - u_colorPositions[3]) / (u_colorPositions[4] - u_colorPositions[3]);
        return mix(u_colorValues[3], u_colorValues[4], blend);
      }
    }
    if (u_colorStopCount >= 6) {
      if (t >= u_colorPositions[4] && t <= u_colorPositions[5]) {
        float blend = (t - u_colorPositions[4]) / (u_colorPositions[5] - u_colorPositions[4]);
        return mix(u_colorValues[4], u_colorValues[5], blend);
      }
    }
    if (u_colorStopCount >= 7) {
      if (t >= u_colorPositions[5] && t <= u_colorPositions[6]) {
        float blend = (t - u_colorPositions[5]) / (u_colorPositions[6] - u_colorPositions[5]);
        return mix(u_colorValues[5], u_colorValues[6], blend);
      }
    }
    if (u_colorStopCount >= 8) {
      if (t >= u_colorPositions[6] && t <= u_colorPositions[7]) {
        float blend = (t - u_colorPositions[6]) / (u_colorPositions[7] - u_colorPositions[6]);
        return mix(u_colorValues[6], u_colorValues[7], blend);
      }
    }
    if (u_colorStopCount >= 9) {
      if (t >= u_colorPositions[7] && t <= u_colorPositions[8]) {
        float blend = (t - u_colorPositions[7]) / (u_colorPositions[8] - u_colorPositions[7]);
        return mix(u_colorValues[7], u_colorValues[8], blend);
      }
    }
    if (u_colorStopCount >= 10) {
      if (t >= u_colorPositions[8] && t <= u_colorPositions[9]) {
        float blend = (t - u_colorPositions[8]) / (u_colorPositions[9] - u_colorPositions[8]);
        return mix(u_colorValues[8], u_colorValues[9], blend);
      }
    }

    // Return last color
    if (u_colorStopCount == 1) return u_colorValues[0];
    if (u_colorStopCount == 2) return u_colorValues[1];
    if (u_colorStopCount == 3) return u_colorValues[2];
    if (u_colorStopCount == 4) return u_colorValues[3];
    if (u_colorStopCount == 5) return u_colorValues[4];
    if (u_colorStopCount == 6) return u_colorValues[5];
    if (u_colorStopCount == 7) return u_colorValues[6];
    if (u_colorStopCount == 8) return u_colorValues[7];
    if (u_colorStopCount == 9) return u_colorValues[8];
    return u_colorValues[9];
  }

  float applyHalftone(vec2 uv, float value) {
    if (u_halftonePattern == 0) return 0.0;
    vec2 st = uv * u_halftoneScale * 2.5;
    float d = length(fract(st) - 0.5) * 2.0;
    if (value < 0.3) return 0.0;
    float r = ((value - 0.3) / 0.7) * 0.3 + 0.1;
    return 1.0 - smoothstep(r - 0.02, r, d);
  }

  // Smooth dithering to eliminate banding
  float dither(vec2 uv) {
    // Triangular probability distribution for better dithering
    float noise1 = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    float noise2 = fract(sin(dot(uv, vec2(93.9898, 67.345))) * 43758.5453);
    return (noise1 + noise2) * 0.5 - 0.5;
  }

  void main() {
    // Aspect-correct coordinates
    vec2 p = (v_uv * 2.0 - 1.0);
    p.x *= 1.5;

    // Multi-scale domain warping for organic flow
    vec2 warp1 = vec2(
      fbm(p * 0.5, 3),
      fbm(p * 0.5 + vec2(5.2, 1.3), 3)
    ) * u_warpStrength * 0.5;

    vec2 warp2 = vec2(
      fbm((p + warp1) * 1.2, 2),
      fbm((p + warp1) * 1.2 + vec2(3.7, 2.9), 2)
    ) * u_warpStrength * 0.3;

    vec2 finalPos = p + warp1 + warp2;

    // Enhanced FBM with better frequency distribution
    float n = fbm(finalPos * 0.8, u_layers);

    // Smooth remapping with quintic curve for better color distribution
    float t = n * 0.5 + 0.5; // Map from [-1,1] to [0,1]
    t = quintic(clamp(t, 0.0, 1.0)); // Apply quintic smoothing

    // Apply subtle dithering to eliminate color banding
    float ditherAmount = dither(v_uv * 1000.0) / 255.0;
    t = clamp(t + ditherAmount, 0.0, 1.0);

    // Get color from gradient
    vec3 color = getColorFromScheme(t);

    // Apply halftone if enabled
    if (u_halftonePattern > 0 && applyHalftone(v_uv, t) > 0.5) {
      color = mix(color, vec3(1.0), t * 0.3 + 0.2);
    }

    // Apply saturation with better grayscale conversion
    color = mix(vec3(dot(color, vec3(0.299, 0.587, 0.114))), color, u_saturation);

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface NoiseGradientCanvasProps {
  params: NoiseParams;
  className?: string;
}

export default function NoiseGradientCanvas({ params, className = '' }: NoiseGradientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl', {
      preserveDrawingBuffer: true,
      antialias: true,
      alpha: false
    });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader compilation error:', gl.getShaderInfoLog(vertexShader));
      return;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation error:', gl.getShaderInfoLog(fragmentShader));
      return;
    }

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;

    // Create buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    // Static render function
    const render = () => {
      if (!gl || !program) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Set uniforms
      gl.uniform1f(gl.getUniformLocation(program, 'u_amplitude'), params.amplitude);
      gl.uniform1f(gl.getUniformLocation(program, 'u_saturation'), params.saturation);
      gl.uniform1i(gl.getUniformLocation(program, 'u_layers'), params.layers);
      gl.uniform1f(gl.getUniformLocation(program, 'u_lacunarity'), params.lacunarity);
      gl.uniform1f(gl.getUniformLocation(program, 'u_gain'), params.gain);
      gl.uniform1f(gl.getUniformLocation(program, 'u_warpStrength'), params.warpStrength);
      gl.uniform1i(gl.getUniformLocation(program, 'u_halftonePattern'), params.halftonePattern);
      gl.uniform1f(gl.getUniformLocation(program, 'u_halftoneScale'), params.halftoneScale);

      // Set color stops
      gl.uniform1i(gl.getUniformLocation(program, 'u_colorStopCount'), params.colorStops.length);

      const positions = params.colorStops.map(stop => stop.position);

      gl.uniform1fv(gl.getUniformLocation(program, 'u_colorPositions'), positions);
      for (let i = 0; i < params.colorStops.length; i++) {
        const hex = params.colorStops[i].color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        gl.uniform3f(gl.getUniformLocation(program, `u_colorValues[${i}]`), r, g, b);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      render();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial render
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update on params change
  useEffect(() => {
    if (!glRef.current || !programRef.current) return;

    const gl = glRef.current;
    const program = programRef.current;

    gl.useProgram(program);
    gl.uniform1f(gl.getUniformLocation(program, 'u_amplitude'), params.amplitude);
    gl.uniform1f(gl.getUniformLocation(program, 'u_saturation'), params.saturation);
    gl.uniform1i(gl.getUniformLocation(program, 'u_layers'), params.layers);
    gl.uniform1f(gl.getUniformLocation(program, 'u_lacunarity'), params.lacunarity);
    gl.uniform1f(gl.getUniformLocation(program, 'u_gain'), params.gain);
    gl.uniform1f(gl.getUniformLocation(program, 'u_warpStrength'), params.warpStrength);
    gl.uniform1i(gl.getUniformLocation(program, 'u_halftonePattern'), params.halftonePattern);
    gl.uniform1f(gl.getUniformLocation(program, 'u_halftoneScale'), params.halftoneScale);

    // Update color stops
    gl.uniform1i(gl.getUniformLocation(program, 'u_colorStopCount'), params.colorStops.length);
    const positions = params.colorStops.map(stop => stop.position);
    gl.uniform1fv(gl.getUniformLocation(program, 'u_colorPositions'), positions);
    for (let i = 0; i < params.colorStops.length; i++) {
      const hex = params.colorStops[i].color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      gl.uniform3f(gl.getUniformLocation(program, `u_colorValues[${i}]`), r, g, b);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [params]);

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
}
