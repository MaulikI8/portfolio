import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Dice3DProps {
  rolling: boolean;
  result?: number; // 1-6 from server
  onSettled?: (result: number) => void;
  size?: number;
}

// Target Euler angles for each face to sit upright (+Y facing camera)
// Target Euler angles for each face to sit upright facing camera
const FACE_ROTATIONS: Record<number, THREE.Euler> = {
  1: new THREE.Euler(Math.PI / 4, 0, 0),                       // Face 1 (Top +Y tilted to screen)
  6: new THREE.Euler(-Math.PI / 4, Math.PI, 0),                  // Face 6 (Bottom -Y tilted to screen)
  2: new THREE.Euler(-Math.PI / 12, 0, 0),                     // Face 2 (Front +Z facing screen)
  5: new THREE.Euler(-Math.PI / 12, Math.PI, 0),              // Face 5 (Back -Z facing screen)
  3: new THREE.Euler(-Math.PI / 12, -Math.PI / 2, 0),          // Face 3 (Right +X facing screen)
  4: new THREE.Euler(-Math.PI / 12, Math.PI / 2, 0),           // Face 4 (Left -X facing screen)
};

// Pip offsets for 3x3 face grid (range -0.45 to 0.45)
const PIP_RADIUS = 0.085;
const PIP_DIST = 0.42;

// Mapping of face number to pip grid positions [x, y]
const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-PIP_DIST, PIP_DIST], [PIP_DIST, -PIP_DIST]],
  3: [[-PIP_DIST, PIP_DIST], [0, 0], [PIP_DIST, -PIP_DIST]],
  4: [[-PIP_DIST, PIP_DIST], [PIP_DIST, PIP_DIST], [-PIP_DIST, -PIP_DIST], [PIP_DIST, -PIP_DIST]],
  5: [[-PIP_DIST, PIP_DIST], [PIP_DIST, PIP_DIST], [0, 0], [-PIP_DIST, -PIP_DIST], [PIP_DIST, -PIP_DIST]],
  6: [
    [-PIP_DIST, PIP_DIST], [PIP_DIST, PIP_DIST],
    [-PIP_DIST, 0], [PIP_DIST, 0],
    [-PIP_DIST, -PIP_DIST], [PIP_DIST, -PIP_DIST]
  ],
};

