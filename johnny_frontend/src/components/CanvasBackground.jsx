import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const CanvasBackground = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        let scene, camera, renderer, composer;
        let backgroundParticles;
        const clock = new THREE.Clock();
        const mouse = new THREE.Vector2();
        let animationFrameId;

        const init = () => {
            // Scene Setup
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 20;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.toneMapping = THREE.ReinhardToneMapping;
            mountRef.current.appendChild(renderer.domElement);
            
            // Post-processing for Glow Effect
            const renderScene = new RenderPass(scene, camera);
            const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
            bloomPass.threshold = 0.01;
            bloomPass.strength = 1.0; 
            bloomPass.radius = 0.5;

            composer = new EffectComposer(renderer);
            composer.addPass(renderScene);
            composer.addPass(bloomPass);

            // Create Visual Elements
            createRings();
            createCentralSphere();
            createBackgroundParticles();

            // Event Listeners
            window.addEventListener('resize', onWindowResize, false);
            document.addEventListener('mousemove', onMouseMove, false);
        };

        const createRings = () => {
            const ringColor = 0x00ffff;
            for (let i = 1; i <= 8; i++) {
                const isTorus = Math.random() > 0.7;
                let geometry;
                if(isTorus) {
                    geometry = new THREE.TorusGeometry(i * 2.5, 0.015, 16, 100);
                } else {
                    geometry = new THREE.RingGeometry(i * 2.5, i * 2.5 + 0.02, 128);
                }
                
                const material = new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
                const ring = new THREE.Mesh(geometry, material);
                
                ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.1;
                ring.rotation.y = (Math.random() - 0.5) * 0.1;
                scene.add(ring);
            }
        };
        
        const createCentralSphere = () => {
            const geometry = new THREE.IcosahedronGeometry(3, 3);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.1 });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
        };

        const createBackgroundParticles = () => {
            const particlesCount = 5000;
            const posArray = new Float32Array(particlesCount * 3);

            for(let i = 0; i < particlesCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 100;
            }

            const particlesGeometry = new THREE.BufferGeometry();
            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.02,
                color: 0x00ffff,
                transparent: true,
                opacity: 0.5
            });

            backgroundParticles = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(backgroundParticles);
        };

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
        };

        const onMouseMove = (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const delta = clock.getDelta();
            
            scene.children.forEach(child => {
                if (child.geometry && (child.geometry.type === 'RingGeometry' || child.geometry.type === 'TorusGeometry')) {
                     child.rotation.z -= delta * 0.05 * (1 + (child.geometry.parameters.radius || child.geometry.parameters.innerRadius));
                }
            });

            if (backgroundParticles) {
                backgroundParticles.rotation.y -= delta * 0.02;
            }

            camera.position.x += (mouse.x * 5 - camera.position.x) * 0.05;
            camera.position.y += (mouse.y * 5 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
            
            composer.render();
        };

        init();
        animate();

        // Cleanup function
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', onWindowResize);
            document.removeEventListener('mousemove', onMouseMove);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            // You might want to dispose of scene objects here if memory becomes an issue
        };
    }, []);

    return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default CanvasBackground;
