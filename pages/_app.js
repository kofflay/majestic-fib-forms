import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // ========== CANVAS ==========
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);

    let width, height;
    const particles = [];
    const confetti = [];
    const mouse = { x: -100, y: -100, prevX: -100, prevY: -100 };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Частицы под курсором
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1;
        this.size = Math.random() * 4 + 2;
        this.hue = Math.random() * 60 + 200;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        this.vx *= 0.98; this.vy *= 0.98;
        this.life -= 0.02; this.size *= 0.995;
      }
      draw(ctx) {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.5);
        g.addColorStop(0, `hsla(${this.hue}, 100%, 65%, ${this.life})`);
        g.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }
    }

    // Золотое конфетти
    class Confetti {
      constructor() { this.reset(true); }
      reset(init) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : -20;
        this.size = Math.random() * 5 + 3;
        this.speedY = Math.random() * 1 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.rotation = Math.random() * 360;
        this.rotSpeed = (Math.random() - 0.5) * 2;
        this.opacity = Math.random() * 0.3 + 0.15;
        this.isGold = Math.random() < 0.4;
      }
      update() {
        this.y += this.speedY; this.x += this.speedX;
        this.rotation += this.rotSpeed;
        if (this.y > height + 40) this.reset(false);
      }
      draw(ctx) {
        ctx.save(); ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.isGold ? '#FFD700' : '#5865F2';
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        ctx.restore();
      }
    }

    // 60 конфетти
    for (let i = 0; i < 60; i++) confetti.push(new Confetti());

    document.addEventListener('mousemove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      for (let i = 0; i < 3; i++) particles.push(new Particle(mouse.x, mouse.y));
    });

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Конфетти
      confetti.forEach(c => { c.update(); c.draw(ctx); });

      // Частицы под курсором
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].life <= 0) particles.splice(i, 1);
      }

      // Свечение под курсором
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 25);
      g.addColorStop(0, 'rgba(88, 101, 242, 0.25)');
      g.addColorStop(1, 'rgba(88, 101, 242, 0)');
      ctx.fillStyle = g; ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 25, 0, Math.PI * 2); ctx.fill();

      requestAnimationFrame(animate);
    }
    animate();

    return () => canvas.remove();
  }, []);

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: #0a0a1a;
          color: white;
          cursor: none;
        }
        input, textarea, button { font-family: inherit; }
        a, button, input, textarea, select, [onclick], .card, .back-btn, .submit-btn, .logout-btn, .copy-btn {
          cursor: none;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
