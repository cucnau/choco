import React from 'react';

interface ReadingEffectsProps {
  effect?: 'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'ginkgo' | 'cherry_blossom' | 'firefly' | 'soap_bubble';
  isDarkTheme: boolean;
}

export const ReadingEffects: React.FC<ReadingEffectsProps> = ({ effect = 'none', isDarkTheme }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (effect === 'none' || !effect) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Track scroll position to shift particles with document scroll
    const getScrollPos = () => window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    let currentScrollY = getScrollPos();
    let lastScrollY = currentScrollY;

    const handleScroll = (e: Event) => {
      if (e.target && e.target !== document && e.target !== window) {
        const target = e.target as HTMLElement;
        if (target.scrollTop !== undefined && target.scrollTop > 0) {
          currentScrollY = target.scrollTop;
          return;
        }
      }
      currentScrollY = getScrollPos();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    // Particle system containers
    let particles: any[] = [];
    const maxParticles = 
      effect === 'rain' ? 75 : 
      effect === 'snow' ? 50 : 
      effect === 'star' ? 45 : 
      effect === 'leaf' ? 18 : 
      effect === 'ginkgo' ? 18 :
      effect === 'cherry_blossom' ? 20 : 
      effect === 'firefly' ? 28 : 
      effect === 'soap_bubble' ? 18 :
      0;

    class RainParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height - height;
      vy: number = 8 + Math.random() * 8;
      len: number = 14 + Math.random() * 18;
      opacity: number = 0.25 + Math.random() * 0.3;

      update() {
        this.y += this.vy;
        if (this.y > height) {
          this.y = -20;
          this.x = Math.random() * width;
          this.vy = 8 + Math.random() * 8;
        }
      }

      draw() {
        ctx.beginPath();
        if (isDarkTheme) {
          ctx.strokeStyle = `rgba(186, 230, 253, ${this.opacity})`; // Sky blue silver on dark
          ctx.lineWidth = 1.1;
        } else {
          ctx.strokeStyle = `rgba(15, 23, 42, ${this.opacity + 0.45})`; // Deep navy blue on light themes
          ctx.lineWidth = 1.6;
        }
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.len);
        ctx.stroke();
      }
    }

    class SnowParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height;
      r: number = 1.8 + Math.random() * 2.5;
      vy: number = 0.5 + Math.random() * 0.8;
      opacity: number = 0.3 + Math.random() * 0.4;
      swing: number = Math.random() * 100;

      update() {
        this.y += this.vy;
        this.x += Math.sin((this.y + this.swing) / 30) * 0.5;
        if (this.y > height) {
          this.y = -10;
          this.x = Math.random() * width;
        }
      }

      draw() {
        ctx.beginPath();
        if (isDarkTheme) {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
          ctx.fill();
        } else {
          // Sharp slate snowflake with subtle contrast outline on light background
          ctx.fillStyle = `rgba(30, 41, 59, ${this.opacity + 0.45})`;
          ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
          ctx.fill();
          ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    class StarParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height;
      r: number = 0.6 + Math.random() * 1.0;
      alpha: number = Math.random();
      speed: number = 0.003 + Math.random() * 0.008;
      isSparkle: boolean = Math.random() > 0.75;

      update() {
        this.alpha += this.speed;
        if (this.alpha > 0.95 || this.alpha < 0.05) {
          this.speed = -this.speed;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        const opacityVal = isDarkTheme 
          ? Math.max(0.15, this.alpha * 0.6) 
          : Math.max(0.25, this.alpha * 0.7);
          
        if (isDarkTheme) {
          ctx.fillStyle = `rgba(254, 240, 138, ${opacityVal})`; // Warm soft gold on dark
        } else {
          ctx.fillStyle = `rgba(180, 83, 9, ${opacityVal})`; // Rich amber bronze on light
        }
          
        if (this.isSparkle) {
          const size = this.r * 2.2;
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.quadraticCurveTo(0, 0, size, 0);
          ctx.quadraticCurveTo(0, 0, 0, size);
          ctx.quadraticCurveTo(0, 0, -size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -size);
          ctx.closePath();
          ctx.fill();
          if (!isDarkTheme) {
            ctx.strokeStyle = `rgba(254, 243, 199, 0.8)`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, this.r, 0, Math.PI * 2, true);
          ctx.fill();
        }
        
        ctx.restore();
      }
    }

    class LeafParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height - 30;
      r: number = 9 + Math.random() * 7; // Size of maple leaf
      angle: number = Math.random() * Math.PI * 2;
      rotationSpeed: number = (Math.random() - 0.5) * 0.012;
      vy: number = 0.25 + Math.random() * 0.35; // Rơi rất chậm rãi
      vx: number = -0.3 + Math.random() * 0.3;
      opacity: number = 0.18 + Math.random() * 0.2; // Mờ dịu mắt hơn

      update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.y / 40) * 0.5;
        this.angle += this.rotationSpeed;
        if (this.y > height + 25) {
          this.y = -25;
          this.x = Math.random() * width;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const r = this.r;
        // Drawing classic 5-lobed serrated maple leaf path:
        ctx.beginPath();
        // Central top tip
        ctx.moveTo(0, -r);
        // Right central lobe notches
        ctx.lineTo(r * 0.22, -r * 0.65);
        ctx.lineTo(r * 0.35, -r * 0.75);
        ctx.lineTo(r * 0.3, -r * 0.45);
        // Right upper lobe
        ctx.lineTo(r * 0.85, -r * 0.35);
        ctx.lineTo(r * 0.65, -r * 0.1);
        ctx.lineTo(r * 0.9, 0.1 * r);
        ctx.lineTo(r * 0.55, 0.25 * r);
        // Right lower lobe
        ctx.lineTo(r * 0.65, 0.55 * r);
        ctx.lineTo(r * 0.35, 0.5 * r);
        ctx.lineTo(r * 0.2, 0.65 * r);
        // Base notch
        ctx.lineTo(r * 0.1, 0.4 * r);
        ctx.lineTo(0, 0.45 * r);
        // Left lower lobe
        ctx.lineTo(-r * 0.1, 0.4 * r);
        ctx.lineTo(-r * 0.2, 0.65 * r);
        ctx.lineTo(-r * 0.35, 0.5 * r);
        ctx.lineTo(-r * 0.65, 0.55 * r);
        // Left upper lobe
        ctx.lineTo(-r * 0.55, 0.25 * r);
        ctx.lineTo(-r * 0.9, 0.1 * r);
        ctx.lineTo(-r * 0.65, -r * 0.1);
        ctx.lineTo(-r * 0.85, -r * 0.35);
        // Left central lobe notches
        ctx.lineTo(-r * 0.3, -r * 0.45);
        ctx.lineTo(-r * 0.35, -r * 0.75);
        ctx.lineTo(-r * 0.22, -r * 0.65);
        ctx.closePath();

        if (isDarkTheme) {
          ctx.fillStyle = `rgba(239, 68, 68, ${this.opacity})`; // Soft maple red on dark
        } else {
          ctx.fillStyle = `rgba(185, 28, 28, ${this.opacity + 0.12})`; // Soft crimson maple on light
        }
        ctx.fill();

        // Main leaf veins
        ctx.beginPath();
        ctx.strokeStyle = isDarkTheme 
          ? `rgba(254, 202, 202, ${this.opacity * 0.5})` 
          : `rgba(69, 10, 10, ${this.opacity * 0.6})`;
        ctx.lineWidth = 0.8;
        // Main stem
        ctx.moveTo(0, 0.45 * r);
        ctx.lineTo(0, r * 1.15);
        // Central vein
        ctx.moveTo(0, 0.45 * r);
        ctx.lineTo(0, -r * 0.8);
        // Side veins to main lobes
        ctx.moveTo(0, 0.2 * r);
        ctx.lineTo(r * 0.65, -r * 0.25);
        ctx.moveTo(0, 0.2 * r);
        ctx.lineTo(-r * 0.65, -r * 0.25);
        ctx.moveTo(0, 0.3 * r);
        ctx.lineTo(r * 0.45, 0.45 * r);
        ctx.moveTo(0, 0.3 * r);
        ctx.lineTo(-r * 0.45, 0.45 * r);
        ctx.stroke();

        ctx.restore();
      }
    }

    class GinkgoParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height - 30;
      r: number = 8 + Math.random() * 6;
      angle: number = Math.random() * Math.PI * 2;
      rotationSpeed: number = (Math.random() - 0.5) * 0.01;
      vy: number = 0.22 + Math.random() * 0.32; // Rơi rất chậm
      vx: number = -0.25 + Math.random() * 0.25;
      opacity: number = 0.18 + Math.random() * 0.22; // Mờ dịu mắt hơn
      swing: number = Math.random() * 100;

      update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin((this.y + this.swing) / 45) * 0.6;
        this.angle += this.rotationSpeed;
        if (this.y > height + 25) {
          this.y = -25;
          this.x = Math.random() * width;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const r = this.r;

        // Fan-shaped ginkgo leaf path
        ctx.beginPath();
        ctx.moveTo(0, r * 0.3);
        ctx.bezierCurveTo(-r * 0.5, r * 0.1, -r * 1.2, -r * 0.4, -r * 1.15, -r * 0.75);
        ctx.bezierCurveTo(-r * 0.6, -r * 1.1, -r * 0.2, -r * 0.85, 0, -r * 0.72); // Top middle notch
        ctx.bezierCurveTo(r * 0.2, -r * 0.85, r * 0.6, -r * 1.1, r * 1.15, -r * 0.75);
        ctx.bezierCurveTo(r * 1.2, -r * 0.4, r * 0.5, r * 0.1, 0, r * 0.3);
        ctx.closePath();

        if (isDarkTheme) {
          ctx.fillStyle = `rgba(250, 204, 21, ${this.opacity})`; // Soft golden ginkgo on dark
        } else {
          ctx.fillStyle = `rgba(217, 119, 6, ${this.opacity + 0.12})`; // Soft amber ginkgo on light
        }
        ctx.fill();

        // Radiating fan veins from base
        ctx.beginPath();
        ctx.strokeStyle = isDarkTheme 
          ? `rgba(254, 240, 138, ${this.opacity * 0.5})` 
          : `rgba(120, 53, 15, ${this.opacity * 0.6})`;
        ctx.lineWidth = 0.7;

        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(-r * 0.8, -r * 0.6);
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(-r * 0.4, -r * 0.7);
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(0, -r * 0.7);
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(r * 0.4, -r * 0.7);
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(r * 0.8, -r * 0.6);

        // Slender stem
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(0, r * 1.25);
        ctx.stroke();

        ctx.restore();
      }
    }

    class CherryBlossomParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height - 20;
      r: number = 5 + Math.random() * 5;
      angle: number = Math.random() * Math.PI * 2;
      rotationSpeed: number = (Math.random() - 0.5) * 0.03;
      vy: number = 0.5 + Math.random() * 0.7;
      vx: number = -0.3 + Math.random() * 0.3;
      opacity: number = 0.35 + Math.random() * 0.35;
      swingRange: number = 20 + Math.random() * 20;

      update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.y / this.swingRange) * 0.5;
        this.angle += this.rotationSpeed;
        if (this.y > height + 10) {
          this.y = -10;
          this.x = Math.random() * width;
          this.vy = 0.5 + Math.random() * 0.7;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(0, -this.r);
        ctx.bezierCurveTo(-this.r * 1.2, -this.r * 0.4, -this.r * 0.7, this.r * 0.7, 0, this.r);
        ctx.bezierCurveTo(this.r * 0.7, this.r * 0.7, this.r * 1.2, -this.r * 0.4, 0, -this.r);

        if (isDarkTheme) {
          ctx.fillStyle = `rgba(244, 143, 177, ${this.opacity})`;
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(219, 39, 119, ${this.opacity + 0.3})`; // Rich vivid sakura on light
          ctx.fill();
          ctx.strokeStyle = `rgba(131, 24, 67, 0.4)`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    class FireflyParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height;
      r: number = 0.8 + Math.random() * 1.2;
      
      angle: number = Math.random() * Math.PI * 2;
      baseSpeed: number = 0.08 + Math.random() * 0.12;
      
      timer: number = Math.floor(Math.random() * 300);
      flashDuration: number = 60 + Math.floor(Math.random() * 40);
      darkDuration: number = 120 + Math.floor(Math.random() * 180);
      alpha: number = 0;

      update() {
        this.angle += (Math.random() - 0.5) * 0.18;
        const speedSurge = 1.0 + this.alpha * 1.8;
        const currentSpeed = this.baseSpeed * speedSurge;
        
        this.x += Math.cos(this.angle) * currentSpeed;
        this.y += Math.sin(this.angle) * currentSpeed - 0.03 - (this.alpha * 0.15);

        this.timer++;
        const cycleLength = this.flashDuration + this.darkDuration;
        const currentCycleTime = this.timer % cycleLength;

        if (currentCycleTime < this.flashDuration) {
          const progress = currentCycleTime / this.flashDuration;
          const attackPhase = 0.22;
          
          if (progress < attackPhase) {
            this.alpha = Math.sin((progress / attackPhase) * Math.PI / 2);
          } else {
            const decayProgress = (progress - attackPhase) / (1 - attackPhase);
            this.alpha = Math.pow(1 - decayProgress, 2.2); 
          }
        } else {
          this.alpha = 0;
        }

        if (this.x < -30) this.x = width + 20;
        if (this.x > width + 30) this.x = -20;
        if (this.y < -30) this.y = height + 20;
        if (this.y > height + 30) {
          this.y = -20;
          this.x = Math.random() * width;
        }
      }

      draw() {
        if (this.alpha <= 0.01) return;

        ctx.save();
        
        if (isDarkTheme) {
          ctx.globalCompositeOperation = 'screen';
        }

        const pulseAlpha = this.alpha;
        const glowRadius = this.r * (3.5 + pulseAlpha * 7.0);

        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
        
        if (isDarkTheme) {
          grad.addColorStop(0, `rgba(254, 240, 138, ${pulseAlpha * 0.95})`);
          grad.addColorStop(0.2, `rgba(245, 158, 11, ${pulseAlpha * 0.65})`);
          grad.addColorStop(0.5, `rgba(217, 119, 6, ${pulseAlpha * 0.2})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          grad.addColorStop(0, `rgba(217, 119, 6, ${pulseAlpha * 0.9})`);
          grad.addColorStop(0.3, `rgba(180, 83, 9, ${pulseAlpha * 0.5})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        if (isDarkTheme) {
          ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.95})`;
        } else {
          ctx.fillStyle = `rgba(120, 53, 15, ${pulseAlpha * 0.9})`; // Dark amber core on light
        }
        ctx.arc(this.x, this.y, this.r * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    class SoapBubbleParticle {
      x: number = Math.random() * width;
      y: number = height + 20 + Math.random() * 100;
      r: number = 9 + Math.random() * 15;
      vx: number = (Math.random() - 0.5) * 0.3;
      vy: number = -(0.5 + Math.random() * 0.7);
      opacity: number = 0.4 + Math.random() * 0.35;
      wobbleSpeed: number = 0.01 + Math.random() * 0.02;
      wobble: number = Math.random() * Math.PI * 2;
      hueOffset: number = Math.random() * 360;

      update() {
        this.y += this.vy;
        this.wobble += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobble) * 0.25;

        if (this.y < -this.r * 2 || this.x < -this.r * 2 || this.x > width + this.r * 2) {
          this.y = height + 20 + Math.random() * 80;
          this.x = Math.random() * width;
          this.r = 9 + Math.random() * 15;
          this.vy = -(0.5 + Math.random() * 0.7);
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        const bubbleGrad = ctx.createRadialGradient(
          this.x - this.r * 0.15, 
          this.y - this.r * 0.15, 
          this.r * 0.5, 
          this.x, 
          this.y, 
          this.r
        );
        
        const hue1 = (this.hueOffset + this.y * 0.08) % 360;
        const hue2 = (hue1 + 120) % 360;
        const hue3 = (hue1 + 240) % 360;

        bubbleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        bubbleGrad.addColorStop(0.7, `hsla(${hue1}, 80%, 70%, 0.2)`);
        bubbleGrad.addColorStop(0.9, `hsla(${hue2}, 85%, 65%, 0.4)`);
        bubbleGrad.addColorStop(1, `hsla(${hue3}, 90%, 60%, 0.65)`);

        ctx.beginPath();
        ctx.fillStyle = bubbleGrad;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = isDarkTheme 
          ? `hsla(${hue1}, 80%, 70%, 0.6)` 
          : `rgba(30, 27, 75, 0.5)`;
        ctx.lineWidth = 1.0;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.arc(this.x - this.r * 0.35, this.y - this.r * 0.35, this.r * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      if (effect === 'rain') {
        particles.push(new RainParticle());
      } else if (effect === 'snow') {
        particles.push(new SnowParticle());
      } else if (effect === 'star') {
        particles.push(new StarParticle());
      } else if (effect === 'leaf') {
        particles.push(new LeafParticle());
      } else if (effect === 'ginkgo') {
        particles.push(new GinkgoParticle());
      } else if (effect === 'cherry_blossom') {
        particles.push(new CherryBlossomParticle());
      } else if (effect === 'firefly') {
        particles.push(new FireflyParticle());
      } else if (effect === 'soap_bubble') {
        particles.push(new SoapBubbleParticle());
      }
    }

    // Shooting star trigger state
    let shootingStar: { x: number; y: number; dx: number; dy: number; len: number; speed: number; opacity: number } | null = null;
    const triggerShootingStar = () => {
      shootingStar = {
        x: Math.random() * width * 0.8,
        y: 0,
        dx: 4 + Math.random() * 3,
        dy: 4 + Math.random() * 3,
        len: 40 + Math.random() * 50,
        speed: 9 + Math.random() * 7,
        opacity: 0.4 + Math.random() * 0.3,
      };
    };

    let glitchTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Scroll delta calculation for smooth continuous effect flow
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (scrollDelta !== 0 && effect !== 'glitch') {
        particles.forEach((p) => {
          p.y -= scrollDelta;
          if (p.y < -50) {
            p.y = height + Math.random() * 40;
            p.x = Math.random() * width;
          } else if (p.y > height + 50) {
            p.y = -40 - Math.random() * 40;
            p.x = Math.random() * width;
          }
        });

        if (shootingStar) {
          shootingStar.y -= scrollDelta;
        }
      }

      if (effect === 'glitch') {
        // CRT Scanlines
        ctx.beginPath();
        ctx.strokeStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
        ctx.lineWidth = 1;
        for (let y = 0; y < height; y += 6) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        glitchTimer++;
        if (glitchTimer % 150 === 0 || Math.random() < 0.01) {
          const numGlitches = 1 + Math.floor(Math.random() * 2);
          for (let i = 0; i < numGlitches; i++) {
            const sliceY = Math.random() * height;
            const sliceHeight = 4 + Math.random() * 12;
            const shift = (Math.random() - 0.5) * 10;

            ctx.fillStyle = isDarkTheme ? 'rgba(6, 182, 212, 0.25)' : 'rgba(8, 145, 178, 0.2)';
            ctx.fillRect(shift, sliceY, width, sliceHeight);

            ctx.fillStyle = isDarkTheme ? 'rgba(236, 72, 153, 0.25)' : 'rgba(219, 39, 119, 0.2)';
            ctx.fillRect(-shift, sliceY + 1, width, sliceHeight);
          }
        }

        if (Math.random() < 0.05) {
          ctx.fillStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)';
          const count = 1 + Math.floor(Math.random() * 2);
          for (let i = 0; i < count; i++) {
            ctx.fillRect(Math.random() * width, Math.random() * height, 12 + Math.random() * 35, 2);
          }
        }
      } else {
        // Render general particles
        particles.forEach((p) => {
          p.update();
          p.draw();
        });

        // Shooting Star
        if (effect === 'star') {
          if (!shootingStar && Math.random() < 0.01) {
            triggerShootingStar();
          }
          if (shootingStar) {
            shootingStar.x += shootingStar.dx;
            shootingStar.y += shootingStar.dy;
            
            ctx.beginPath();
            const grad = ctx.createLinearGradient(
              shootingStar.x, shootingStar.y, 
              shootingStar.x - shootingStar.len, shootingStar.y - shootingStar.len
            );
            grad.addColorStop(0, isDarkTheme ? `rgba(255, 220, 230, ${shootingStar.opacity})` : `rgba(180, 83, 9, ${shootingStar.opacity})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.8;
            ctx.moveTo(shootingStar.x, shootingStar.y);
            ctx.lineTo(shootingStar.x - shootingStar.len, shootingStar.y - shootingStar.len);
            ctx.stroke();

            if (shootingStar.y > height || shootingStar.x > width) {
              shootingStar = null;
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [effect, isDarkTheme]);

  if (effect === 'none' || !effect) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};
