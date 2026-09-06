import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface Props {
  gameState?: any;
  myRole: 'boyfriend' | 'girlfriend';
  isMyTurn: boolean;
  onMakeMove: (payload: any) => void;
}

export function OBUS3DUI({ onMakeMove }: Props) {
  // Game state variables
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes countdown
  const [strikes, setStrikes] = useState(0);
  const [isDefused, setIsDefused] = useState(false);
  const [isExploded, setIsExploded] = useState(false);

  // Module 1: Wires (Rose = 0, Blush = 1, Gold = 2, Charcoal = 3)
  const [wiresCut, setWiresCut] = useState<boolean[]>([false, false, false, false]);
  const [wireModuleDone, setWireModuleDone] = useState(false);

  // Module 2: Keypads (Order: Heart -> Star -> Spade -> Diamond)
  const [keypadPresses, setKeypadPresses] = useState<string[]>([]);
  const [keypadModuleDone, setKeypadModuleDone] = useState(false);

  // Role View Mode ('defuser' | 'expert')
  const [viewRole, setViewRole] = useState<'defuser' | 'expert'>('defuser');

  // Countdown timer effect
  useEffect(() => {
    if (isDefused || isExploded || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExploded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isDefused, isExploded, timeLeft]);

  // Handle Wire Snipping
  const handleCutWire = (index: number) => {
    if (wireModuleDone || isExploded || isDefused) return;
    const newWires = [...wiresCut];
    newWires[index] = true;
    setWiresCut(newWires);

    // Rule: Rose wire is present (index 0 is Rose), so correct wire to cut is index 1 (Blush)
    if (index === 1) {
      setWireModuleDone(true);
      checkDefusal(true, keypadModuleDone);
    } else {
      // Strike!
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      if (newStrikes >= 2) {
        setIsExploded(true);
      }
    }
  };

  // Handle Keypad Press
  const handlePressSymbol = (sym: string) => {
    if (keypadModuleDone || isExploded || isDefused) return;
    const newPresses = [...keypadPresses, sym];
    setKeypadPresses(newPresses);

    // Target sequence: ['Heart', 'Star', 'Spade', 'Diamond']
    const correctSeq = ['Heart', 'Star', 'Spade', 'Diamond'];
    const currentStep = newPresses.length - 1;

    if (sym === correctSeq[currentStep]) {
      if (newPresses.length === 4) {
        setKeypadModuleDone(true);
        checkDefusal(wireModuleDone, true);
      }
    } else {
      // Strike!
      setKeypadPresses([]);
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      if (newStrikes >= 2) {
        setIsExploded(true);
      }
    }
  };

  const checkDefusal = (wDone: boolean, kDone: boolean) => {
    if (wDone && kDone) {
      setIsDefused(true);
      onMakeMove({ type: 'defused' });
    }
  };

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div style={{ width: '100%', maxWidth: '850px', background: '#09070B', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(198,111,134,0.3)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', color: '#FFF5EF' }}>
      
      {/* Top Bar: View Role Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#FFF5EF', margin: 0 }}>
            OBUS — Bomb Defusal Co-op
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#F0BAC6', fontStyle: 'italic' }}>
            Keep talking... don't let it explode!
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: '#140A12', padding: '0.3rem', borderRadius: '99px', border: '1px solid rgba(198,111,134,0.2)' }}>
          <button
            onClick={() => setViewRole('defuser')}
            style={{
              background: viewRole === 'defuser' ? '#C66F86' : 'transparent',
              color: viewRole === 'defuser' ? '#FFF5EF' : '#F0BAC6',
              border: 'none',
              borderRadius: '99px',
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            I am the Defuser
          </button>
          <button
            onClick={() => setViewRole('expert')}
            style={{
              background: viewRole === 'expert' ? '#F8EAE4' : 'transparent',
              color: viewRole === 'expert' ? '#1E1018' : '#F0BAC6',
              border: 'none',
              borderRadius: '99px',
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            I am the Expert (Manual)
          </button>
        </div>
      </div>

      {/* DEFUSER VIEW (3D Bomb Stage + Interactive Modules) */}
      {viewRole === 'defuser' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 3D WebGL Canvas */}
          <div style={{ width: '100%', height: '320px', borderRadius: '20px', overflow: 'hidden', background: '#0D090F', position: 'relative' }}>
            <Canvas camera={{ position: [0, 5, 7], fov: 45 }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[8, 12, 8]} intensity={1.4} castShadow />

              {/* Metal Bomb Case */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[5.5, 2.2, 3.8]} />
                <meshStandardMaterial color="#21101B" roughness={0.3} metalness={0.5} />
              </mesh>

              {/* Digital LED Timer Plate */}
              <mesh position={[-1.5, 1.12, 0]}>
                <boxGeometry args={[2.0, 0.05, 1.2]} />
                <meshStandardMaterial color="#09070B" roughness={0.1} />
              </mesh>

              {/* Status Indicator LED */}
              <mesh position={[1.8, 1.12, 1.0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
                <meshStandardMaterial color={isDefused ? '#4CAF50' : isExploded ? '#F44336' : '#FF9800'} />
              </mesh>

              <OrbitControls maxPolarAngle={Math.PI / 2.2} minDistance={4} maxDistance={10} />
            </Canvas>

            {/* Floating Digital Timer Badge */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#000000', padding: '0.5rem 1.2rem', borderRadius: '12px', border: '2px solid #C66F86', color: isExploded ? '#F44336' : '#C66F86', fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '2px', boxShadow: '0 0 15px rgba(198,111,134,0.4)' }}>
              {isExploded ? 'BOOM!' : isDefused ? 'DEFUSED' : formattedTime}
            </div>

            {/* Strike LEDs Display */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(13,9,15,0.85)', padding: '0.5rem 1rem', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#F0BAC6', fontWeight: 600 }}>STRIKES:</span>
              <span style={{ color: strikes >= 1 ? '#F44336' : 'rgba(255,255,255,0.2)', fontSize: '1.2rem' }}>X</span>
              <span style={{ color: strikes >= 2 ? '#F44336' : 'rgba(255,255,255,0.2)', fontSize: '1.2rem' }}>X</span>
            </div>
          </div>

          {/* Interactive Defusal Control Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            {/* Module 1: Wire Cutting */}
            <div style={{ background: '#140A12', padding: '1.25rem', borderRadius: '18px', border: wireModuleDone ? '1px solid #4CAF50' : '1px solid rgba(198,111,134,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', margin: 0, color: '#FFF5EF' }}>Module 1: Wires</h4>
                <span style={{ fontSize: '0.75rem', color: wireModuleDone ? '#4CAF50' : '#F0BAC6' }}>
                  {wireModuleDone ? 'PASSED' : 'ACTIVE'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#A99FB0', marginBottom: '1rem' }}>
                Tell your partner the wires present, ask which color wire to cut!
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { name: 'Wire 1 (Rose)', color: '#C66F86' },
                  { name: 'Wire 2 (Blush)', color: '#F0BAC6' },
                  { name: 'Wire 3 (Gold)', color: '#E8A94C' },
                  { name: 'Wire 4 (Charcoal)', color: '#4A3B47' },
                ].map((w, idx) => (
                  <button
                    key={idx}
                    disabled={wiresCut[idx] || wireModuleDone || isExploded || isDefused}
                    onClick={() => handleCutWire(idx)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.6rem 1rem',
                      borderRadius: '10px',
                      background: wiresCut[idx] ? '#0D090F' : '#21101B',
                      border: `2px solid ${w.color}`,
                      color: wiresCut[idx] ? 'rgba(255,255,255,0.3)' : '#FFF5EF',
                      cursor: wiresCut[idx] ? 'not-allowed' : 'pointer',
                      opacity: wiresCut[idx] ? 0.5 : 1,
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{w.name}</span>
                    <span style={{ fontSize: '0.78rem' }}>{wiresCut[idx] ? 'SNIPPED' : 'CUT'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Module 2: Keypad Symbols */}
            <div style={{ background: '#140A12', padding: '1.25rem', borderRadius: '18px', border: keypadModuleDone ? '1px solid #4CAF50' : '1px solid rgba(198,111,134,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', margin: 0, color: '#FFF5EF' }}>Module 2: Keypad</h4>
                <span style={{ fontSize: '0.75rem', color: keypadModuleDone ? '#4CAF50' : '#F0BAC6' }}>
                  {keypadModuleDone ? 'PASSED' : 'ACTIVE'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#A99FB0', marginBottom: '1rem' }}>
                Describe symbols to your partner. Press in sequence according to the manual!
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {['Star', 'Spade', 'Heart', 'Diamond'].map((sym) => (
                  <button
                    key={sym}
                    disabled={keypadModuleDone || isExploded || isDefused}
                    onClick={() => handlePressSymbol(sym)}
                    style={{
                      height: '52px',
                      borderRadius: '12px',
                      background: '#21101B',
                      border: '1px solid rgba(198,111,134,0.4)',
                      color: '#FFF5EF',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EXPERT VIEW (Defusal Manual Rules) */}
      {viewRole === 'expert' && (
        <div style={{ background: '#F8EAE4', color: '#1E1018', borderRadius: '20px', padding: '2rem', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)', fontFamily: 'serif' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px stroke #C66F86', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#391724', margin: 0 }}>
              BOMB DEFUSAL MANUAL — EXPERT EDITION
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#86465C', fontStyle: 'italic', margin: '0.4rem 0 0 0' }}>
              Do not look at the bomb! Listen to the defuser's description and give commands.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Wire Rules */}
            <div style={{ background: '#FFF5EF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #C66F86' }}>
              <h4 style={{ color: '#391724', margin: '0 0 0.75rem 0', fontSize: '1.1rem' }}>
                Section 1: Wire Cutting Protocol
              </h4>
              <ol style={{ fontSize: '0.85rem', lineHeight: '1.6', margin: 0, paddingLeft: '1.2rem', color: '#391724' }}>
                <li>Look at the 4 wires on the bomb.</li>
                <li><strong>If a Rose wire is present:</strong> Cut the 2nd wire (Blush wire).</li>
                <li><strong>If NO Rose wire is present:</strong> Cut the last wire.</li>
              </ol>
            </div>

            {/* Keypad Rules */}
            <div style={{ background: '#FFF5EF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #C66F86' }}>
              <h4 style={{ color: '#391724', margin: '0 0 0.75rem 0', fontSize: '1.1rem' }}>
                Section 2: Keypad Symbol Order
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 0.5rem 0', color: '#391724' }}>
                Instruct the defuser to press the keypad symbols in this exact sequence:
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', background: '#391724', padding: '0.75rem', borderRadius: '10px', color: '#FFF5EF', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <span>1. Heart</span>
                <span>2. Star</span>
                <span>3. Spade</span>
                <span>4. Diamond</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
