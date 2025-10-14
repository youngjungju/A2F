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

  // Simplex noise implementation
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
    c[0] = vec3(0.024, 0.016, 0.169);
    c[1] = vec3(0.231, 0.102, 0.369);
    c[2] = vec3(0.722, 0.212, 0.169);
    c[3] = vec3(0.847, 0.482, 0.196);
    c[4] = vec3(0.580, 0.737, 0.882);
    c[5] = vec3(0.043, 0.039, 0.114);

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
    vec2 p = (v_uv * 2.0 - 1.0);
    p.x *= 1.5;
    vec2 w = p + vec2(fbm(p * 0.3, 3), fbm(p * 0.5, 2)) * u_warpStrength;
    float n = 0.0;
    for(int i = 0; i < 5; i++) {
      n += snoise(w * 0.5 * pow(2.0, float(i))) / pow(2.0, float(i));
    }
    float combined = clamp(pow(n * 0.5 + 0.5, 1.2), 0.0, 1.0);
    vec3 color = getColorFromScheme(combined);

    if (u_halftonePattern > 0 && applyHalftone(v_uv, combined) > 0.5) {
      color = mix(color, vec3(1.0), combined * 0.3 + 0.2);
    }

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
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

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

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    render();

    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      render();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

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

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [params.amplitude, params.saturation, params.layers, params.lacunarity, params.gain, params.warpStrength, params.halftonePattern, params.halftoneScale]);

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
}
