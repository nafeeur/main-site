'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // ---------------------------------------
    // Custom Cursor & Sphere Parallax Script
    // ---------------------------------------
    let sphereScale = 1;
    let lastMouseX = window.innerWidth / 2;
    let lastMouseY = window.innerHeight / 2;
    let counter = 25;

    const sphere = document.getElementById('sphere');
    document.addEventListener('mousemove', (e) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      const xPercent = (e.clientX / window.innerWidth - 0.5) * 30;
      const yPercent = (e.clientY / window.innerHeight - 0.5) * 30;
      if (sphere) {
        sphere.style.transform = `scale(${sphereScale}) rotateX(${-yPercent}deg) rotateY(${xPercent}deg)`;
      }
    });

    const cursor = document.getElementById('customCursor');
    document.addEventListener('mousemove', (e) => {
      if (cursor) {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    });

    // ---------------------------------------
    // Subtle Wave Visualizer Script
    // ---------------------------------------
    const visualizer = document.getElementById('visualizer') as HTMLCanvasElement | null;
    const ctx = visualizer ? visualizer.getContext('2d') : null;

    function resizeVisualizer() {
      if (visualizer) {
        visualizer.width = window.innerWidth;
        visualizer.height = 150;
      }
    }
    window.addEventListener('resize', resizeVisualizer);
    resizeVisualizer();

    let time = 0;
    function animateWave() {
      if (!ctx || !visualizer) return;
      ctx.clearRect(0, 0, visualizer.width, visualizer.height);
      time += 0.02;
      ctx.beginPath();
      const amplitude = visualizer.height / 4;
      const frequency = 0.01;
      ctx.moveTo(0, visualizer.height / 2 + Math.sin(0 * frequency + time) * amplitude);
      for (let x = 0; x < visualizer.width; x++) {
        const y = visualizer.height / 2 + Math.sin(x * frequency + time) * amplitude;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(224, 106, 224, 0.15)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(224, 106, 224, 0.15)';
      ctx.shadowBlur = 5;
      ctx.stroke();
      requestAnimationFrame(animateWave);
    }
    animateWave();

    // ---------------------------------------
    // Simple Space Invaders Game Script
    // ---------------------------------------
    const gameCanvas = document.getElementById('spaceInvadersCanvas') as HTMLCanvasElement | null;
    const gCtx = gameCanvas ? gameCanvas.getContext('2d') : null;

    function resizeGameCanvas() {
      if (gameCanvas) {
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
      }
    }
    window.addEventListener('resize', resizeGameCanvas);
    resizeGameCanvas();

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
    }> = [];
    const enemySpeed = 2;
    const spawnInterval = 1500;

    let leftPressed = false;
    let rightPressed = false;
    let spacePressed = false;

    const shapeTypes = ['circle', 'square', 'triangle', 'diamond', 'star'];

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
      if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
      if (e.key === ' ') spacePressed = true;
    });
    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
      if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
      if (e.key === ' ') spacePressed = false;
    });

    // ---------------------------------------
    // Explosion Effects for Blasted Enemies
    // ---------------------------------------
    let explosions: any[] = [];

    function hexToRgb(hex: string) {
      hex = hex.replace(/^#/, '');
      let bigint = parseInt(hex, 16);
      let r = (bigint >> 16) & 255;
      let g = (bigint >> 8) & 255;
      let b = bigint & 255;
      return `${r}, ${g}, ${b}`;
    }

    function spawnExplosion(x: number, y: number, color: string) {
      const particleCount = 15;
      const particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1.0,
          size: Math.random() * 3 + 2,
          color: color,
        });
      }
      explosions.push({ particles });
    }

    function getEnemyColor(type: string) {
      switch (type) {
        case 'circle':
          return '#00ffe0';
        case 'square':
          return '#ff6fd8';
        case 'triangle':
          return '#7afcff';
        case 'diamond':
          return '#ffb3ff';
        case 'star':
          return '#89faff';
        default:
          return '#ffffff';
      }
    }
    function updateCounterDisplay() {
      const counterElement = document.getElementById('enemyCounter');
      if (counterElement) {
        counterElement.textContent = counter.toString();
      }
    }
    
    function updateExplosions() {
      for (let i = explosions.length - 1; i >= 0; i--) {
        let exp = explosions[i];
        exp.particles.forEach((p: any) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
        });
        if (exp.particles.every((p: any) => p.life <= 0)) {
          explosions.splice(i, 1);
        }
      }
    }

    function drawExplosions() {
      if (!gCtx) return;
      explosions.forEach(exp => {
        exp.particles.forEach((p: any) => {
          gCtx.beginPath();
          gCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          gCtx.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.life})`;
          gCtx.fill();
        });
      });
    }

    function spawnEnemy() {
      if (!gameCanvas) return;
      const x = Math.random() * (gameCanvas.width - 50) + 25;
      const y = -50;
      const size = 30 + Math.random() * 15;
      const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      // Record the time the enemy spawns and a random initial rotation
      const spawnTime = Date.now();
      const initialRotation = Math.random() * Math.PI * 2;
      enemies.push({ x, y, size, type, spawnTime, initialRotation });
    }
    
    
    function update() {
      if (!gameCanvas) return;
      // Move spaceship
      if (leftPressed) spaceshipX -= spaceshipSpeed;
      if (rightPressed) spaceshipX += spaceshipSpeed;
      if (spaceshipX < 0) spaceshipX = 0;
      if (spaceshipX + spaceshipWidth > gameCanvas.width) {
        spaceshipX = gameCanvas.width - spaceshipWidth;
      }
      // Fire bullet
      if (spacePressed) {
        bullets.push({ x: spaceshipX + spaceshipWidth / 2, y: spaceshipY });
        spacePressed = false;
      }
      // Update bullets
      bullets = bullets
        .map((b) => ({ x: b.x, y: b.y - bulletSpeed }))
        .filter((b) => b.y > 0);
      // Update enemies: Increase falling speed as the counter decreases.

      // Here, ((25 - counter) * 0.1) increases the fall speed as the counter goes down.
     enemies.forEach((enemy) => {
     enemy.y += enemySpeed + ((25 - counter) * 1);
     });
      enemies = enemies.filter((enemy) => enemy.y < gameCanvas.height + 50);
      updateExplosions();
      checkCollisions();
    }
    

    function checkCollisions() {
  // Bullets vs enemies
  bullets.forEach((bullet) => {
    enemies.forEach((enemy) => {
      const distX = bullet.x - enemy.x;
      const distY = bullet.y - enemy.y;
      const distance = Math.sqrt(distX * distX + distY * distY);
      if (distance < enemy.size) {
        enemy.hit = true;
        spawnExplosion(enemy.x, enemy.y, getEnemyColor(enemy.type));
        // Decrement the counter for each hit
        counter--;
        updateCounterDisplay();
        // Redirect when the counter reaches 0 or below
        if (counter <= 0) {
          window.location.href = "https://www.linkedin.com/in/nafeeur/";
        }
      }
    });
  });
  enemies = enemies.filter((enemy) => !enemy.hit);
      // Bullets vs sphere
      const sphereRect = sphere?.getBoundingClientRect();
      if (!sphereRect) return;
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
    }

    function drawSpaceship(x: number, y: number, w: number, h: number) {
      if (!gCtx) return;
      gCtx.save();
      gCtx.translate(x + w / 2, y + h / 5);
      gCtx.rotate(Math.sin(Date.now() / 100) * 0.05);
      // Draw spaceship (triangle)
      gCtx.fillStyle = '#00ffff';
      gCtx.beginPath();
      gCtx.moveTo(0, -h / 2);
      gCtx.lineTo(w / 2, h / 2);
      gCtx.lineTo(-w / 2, h / 2);
      gCtx.closePath();
      gCtx.fill();
      // Draw engine flame behind the spaceship
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
    }

    function drawShape(enemy) {
      if (!gCtx) return;
      gCtx.save();
      gCtx.translate(enemy.x, enemy.y);
      
      // Calculate how much time has elapsed since the enemy spawned
      const elapsed = Date.now() - enemy.spawnTime;

     // Increase spin speed as the counter decreases.
    // Here, for every point below 25, we increase the spin multiplier by 0.05.
   const spinMultiplier = 1 + ((25 - counter) * 0.5);
   const rotation = enemy.initialRotation + (elapsed / 10000) * 2 * Math.PI * spinMultiplier;
      
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
      }
      gCtx.restore();
    }
   
      

    function draw() {
      if (!gCtx || !gameCanvas) return;
      gCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
      drawSpaceship(spaceshipX, spaceshipY, spaceshipWidth, spaceshipHeight);
      
      // Draw bullets with a subtle glow and trailing effect
      bullets.forEach((b) => {
        gCtx.beginPath();
        gCtx.arc(b.x, b.y, 5, 0, 2 * Math.PI);
        gCtx.shadowBlur = 8;
        gCtx.shadowColor = '#00ffff';
        gCtx.fillStyle = '#00ffff';
        gCtx.fill();
        gCtx.shadowBlur = 0; // reset
      });
      
      enemies.forEach((enemy) => {
        drawShape(enemy);
      });
      
      
      drawExplosions();
    }

    function gameLoop() {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }

    setInterval(spawnEnemy, spawnInterval);
    requestAnimationFrame(gameLoop);
  }, []);

  return (
    <>
      <div className="background">
      <div className="nebula"></div>
        <div className="starfield"></div>
        <canvas id="spaceInvadersCanvas"></canvas>
        <div className="grid-top"></div>
        <div className="grid"></div>
        <div className="retro-border"></div>
        <div className="vapor-overlay"></div>
        <h1 className="neon" data-text="U">
          na<span className="flicker-slow">f</span>ee
          <span className="flicker-fast">u</span>r
        </h1>
        <h1 className="neon-jap" data-text="U">バットマン</h1>
        <div className="sphere-container">
     
          <div className="sphere" id="sphere"></div>
        </div>
        <div className="gif-container">
        {/* Add an anchor tag, linking to GitHub */}
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
        <canvas id="visualizer"></canvas>
      </div>
      <div className="custom-cursor" id="customCursor"></div>
      <div
  id="enemyCounter"
  style={{
    position: 'fixed',
    bottom: '5px',
    left: '40px',
    transform: 'translateX(-50%)',
    color: '#e06ae0',
    fontSize: '50px',
    fontFamily: 'Orbitron, sans-serif', // or 'VT323, monospace' for a different look
    textShadow: '1px 0px 4px #e06ae0',
    opacity: 0.7, // Adjust opacity for a subtle, translucent effect
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
}
