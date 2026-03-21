/* eslint-disable */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    // Render as a full-screen quad overriding projection
    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 mouse;
varying vec2 vUv;

// --- Noise Functions ---
float hash(float n) { return fract(sin(n)*1e4); }
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = i.x + i.y * 157.0 + 113.0 * i.z;
    return mix(
        mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
            mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
        mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
            mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
}

float fbm(vec3 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 3; i++) {
        f += w * noise(p);
        p *= 2.0;
        w *= 0.5;
    }
    return f;
}

// --- Volumetric Accretion Disk ---
float diskDensity(vec3 p) {
    float r = length(p.xz);
    float h = abs(p.y);
    
    // Bounding limits
    if (r < 1.5 || r > 6.5) return 0.0;
    
    // Tapering thickness
    float thickness = 0.3 * (1.0 - smoothstep(1.5, 6.5, r));
    if (h > thickness) return 0.0;
    
    // Vertical falloff
    float d = 1.0 - (h / thickness);
    d = pow(d, 1.5);
    
    // Swirling noise details
    float angle = atan(p.z, p.x);
    float swirl = angle - iTime * 0.6;
    vec3 np = vec3(r * 2.5, swirl * 5.0, iTime * 0.5);
    float n = fbm(np);
    
    // Fade at borders
    float edge = smoothstep(1.5, 2.0, r) * smoothstep(6.5, 4.0, r);
    return d * n * edge;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    
    // --- Camera Setup ---
    float orbitAngle = mouse.x * 2.0 + iTime * 0.03;
    float distToHole = 6.0;
    vec3 ro = vec3(sin(orbitAngle) * distToHole, 0.5 - mouse.y * 3.0, cos(orbitAngle) * distToHole);
    
    vec3 ta = vec3(0.0, 0.0, 0.0);
    vec3 cw = normalize(ta - ro);
    vec3 cu = normalize(cross(cw, vec3(0.0, 1.0, 0.0)));
    vec3 cv = normalize(cross(cu, cw));
    vec3 rd = normalize(uv.x * cu + uv.y * cv + 1.2 * cw);
    
    // --- Raymarching ---
    vec3 col = vec3(0.0);
    vec3 p = ro;
    vec3 dir = rd;
    
    float dt = 0.25;
    float absorption = 1.0;
    float hitBlackHole = 0.0;
    
    for (int i = 0; i < 60; i++) {
        float r2 = dot(p, p);
        if (r2 < 1.0) {
            // Hit the event horizon
            hitBlackHole = 1.0;
            break;
        }
        if (r2 > 150.0) {
            // Ray escaped
            break;
        }
        
        // Simulating highly intense gravitational lensing
        dir -= p * (0.15 / (r2 * sqrt(r2))) * dt;
        dir = normalize(dir);
        
        // Evaluate Accretion Disk Volume
        float r = length(p.xz);
        if (abs(p.y) < 0.6 && r > 1.5 && r < 6.5) {
            float den = diskDensity(p);
            if (den > 0.0) {
                // Determine emission color based on radius
                float t = (r - 1.5) / 5.0;
                vec3 emit = mix(vec3(1.0, 0.9, 0.6), vec3(0.8, 0.3, 0.0), pow(t, 0.7));
                emit = mix(vec3(1.0, 1.0, 1.0), emit, t * 0.5);
                
                // Emulate relativistic doppler beaming (bright approaching, dim receding)
                vec3 vel = normalize(vec3(-p.z, 0.0, p.x));
                float doppler = 1.0 + dot(dir, vel) * 0.8;
                doppler = pow(clamp(doppler, 0.1, 3.0), 3.0);
                
                emit *= doppler;
                col += emit * den * absorption * 0.3;
                
                // Track remaining light transmission
                absorption *= (1.0 - den * 0.1); 
            }
        }
        p += dir * dt;
    }
    
    // Post-processing
    col = col / (1.0 + col);
    col = pow(col, vec3(1.0/2.2));
    
    // Allow background stars to show efficiently
    float alpha = 1.0 - absorption;
    if (hitBlackHole > 0.5) {
        alpha = 1.0;
        col = vec3(0.0);
    }
    
    fragColor = vec4(col * 1.5, alpha); // Add a slight bloom multiplier
}

void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
}
`;

const BlackHole = () => {
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(1, 1) },
        mouse: { value: new THREE.Vector2(0, 0) }
    }), []);

    useFrame(({ clock, mouse, size }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.iTime.value = clock.getElapsedTime();
            materialRef.current.uniforms.iResolution.value.set(size.width, size.height);
            // Smoothly orbit based on mouse movement
            materialRef.current.uniforms.mouse.value.lerp(mouse, 0.05);
        }
    });

    return (
        <mesh>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
};

export default BlackHole;