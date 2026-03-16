'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Sparkles, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function AiCore() {
    const meshRef = useRef<THREE.Mesh>(null)

    // O Core vai seguir a posição do Mouse
    useFrame(({ mouse, clock }) => {
        if (!meshRef.current) return

        // Rotação Constante
        meshRef.current.rotation.y = clock.getElapsedTime() * 0.2
        meshRef.current.rotation.z = clock.getElapsedTime() * 0.1

        // Interação com o Mouse (Efeito Parallax suave)
        const targetX = (mouse.x * Math.PI) / 4
        const targetY = (mouse.y * Math.PI) / 4

        // Interpolação Linear para suavizar o movimento
        meshRef.current.rotation.x += (targetY - meshRef.current.rotation.x) * 0.05
        meshRef.current.rotation.y += (targetX - meshRef.current.rotation.y) * 0.05
    })

    return (
        <mesh ref={meshRef}>
            {/* Geometria Principal (Icosaedro para visual Cyber) */}
            <icosahedronGeometry args={[1.5, 2]} />
            {/* Material distorcido e brilhante (Wireframe) */}
            <MeshDistortMaterial
                color="#8B5CF6"
                wireframe={true}
                distort={0.4}
                speed={2}
                emissive="#3B82F6"
                emissiveIntensity={1.5}
            />

            {/* Núcleo Interno */}
            <Sphere args={[0.8, 32, 32]}>
                <meshBasicMaterial color="#10B981" transparent opacity={0.3} />
            </Sphere>

            {/* Partículas flutuantes ao redor como dados processando */}
            <Sparkles count={100} scale={4} size={2} speed={0.4} opacity={0.5} color="#00D9FF" />
        </mesh>
    )
}

export default function HolographicAI() {
    return (
        <div className="card-premium relative overflow-hidden h-[300px] flex flex-col group border-primary/20 hover:border-primary/40 transition-colors">
            <div className="absolute inset-0 bg-dark-card/90 backdrop-blur-3xl z-0" />

            {/* Ring background */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/5 rounded-full" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/[0.02] rounded-full border-dashed animate-[spin_30s_linear_infinite]" />

            {/* Header do Widget */}
            <div className="relative z-10 p-4 shrink-0 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white tracking-widest uppercase font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-purple">Nexus AI Core</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">SISTEMA COGNITIVO ONLINE</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green shadow-[0_0_8px_#10B981] animate-pulse"></span>
                        <span className="text-[9px] text-accent-green font-bold tracking-widest uppercase font-mono">Consciente</span>
                    </div>
                    <span className="text-[8px] text-gray-500 font-mono uppercase">Rastreando Movimento</span>
                </div>
            </div>

            {/* Viewport 3D */}
            <div className="relative z-10 flex-1 w-full h-full cursor-crosshair">
                <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#00D9FF" />
                    <AiCore />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={false} // Desativado para usar só o movimento do mouse do useFrame
                    />
                </Canvas>
            </div>

            {/* Scanline Effect */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/40 blur-[1px] animate-scan z-20 pointer-events-none" />
        </div>
    )
}