function DieMesh({ rolling, result, onSettled }: { rolling: boolean; result?: number; onSettled?: (val: number) => void }) {
  const meshRef = useRef<THREE.Group>(null);

  // Angular velocity state for tumbling phase
  const angularVelRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const bounceTimeRef = useRef<number>(0);
  const settledFiredRef = useRef<boolean>(false);
  const targetRotationRef = useRef<THREE.Euler | null>(null);

  // Initialize random tumble velocity when rolling starts
  useEffect(() => {
    if (rolling) {
      settledFiredRef.current = false;
      targetRotationRef.current = null;
      bounceTimeRef.current = 0;
      angularVelRef.current.set(
        (Math.random() * 6 + 4) * (Math.random() > 0.5 ? 1 : -1),
        (Math.random() * 6 + 4) * (Math.random() > 0.5 ? 1 : -1),
        (Math.random() * 6 + 4) * (Math.random() > 0.5 ? 1 : -1)
      );
    }
  }, [rolling]);

  // Set target rotation when result arrives
  useEffect(() => {
    if (result && FACE_ROTATIONS[result]) {
      targetRotationRef.current = FACE_ROTATIONS[result];
    }
  }, [result]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const group = meshRef.current;

    if (rolling && !targetRotationRef.current) {
      // Phase 1: Free tumbling & decaying bounce
      group.rotation.x += angularVelRef.current.x * delta;
      group.rotation.y += angularVelRef.current.y * delta;
      group.rotation.z += angularVelRef.current.z * delta;

      // Friction decay
      angularVelRef.current.multiplyScalar(Math.max(0, 1 - delta * 0.6));

      // Decaying Y-bounce
      bounceTimeRef.current += delta;
      const bounceDecay = Math.max(0, 1 - bounceTimeRef.current * 1.1);
      group.position.y = Math.abs(Math.sin(bounceTimeRef.current * 7)) * 0.6 * bounceDecay;
    } else if (targetRotationRef.current) {
      // Phase 2: Damping settle toward exact face rotation & Y=0
      const target = targetRotationRef.current;

      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, target.x, 7, delta);
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, target.y, 7, delta);
      group.rotation.z = THREE.MathUtils.damp(group.rotation.z, target.z, 7, delta);
      group.position.y = THREE.MathUtils.damp(group.position.y, 0, 8, delta);

      // Check if settled close to target angle
      const diffX = Math.abs(group.rotation.x - target.x);
      const diffY = Math.abs(group.rotation.y - target.y);
      const diffZ = Math.abs(group.rotation.z - target.z);

      if (diffX < 0.015 && diffY < 0.015 && diffZ < 0.015 && Math.abs(group.position.y) < 0.01) {
        // Lock to exact orientation
        group.rotation.copy(target);
        group.position.y = 0;

        if (!settledFiredRef.current && result && onSettled) {
          settledFiredRef.current = true;
          onSettled(result);
        }
      }
    }
  });

  // Reusable pip mesh geometry
  const pipGeo = useMemo(() => new THREE.CylinderGeometry(PIP_RADIUS, PIP_RADIUS, 0.02, 16), []);
  const pipMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2E2440', roughness: 0.4 }), []);

  return (
    <group ref={meshRef}>
      {/* Die Cube Base Geometry */}
      <RoundedBox args={[1.6, 1.6, 1.6]} radius={0.14} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#F6EFE4" roughness={0.35} metalness={0.05} />
      </RoundedBox>

      {/* Face 1 (Top +Y) */}
      <group position={[0, 0.801, 0]}>
        {PIP_LAYOUTS[1].map(([px, pz], i) => (
          <mesh key={i} geometry={pipGeo} material={pipMat} position={[px, 0, pz]} />
        ))}
      </group>

      {/* Face 6 (Bottom -Y) */}
      <group position={[0, -0.801, 0]} rotation={[Math.PI, 0, 0]}>
        {PIP_LAYOUTS[6].map(([px, pz], i) => (
          <mesh key={i} geometry={pipGeo} material={pipMat} position={[px, 0, pz]} />
        ))}
      </group>

      {/* Face 2 (Front +Z) */}
      <group position={[0, 0, 0.801]} rotation={[Math.PI / 2, 0, 0]}>
        {PIP_LAYOUTS[2].map(([px, py], i) => (
          <mesh key={i} geometry={pipGeo} material={pipMat} position={[px, 0, py]} />
        ))}
      </group>

      {/* Face 5 (Back -Z) */}
      <group position={[0, 0, -0.801]} rotation={[-Math.PI / 2, 0, 0]}>
        {PIP_LAYOUTS[5].map(([px, py], i) => (
          <mesh key={i} geometry={pipGeo} material={pipMat} position={[px, 0, py]} />
        ))}
      </group>

      {/* Face 3 (Right +X) */}
      <group position={[0.801, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        {PIP_LAYOUTS[3].map(([py, pz], i) => (
          <mesh key={i} geometry={pipGeo} material={pipMat} position={[py, 0, pz]} />
        ))}
      </group>

      {/* Face 4 (Left -X) */}
      <group position={[-0.801, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        {PIP_LAYOUTS[4].map(([py, pz], i) => (
          <mesh key={i} geometry={pipGeo} material={pipMat} position={[py, 0, pz]} />
        ))}
      </group>
    </group>
  );
}

export function Dice3D({ rolling, result, onSettled, size = 220 }: Dice3DProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Amber radial glow under the 3D die */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '75%',
          height: '45%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(232, 169, 76, 0.35) 0%, rgba(232, 169, 76, 0) 70%)',
          opacity: rolling ? 0.9 : 0.5,
          transition: 'opacity 300ms ease',
          pointerEvents: 'none',
        }}
      />

      {/* WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 1.8, 4.2], fov: 30 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[3, 6, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-3, 2, -2]} intensity={0.25} color="#E8A94C" />

        <ContactShadows position={[0, -0.85, 0]} opacity={0.35} blur={2.2} color="#2E2440" scale={5} />
        <Environment preset="apartment" />

        <DieMesh rolling={rolling} result={result} onSettled={onSettled} />
      </Canvas>
    </div>
  );
}
