import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FixedStars = ({ 
    radius = 100, 
    depth = 50, 
    count = 2000, 
    factor = 4, 
    saturation = 0, 
    fade = true, 
    speed = 0.5 
}) => {
    const ref = useRef();
    
    const [positions, sizes] = useMemo(() => {
        const tempPositions = new Float32Array(count * 3);
        const tempSizes = new Float32Array(count);
        
        // Simple LCG deterministic random number generator
        let seed = 12345;
        const rnd = () => {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            return seed / 0x7fffffff;
        };

        for (let i = 0; i < count; i++) {
            // Distribute uniformly in a sphere with depth
            const r = radius + (rnd() * 2 - 1) * depth;
            const theta = 2 * Math.PI * rnd();
            const phi = Math.acos(2 * rnd() - 1);
            
            tempPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            tempPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            tempPositions[i * 3 + 2] = r * Math.cos(phi);
            
            // Random-ish sizes for stars
            tempSizes[i] = (rnd() * 0.15 + 0.05) * factor;
        }
        return [tempPositions, tempSizes];
    }, [count, radius, depth, factor]);

    useFrame((state) => {
        if (ref.current) {
            // Constant rotation to match the "feel" if speed > 0
            ref.current.rotation.y = state.clock.getElapsedTime() * (speed / 20);
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial 
                size={0.15} // Unified size attenuated by factor in our data
                transparent 
                color="#ffffff" 
                sizeAttenuation 
                depthWrite={false} 
                opacity={0.8}
            />
        </points>
    );
};

export default FixedStars;
