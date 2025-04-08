'use client';

import { useEffect, useRef } from 'react';

export default function Home() {
  // Create refs for DOM elements to reduce repetitive lookups
  const sphereRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // State variables
    let sphereScale = 1;
    let lastMouseX = window.innerWidth / 2;
    let lastMouseY = window.innerHeight / 2;
    let counter = 25;
    let animationFrameRequest: number | null = null;
    let isMouseMoving = false;
    let lastEvent: MouseEvent | null = null;
    let time = 0;

    // Cache DOM elements from refs
    const sphere = sphereRef.current;
    const cursor = cursorRef.current;
    const visualizer = visualizerRef.current;
    const gameCanvas = gameCanvasRef.current;
    const gCtx = gameCanvas ? gameCanvas.getContext('2d') : null;
    const ctx = visualizer ? visualizer.getContext('2d') : null;

    // Resize both canvases
    const resizeElements = () => {
      if (visualizer) {
        visualizer.width = window.innerWidth;
        visualizer.height = 150;
      }
      if (gameCanvas) {
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
      }
    };
    resizeElements();
    window.addEventListener('resize', resizeElements);

    // Throttled mousemove event with requestAnimationFrame
    const handleMouseMove = (e: MouseEvent) => {
      lastEvent = e;
      if (!isMouseMoving) {
        isMouseMoving = true;
        requestAnimationFrame(() => {
          if (lastEvent) {
            lastMouseX = lastEvent.clientX;
            lastMouseY = lastEvent.clientY;
            const xPercent = (lastMouseX / window.innerWidth - 0.5) * 30;
            const yPercent = (lastMouseY / window.innerHeight - 0.5) * 30;
            if (sphere) {
              sphere.style.transform = `scale(${sphereScale}) rotateX(${-yPercent}deg) rotateY(${xPercent}deg)`;
            }
            if (cursor) {
              // Using translate3d to enable hardware acceleration
              cursor.style.transform = `translate3d(${lastMouseX}px, ${lastMouseY}px, 0)`;
            }
          }
          isMouseMoving = false;
        });
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    // Key event handling for game controls
    let leftPressed = false;
    let rightPressed = false;
    let spacePressed = false;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
      if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
      if (e.key === ' ') spacePressed = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
      if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
      if (e.key === ' ') spacePressed = false;
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Game canvas and gameplay variables
    let spaceshipX = gameCanvas ? gameCanvas.width / 2 : 0;
    let spaceshipY = gameCanvas ? gameCanvas.height - 60 : 0;
    const spaceshipWidth = 40;
    const spaceshipHeight = 40;
    const spaceshipSpeed = 8;
    let bullets: { x: number; y: number }[] = [];
    const bulletSpeed = 10;
    let enemies: Array<{
      x: number;
      y: number;
      size: number;
      type: string;
      hit?: boolean;
      spawnTime?: number;
      initialRotation?: number;
    }> = [];
    const enemySpeed = 2;
    const spawnInterval = 1500;
    const shapeTypes = ['circle', 'square', 'triangle', 'diamond', 'star'];
    let explosions: any[] = [];

    // Spawn an enemy at regular intervals
    const enemyIntervalId = setInterval(() => {
      if (!gameCanvas) return;
      const x = Math.random() * (gameCanvas.width - 50) + 25;
      const y = -50;
      const size = 30 + Math.random() * 15;
      const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      enemies.push({
        x,
        y,
        size,
        type,
        spawnTime: Date.now(),
        initialRotation: Math.random() * Math.PI * 2
      });
    }, spawnInterval);

    // Helper functions for explosion effects
    const hexToRgb = (hex: string) => {
      hex = hex.replace(/^#/, '');
      let bigint = parseInt(hex, 16);
      let r = (bigint >> 16) & 255;
      let g = (bigint >> 8) & 255;
      let b = bigint & 255;
      return `${r}, ${g}, ${b}`;
    };
    const spawnExplosion = (x: number, y: number, color: string) => {
      const particleCount = 10;
      const particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1.0,
          size: Math.random() * 3 + 2,
          color,
        });
      }
      explosions.push({ particles });
    };
    const getEnemyColor = (type: string) => {
      switch (type) {
        case 'circle': return '#00ffe0';
        case 'square': return '#ff6fd8';
        case 'triangle': return '#7afcff';
        case 'diamond': return '#ffb3ff';
        case 'star': return '#89faff';
        default: return '#ffffff';
      }
    };

    // Collision detection function
    const checkCollisions = () => {
      // Check bullet collisions with enemies
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          const dx = bullet.x - enemy.x;
          const dy = bullet.y - enemy.y;
          if (Math.sqrt(dx * dx + dy * dy) < enemy.size) {
            enemy.hit = true;
            spawnExplosion(enemy.x, enemy.y, getEnemyColor(enemy.type));
            counter--;
            if (counter <= 0 && typeof window !== 'undefined') {
              window.location.href = 'https://www.linkedin.com/in/nafeeur/';
            }
          }
        }
      }
      enemies = enemies.filter(enemy => !enemy.hit);

      // Check bullet collisions with sphere
      if (!sphere) return;
      const sphereRect = sphere.getBoundingClientRect();
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (
          bullet.x >= sphereRect.left &&
          bullet.x <= sphereRect.right &&
          bullet.y >= sphereRect.top &&
          bullet.y <= sphereRect.bottom
        ) {
          bullets.splice(i, 1);
          sphereScale += 0.05;
          const xPercent = (lastMouseX / window.innerWidth - 0.5) * 30;
          const yPercent = (lastMouseY / window.innerHeight - 0.5) * 30;
          if (sphere) {
            sphere.style.transform = `scale(${sphereScale}) rotateX(${-yPercent}deg) rotateY(${xPercent}deg)`;
            sphere.classList.add('hit-animation');
            setTimeout(() => sphere.classList.remove('hit-animation'), 300);
          }
        }
      }
    };

    // Update explosions animation
    const updateExplosions = () => {
      for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        exp.particles.forEach((p: any) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
        });
        if (exp.particles.every((p: any) => p.life <= 0)) {
          explosions.splice(i, 1);
        }
      }
    };

    // Drawing functions for game elements
    const drawSpaceship = (x: number, y: number, w: number, h: number) => {
      if (!gCtx) return;
      gCtx.save();
      gCtx.translate(x + w / 2, y + h / 5);
      gCtx.rotate(Math.sin(Date.now() / 100) * 0.05);
      gCtx.fillStyle = '#00ffff';
      gCtx.beginPath();
      gCtx.moveTo(0, -h / 2);
      gCtx.lineTo(w / 2, h / 2);
      gCtx.lineTo(-w / 2, h / 2);
      gCtx.closePath();
      gCtx.fill();
      // Engine flame
      const flameGradient = gCtx.createRadialGradient(0, h / 2, 0, 0, h / 2, h / 2 + 20);
      flameGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
      flameGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      gCtx.fillStyle = flameGradient;
      gCtx.beginPath();
      gCtx.moveTo(-w / 4, h / 2);
      gCtx.lineTo(0, h / 2 + 20);
      gCtx.lineTo(w / 4, h / 2);
      gCtx.closePath();
      gCtx.fill();
      gCtx.restore();
    };

    const drawEnemy = (enemy: any) => {
      if (!gCtx) return;
      gCtx.save();
      gCtx.translate(enemy.x, enemy.y);
      // Calculate elapsed time for rotation effect
      const elapsed = Date.now() - (enemy.spawnTime || Date.now());
      const spinMultiplier = 1;
      const rotation = (enemy.initialRotation || 0) + (elapsed / 10000) * 2 * Math.PI * spinMultiplier;
      gCtx.rotate(rotation);
      switch (enemy.type) {
        case 'circle':
          gCtx.beginPath();
          gCtx.arc(0, 0, enemy.size, 0, 2 * Math.PI);
          gCtx.strokeStyle = '#00ffe0';
          gCtx.lineWidth = 2;
          gCtx.stroke();
          break;
        case 'square':
          gCtx.beginPath();
          gCtx.rect(-enemy.size / 2, -enemy.size / 2, enemy.size, enemy.size);
          gCtx.strokeStyle = '#ff6fd8';
          gCtx.lineWidth = 2;
          gCtx.stroke();
          break;
        case 'triangle':
          gCtx.beginPath();
          gCtx.moveTo(-enemy.size / 2, enemy.size / 2);
          gCtx.lineTo(enemy.size / 2, enemy.size / 2);
          gCtx.lineTo(0, -enemy.size / 2);
          gCtx.closePath();
          gCtx.fillStyle = '#7afcff';
          gCtx.fill();
          break;
        case 'diamond':
          gCtx.beginPath();
          gCtx.moveTo(0, -enemy.size / 2);
          gCtx.lineTo(enemy.size / 2, 0);
          gCtx.lineTo(0, enemy.size / 2);
          gCtx.lineTo(-enemy.size / 2, 0);
          gCtx.closePath();
          gCtx.strokeStyle = '#ffb3ff';
          gCtx.lineWidth = 2;
          gCtx.stroke();
          break;
        case 'star':
          gCtx.fillStyle = '#89faff';
          gCtx.beginPath();
          for (let i = 0; i < 5; i++) {
            gCtx.lineTo(0, -enemy.size);
            gCtx.translate(0, -enemy.size);
            gCtx.rotate((Math.PI * 2) / 5);
            gCtx.translate(0, enemy.size);
          }
          gCtx.closePath();
          gCtx.fill();
          break;
        default:
          break;
      }
      gCtx.restore();
    };

    const drawExplosions = () => {
      if (!gCtx) return;
      explosions.forEach(exp => {
        exp.particles.forEach((p: any) => {
          gCtx.beginPath();
          gCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          gCtx.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.life})`;
          gCtx.fill();
        });
      });
    };

    // Update game state and draw frame
    const update = () => {
      if (!gameCanvas) return;
      // Update spaceship position based on key press
      if (leftPressed) {
        spaceshipX = Math.max(0, spaceshipX - spaceshipSpeed);
      }
      if (rightPressed) {
        spaceshipX = Math.min(spaceshipX + spaceshipSpeed, gameCanvas.width - spaceshipWidth);
      }
      if (spacePressed) {
        bullets.push({ x: spaceshipX + spaceshipWidth / 2, y: spaceshipY });
        spacePressed = false;
      }
      // Update bullets positions
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y <= 0) {
          bullets.splice(i, 1);
        }
      }
      // Update enemy positions
      enemies.forEach(enemy => {
        enemy.y += enemySpeed;
      });
      enemies = enemies.filter(enemy => enemy.y < gameCanvas.height + 50);
      
      checkCollisions();
      updateExplosions();
    };

    const draw = () => {
      if (!gCtx || !gameCanvas) return;
      gCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
      drawSpaceship(spaceshipX, spaceshipY, spaceshipWidth, spaceshipHeight);
      
      // Draw bullets
      bullets.forEach(bullet => {
        gCtx.beginPath();
        gCtx.arc(bullet.x, bullet.y, 5, 0, 2 * Math.PI);
        gCtx.shadowBlur = 8;
        gCtx.shadowColor = '#00ffff';
        gCtx.fillStyle = '#00ffff';
        gCtx.fill();
        gCtx.shadowBlur = 0;
      });
      
      // Draw enemies and explosions
      enemies.forEach(enemy => drawEnemy(enemy));
      drawExplosions();
    };

    const gameLoop = () => {
      update();
      draw();

      // Draw wave visualizer by sampling every 2 pixels for performance
      if (ctx && visualizer) {
        ctx.clearRect(0, 0, visualizer.width, visualizer.height);
        time += 0.02;
        ctx.beginPath();
        const amplitude = visualizer.height / 4;
        const frequency = 0.01;
        ctx.moveTo(0, visualizer.height / 2 + Math.sin(0 * frequency + time) * amplitude);
        for (let x = 0; x < visualizer.width; x += 2) {
          const y = visualizer.height / 2 + Math.sin(x * frequency + time) * amplitude;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(224, 106, 224, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationFrameRequest = requestAnimationFrame(gameLoop);
    };
    animationFrameRequest = requestAnimationFrame(gameLoop);

    // Clean up all event listeners and intervals on component unmount
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', resizeElements);
      clearInterval(enemyIntervalId);
      if (animationFrameRequest) cancelAnimationFrame(animationFrameRequest);
    };
  }, []);

  return (
    <>
      <div className="background">
        <div className="nebula"></div>
        <div className="starfield"></div>
        <canvas id="spaceInvadersCanvas" ref={gameCanvasRef}></canvas>
        <div className="grid-top"></div>
        <div className="grid"></div>
        <div className="retro-border"></div>
        <div className="vapor-overlay"></div>
        <h1 className="neon" data-text="U">
          na<span className="flicker-slow">f</span>ee<span className="flicker-fast">u</span>r
        </h1>
        <h1 className="neon-jap" data-text="U">バットマン</h1>
        <div className="sphere-container">
          <div className="sphere" id="sphere" ref={sphereRef}></div>
        </div>
        <div className="gif-container">
          <a href="https://github.com/nafeeur" target="_blank" rel="noopener noreferrer">
            <img
              src="https://64.media.tumblr.com/20029c5c8b4300b183415cc39a771f22/ec3f1f9bd5c76bac-13/s500x750/bdfcd4fb56356963766fe8cc9fa56420bc7b1ac9.gif"
              alt="Cool GIF"
              className="cool-gif"
            />
          </a>
        </div>
        <div
          className="particle"
          style={{ top: '10%', left: '20%', animationDuration: '5s' }}
        ></div>
        <div
          className="particle"
          style={{ top: '50%', left: '60%', animationDuration: '3.5s' }}
        ></div>
        <div
          className="particle"
          style={{ top: '30%', left: '80%', animationDuration: '4.2s' }}
        ></div>
        <div
          className="particle"
          style={{ top: '70%', left: '25%', animationDuration: '4.8s' }}
        ></div>
        <div
          className="particle"
          style={{ top: '85%', left: '50%', animationDuration: '3.7s' }}
        ></div>
        <div className="scanline"></div>
        <canvas id="visualizer" ref={visualizerRef}></canvas>
      </div>
      <div className="custom-cursor" id="customCursor" ref={cursorRef}></div>
      <div
        id="enemyCounter"
        style={{
          position: 'fixed',
          bottom: '5px',
          left: '40px',
          transform: 'translateX(-50%)',
          color: '#e06ae0',
          fontSize: '50px',
          fontFamily: 'Orbitron, sans-serif',
          textShadow: '1px 0px 4px #e06ae0',
          opacity: 0.7,
          zIndex: -1,
        }}
      >
        25
      </div>
      <iframe
        width="0"
        height="0"
        src="https://www.youtube.com/embed/EaCUyNQWY2M?autoplay=1&loop=1&playlist=EaCUyNQWY2M&controls=0&showinfo=0"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        style={{ display: 'none' }}
      ></iframe>
    </>
  );
  