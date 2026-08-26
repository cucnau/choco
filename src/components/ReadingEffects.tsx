import React from 'react';

interface ReadingEffectsProps {
  effect?: 'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'ginkgo' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'fireworks' | 'fire_sparks' | 'sci_fi_hud';
  effectColor?: string;
  isDarkTheme: boolean;
}

const hexToRgb = (hex?: string) => {
  let c = hex ? hex.replace('#', '').trim() : '00f0ff';
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length !== 6) c = '00f0ff';
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 0, g: 240, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

export const ReadingEffects: React.FC<ReadingEffectsProps> = ({ effect = 'none', effectColor = '#00f0ff', isDarkTheme }) => {
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

    window.addEventListener('resize', handleResize);

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
      effect === 'fire_sparks' ? 75 :
      effect === 'sci_fi_hud' ? 10 :
      effect === 'fireworks' ? 0 : // fireworks managed dynamically
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

    class FireSparkParticle {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      aspectRatio: number = 0;
      curvature: number = 0;
      vx: number = 0;
      vy: number = 0;
      baseAlpha: number = 1;
      alpha: number = 1;
      wobble: number = 0;
      wobbleSpeed: number = 0;
      wobbleAmp: number = 0;
      sparkType: 'crescent' | 'streak' | 'dot' = 'crescent';
      angle: number = 0;
      rotationSpeed: number = 0;
      coreColor: string = '';
      glowColor: string = '';
      edgeColor: string = '';
      flickerOffset: number = 0;

      constructor() {
        this.reset(true);
      }

      reset(isInitial = false) {
        this.x = Math.random() * width;
        this.y = isInitial ? Math.random() * height : height + 10 + Math.random() * 80;

        const randType = Math.random();
        if (randType < 0.60) {
          this.sparkType = 'crescent';
          this.size = 8 + Math.random() * 16; // Length of ember blade (8px - 24px)
          this.aspectRatio = 0.16 + Math.random() * 0.14; // Thickness ratio
          this.curvature = (Math.random() < 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.55);
        } else if (randType < 0.82) {
          this.sparkType = 'streak';
          this.size = 6 + Math.random() * 14;
          this.aspectRatio = 0.12 + Math.random() * 0.1;
          this.curvature = 0.15 + Math.random() * 0.25;
        } else {
          this.sparkType = 'dot';
          this.size = 1.2 + Math.random() * 2.8;
          this.aspectRatio = 1;
          this.curvature = 0;
        }

        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = -(0.7 + Math.random() * 1.5); // Floating upwards
        this.baseAlpha = 0.45 + Math.random() * 0.5;
        this.alpha = this.baseAlpha;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.015 + Math.random() * 0.035;
        this.wobbleAmp = 0.35 + Math.random() * 0.65;
        this.angle = (Math.random() - 0.5) * Math.PI * 0.8;
        this.rotationSpeed = (Math.random() - 0.5) * 0.025;
        this.flickerOffset = Math.random() * Math.PI * 2;

        // Vivid fiery palettes matching the reference image (yellow glowing core, golden mid, crimson orange edges)
        const palettes = [
          { core: '#fff8cc', glow: '#ffaa00', edge: '#ff3300' }, // Classic burning amber
          { core: '#ffffff', glow: '#ffc107', edge: '#ff5722' }, // White-hot ember
          { core: '#ffe57f', glow: '#ff9100', edge: '#dd2c00' }, // Crimson fire spark
          { core: '#fffde7', glow: '#ffd54f', edge: '#ff6d00' }, // Golden fire spark
        ];
        const p = palettes[Math.floor(Math.random() * palettes.length)];
        this.coreColor = p.core;
        this.glowColor = p.glow;
        this.edgeColor = p.edge;
      }

      update() {
        this.y += this.vy;
        this.wobble += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobble) * this.wobbleAmp;
        this.angle += this.rotationSpeed;

        const flicker = Math.sin(this.wobble * 3 + this.flickerOffset) * 0.18;
        const topFade = Math.min(1, Math.max(0, (this.y - 15) / (height * 0.18)));
        const bottomFade = Math.min(1, Math.max(0, (height + 25 - this.y) / 45));

        this.alpha = Math.max(0, Math.min(1, (this.baseAlpha + flicker) * topFade * bottomFade));

        if (this.y < -30 || this.alpha <= 0.01) {
          this.reset(false);
        }
      }

      draw() {
        if (this.alpha <= 0.02) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.globalAlpha = this.alpha;

        if (this.sparkType === 'crescent' || this.sparkType === 'streak') {
          const len = this.size;
          const thick = len * this.aspectRatio;
          const curve = len * 0.35 * this.curvature;

          // Drawing slender crescent curved ember tapering at both ends (exact match to image)
          ctx.beginPath();
          ctx.moveTo(0, -len / 2);
          ctx.quadraticCurveTo(curve + thick * 2, 0, 0, len / 2);
          ctx.quadraticCurveTo(curve, 0, 0, -len / 2);
          ctx.closePath();

          const grad = ctx.createLinearGradient(-thick, 0, thick + Math.abs(curve), 0);
          grad.addColorStop(0, this.edgeColor);
          grad.addColorStop(0.35, this.glowColor);
          grad.addColorStop(0.7, this.coreColor);
          grad.addColorStop(1, this.edgeColor);

          ctx.fillStyle = grad;
          ctx.fill();

          if (len > 9) {
            ctx.shadowColor = this.glowColor;
            ctx.shadowBlur = isDarkTheme ? 8 : 4;
            ctx.fillStyle = this.coreColor;
            ctx.fill();
          }
        } else {
          // Tiny glowing ember dot
          const r = this.size;
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.5);
          grad.addColorStop(0, this.coreColor);
          grad.addColorStop(0.4, this.glowColor);
          grad.addColorStop(1, 'rgba(255, 60, 0, 0)');

          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(0, 0, r * 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = '#ffffff';
          ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Golden Radial Starburst Firework Classes (Matching golden radial fireworks image)
    class GoldenFireworkRay {
      x: number;
      y: number;
      vx: number;
      vy: number;
      trail: { x: number; y: number }[] = [];
      maxTrailLength: number;
      alpha: number = 1;
      decay: number;
      gravity: number = 0.025;
      drag: number = 0.968;
      color: string;
      sparkleSize: number;
      twinklePhase: number;

      constructor(x: number, y: number, angle: number, speed: number) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.maxTrailLength = 10 + Math.floor(Math.random() * 8);
        this.decay = 0.007 + Math.random() * 0.01;
        this.sparkleSize = 1.0 + Math.random() * 2.2;
        this.twinklePhase = Math.random() * Math.PI * 2;

        const colors = [
          'rgba(255, 255, 235', // White-hot gold center
          'rgba(255, 225, 135', // Bright golden champagne
          'rgba(255, 195, 80',  // Warm gold
          'rgba(255, 165, 40',  // Amber gold
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
          this.trail.shift();
        }

        this.vx *= this.drag;
        this.vy *= this.drag;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        this.twinklePhase += 0.25;
      }

      draw() {
        if (this.alpha <= 0 || this.trail.length === 0) return;
        ctx.save();

        // Glow
        ctx.shadowColor = 'rgba(255, 205, 100, 0.9)';
        ctx.shadowBlur = 6;

        // Draw radial trail line
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.lineTo(this.x, this.y);

        ctx.strokeStyle = `${this.color}, ${Math.max(0, this.alpha * 0.85)})`;
        ctx.lineWidth = Math.max(0.6, 1.4 * this.alpha);
        ctx.stroke();

        // Draw glowing golden tip/sparkle
        const twinkleAlpha = Math.max(0, this.alpha * (0.6 + Math.sin(this.twinklePhase) * 0.4));
        ctx.fillStyle = `rgba(255, 255, 240, ${twinkleAlpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.sparkleSize * (0.5 + this.alpha * 0.5), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    class GoldenGlitterDot {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      decay: number;
      size: number;
      twinkleSpeed: number;
      twinkleVal: number;

      constructor(x: number, y: number) {
        this.x = x + (Math.random() - 0.5) * 12;
        this.y = y + (Math.random() - 0.5) * 12;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = 0.1 + Math.random() * 0.4;
        this.alpha = 0.8 + Math.random() * 0.2;
        this.decay = 0.006 + Math.random() * 0.012;
        this.size = 0.8 + Math.random() * 1.8;
        this.twinkleSpeed = 0.15 + Math.random() * 0.25;
        this.twinkleVal = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        this.twinkleVal += this.twinkleSpeed;
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        const curAlpha = Math.max(0, this.alpha * (0.4 + Math.sin(this.twinkleVal) * 0.6));
        ctx.fillStyle = `rgba(255, 235, 170, ${curAlpha})`;
        ctx.shadowColor = 'rgba(255, 215, 110, 0.9)';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class GoldenFireworkCore {
      x: number;
      y: number;
      radius: number = 0;
      maxRadius: number;
      alpha: number = 1;
      decay: number = 0.045;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.maxRadius = 35 + Math.random() * 25;
      }

      update() {
        if (this.radius < this.maxRadius) {
          this.radius += (this.maxRadius - this.radius) * 0.25;
        }
        this.alpha -= this.decay;
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, Math.max(1, this.radius)
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.alpha * 0.95})`);
        grad.addColorStop(0.25, `rgba(255, 235, 170, ${this.alpha * 0.8})`);
        grad.addColorStop(0.55, `rgba(255, 195, 90, ${this.alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(255, 160, 40, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(1, this.radius), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.shadowColor = 'rgba(255, 230, 150, 1)';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3.5 + this.alpha * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    class GoldenFireworkRocket {
      x: number;
      y: number;
      targetY: number;
      vy: number;
      exploded: boolean = false;
      sparkTrail: { x: number; y: number; alpha: number }[] = [];

      constructor() {
        this.x = 80 + Math.random() * (width - 160);
        this.y = height + 10;
        this.targetY = 60 + Math.random() * (height * 0.45);
        this.vy = -(6 + Math.random() * 3.5);
      }

      update(spawnBurst: (x: number, y: number) => void) {
        this.sparkTrail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.sparkTrail.length > 10) this.sparkTrail.shift();
        this.sparkTrail.forEach((t) => (t.alpha -= 0.1));

        this.y += this.vy;

        if (this.vy < 0 && this.y <= this.targetY) {
          this.exploded = true;
          spawnBurst(this.x, this.y);
        }
      }

      draw() {
        if (this.exploded) return;
        ctx.save();
        ctx.shadowColor = 'rgba(255, 220, 130, 1)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(255, 255, 240, 1)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        this.sparkTrail.forEach((t) => {
          if (t.alpha > 0) {
            ctx.fillStyle = `rgba(255, 200, 100, ${t.alpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(t.x + (Math.random() - 0.5) * 2, t.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        ctx.restore();
      }
    }

    class SciFiHudParticle {
      x: number;
      y: number;
      radius: number;
      scale: number;
      type: number;
      rotation: number;
      rotSpeed: number;
      innerRot: number;
      innerRotSpeed: number;
      alpha: number = 0;
      maxAlpha: number;
      state: 'fade_in' | 'active' | 'fade_out' = 'fade_in';
      fadeInSpeed: number;
      fadeOutSpeed: number;
      activeTimer: number;
      pulseTimer: number;

      constructor(isInitial: boolean = false) {
        this.x = 80 + Math.random() * (width - 160);
        this.y = 80 + Math.random() * (height - 160);
        this.radius = 45 + Math.random() * 55;
        this.scale = 0.6 + Math.random() * 0.7;
        this.type = Math.floor(Math.random() * 6);
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.012;
        if (Math.abs(this.rotSpeed) < 0.003) this.rotSpeed = 0.004;
        this.innerRot = Math.random() * Math.PI * 2;
        this.innerRotSpeed = -this.rotSpeed * 1.5;

        this.maxAlpha = 0.45 + Math.random() * 0.45;
        this.fadeInSpeed = 0.008 + Math.random() * 0.012;
        this.fadeOutSpeed = 0.005 + Math.random() * 0.01;
        this.activeTimer = 140 + Math.floor(Math.random() * 200);
        this.pulseTimer = Math.random() * Math.PI * 2;

        if (isInitial && Math.random() < 0.5) {
          this.state = 'active';
          this.alpha = this.maxAlpha * (0.3 + Math.random() * 0.7);
        }
      }

      reset() {
        this.x = 80 + Math.random() * (width - 160);
        this.y = 80 + Math.random() * (height - 160);
        this.radius = 45 + Math.random() * 55;
        this.scale = 0.6 + Math.random() * 0.7;
        this.type = Math.floor(Math.random() * 6);
        this.rotation = Math.random() * Math.PI * 2;
        this.alpha = 0;
        this.state = 'fade_in';
        this.maxAlpha = 0.45 + Math.random() * 0.45;
        this.activeTimer = 140 + Math.floor(Math.random() * 200);
      }

      update() {
        this.rotation += this.rotSpeed;
        this.innerRot += this.innerRotSpeed;
        this.pulseTimer += 0.03;

        if (this.state === 'fade_in') {
          this.alpha += this.fadeInSpeed;
          if (this.alpha >= this.maxAlpha) {
            this.alpha = this.maxAlpha;
            this.state = 'active';
          }
        } else if (this.state === 'active') {
          this.activeTimer--;
          if (this.activeTimer <= 0) {
            this.state = 'fade_out';
          }
        } else if (this.state === 'fade_out') {
          this.alpha -= this.fadeOutSpeed;
          if (this.alpha <= 0) {
            this.alpha = 0;
            this.reset();
          }
        }
      }

      draw(c: CanvasRenderingContext2D, rgb: { r: number; g: number; b: number }) {
        if (this.alpha <= 0) return;

        const currentAlpha = Math.max(0, Math.min(1, this.alpha * (0.85 + Math.sin(this.pulseTimer) * 0.15)));
        const colorStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentAlpha})`;
        const glowStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentAlpha * 0.75})`;
        const dimColorStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentAlpha * 0.35})`;

        c.save();
        c.translate(this.x, this.y);
        c.scale(this.scale, this.scale);

        c.shadowColor = glowStr;
        c.shadowBlur = 8;
        c.strokeStyle = colorStr;
        c.fillStyle = colorStr;
        c.lineWidth = 1.2;

        const r = this.radius;

        if (this.type === 0) {
          // Type 0: Radial Rays HUD (Top Left)
          c.beginPath();
          c.arc(0, 0, r, 0, Math.PI * 2);
          c.stroke();

          const rays = 12;
          for (let i = 0; i < rays; i++) {
            const angle = (Math.PI * 2 * i) / rays + this.rotation;
            const len = (i % 3 === 0) ? 35 : (i % 2 === 0 ? 22 : 12);
            c.beginPath();
            c.moveTo(Math.cos(angle) * (r + 4), Math.sin(angle) * (r + 4));
            c.lineTo(Math.cos(angle) * (r + 4 + len), Math.sin(angle) * (r + 4 + len));
            c.stroke();
          }

          c.save();
          c.rotate(this.rotation);
          c.lineWidth = 2.5;
          for (let i = 0; i < 3; i++) {
            c.beginPath();
            c.arc(0, 0, r * 0.72, (i * Math.PI * 2) / 3, (i * Math.PI * 2) / 3 + 1.2);
            c.stroke();
          }
          c.restore();

          c.save();
          c.rotate(this.innerRot);
          c.strokeStyle = dimColorStr;
          c.lineWidth = 1;
          c.setLineDash([3, 4]);
          c.beginPath();
          c.arc(0, 0, r * 0.48, 0, Math.PI * 2);
          c.stroke();
          c.restore();

          c.beginPath();
          c.arc(0, 0, 4, 0, Math.PI * 2);
          c.fill();

        } else if (this.type === 1) {
          // Type 1: Concentric Slash Ticks (Top Middle)
          const slashCount = 36;
          c.save();
          c.rotate(this.rotation * 0.5);
          for (let i = 0; i < slashCount; i++) {
            if (i % 6 === 0) continue;
            const angle = (Math.PI * 2 * i) / slashCount;
            const x1 = Math.cos(angle) * r;
            const y1 = Math.sin(angle) * r;
            const x2 = Math.cos(angle + 0.08) * (r + 8);
            const y2 = Math.sin(angle + 0.08) * (r + 8);
            c.beginPath();
            c.moveTo(x1, y1);
            c.lineTo(x2, y2);
            c.stroke();
          }
          c.restore();

          c.beginPath();
          c.arc(0, 0, r * 0.85, 0, Math.PI * 2);
          c.stroke();

          c.beginPath();
          c.arc(0, 0, r * 0.6, 0, Math.PI * 2);
          c.stroke();

          c.save();
          c.rotate(this.rotation);
          c.lineWidth = 4;
          c.beginPath();
          c.arc(0, 0, r * 0.42, 0, Math.PI * 0.7);
          c.stroke();
          c.beginPath();
          c.arc(0, 0, r * 0.42, Math.PI * 1.1, Math.PI * 1.8);
          c.stroke();
          c.restore();

          c.beginPath();
          c.arc(0, 0, 5, 0, Math.PI * 2);
          c.fill();

        } else if (this.type === 2) {
          // Type 2: 3-Sector Target HUD (Top Right)
          c.save();
          c.strokeStyle = dimColorStr;
          c.lineWidth = 0.9;
          for (let i = 0; i < 60; i++) {
            const angle = (Math.PI * 2 * i) / 60;
            const tLen = (i % 5 === 0) ? 9 : 4;
            c.beginPath();
            c.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            c.lineTo(Math.cos(angle) * (r - tLen), Math.sin(angle) * (r - tLen));
            c.stroke();
          }
          c.restore();

          c.beginPath();
          c.arc(0, 0, r + 4, 0, Math.PI * 2);
          c.stroke();

          c.save();
          c.rotate(this.rotation);
          c.lineWidth = 6;
          for (let i = 0; i < 3; i++) {
            const startA = (i * Math.PI * 2) / 3;
            c.beginPath();
            c.arc(0, 0, r * 0.55, startA, startA + 0.6);
            c.stroke();
          }
          c.restore();

          c.beginPath();
          c.arc(0, 0, r * 0.25, 0, Math.PI * 2);
          c.stroke();
          c.beginPath();
          c.arc(0, 0, 3, 0, Math.PI * 2);
          c.fill();

        } else if (this.type === 3) {
          // Type 3: Framed Bracket HUD (Bottom Left)
          c.beginPath();
          c.arc(0, 0, r, 0, Math.PI * 2);
          c.stroke();

          const frameDist = r + 10;
          const bracketSize = 14;
          c.lineWidth = 1.8;
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
            const cx = sx * (frameDist * 0.7);
            const cy = sy * (frameDist * 0.7);
            c.beginPath();
            c.moveTo(cx, cy - sy * bracketSize);
            c.lineTo(cx, cy);
            c.lineTo(cx - sx * bracketSize, cy);
            c.stroke();
          });

          c.save();
          c.rotate(this.rotation);
          c.setLineDash([6, 6]);
          c.beginPath();
          c.arc(0, 0, r * 0.75, 0, Math.PI * 2);
          c.stroke();
          c.restore();

          c.setLineDash([]);
          c.beginPath();
          c.arc(0, 0, r * 0.45, 0, Math.PI * 2);
          c.stroke();

        } else if (this.type === 4) {
          // Type 4: Sci-Fi Circuit Board Diagram (Bottom Right)
          const lines = [
            [[-r, -r * 0.8], [-r * 0.3, -r * 0.8], [0, -r * 0.5], [0, r * 0.6], [r * 0.5, r * 0.6]],
            [[-r, -r * 0.4], [-r * 0.5, -r * 0.4], [-r * 0.2, -r * 0.1], [r * 0.4, -r * 0.1], [r * 0.7, r * 0.2]],
            [[-r, 0], [-r * 0.6, 0], [-r * 0.1, r * 0.4], [r * 0.6, r * 0.4]],
            [[-r, r * 0.4], [-r * 0.4, r * 0.4], [r * 0.2, r * 0.8]],
            [[r * 0.2, -r * 0.8], [r * 0.5, -r * 0.5], [r * 0.5, 0]],
          ];

          lines.forEach((pts, lIdx) => {
            c.beginPath();
            c.moveTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < pts.length; i++) {
              c.lineTo(pts[i][0], pts[i][1]);
            }
            c.lineWidth = lIdx === 1 ? 2.5 : 1.2;
            c.stroke();

            const endP = pts[pts.length - 1];
            c.beginPath();
            c.arc(endP[0], endP[1], lIdx === 1 ? 4 : 2.8, 0, Math.PI * 2);
            c.fill();

            const startP = pts[0];
            c.beginPath();
            c.arc(startP[0], startP[1], 2.5, 0, Math.PI * 2);
            c.fill();
          });

        } else {
          // Type 5: HUD Signal Line with Node (Bottom Left callout)
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(-r * 1.4, -r * 0.3);
          c.lineTo(-r * 0.6, -r * 0.3);
          c.lineTo(-r * 0.3, 0);
          c.lineTo(r * 1.2, 0);
          c.stroke();

          c.beginPath();
          c.arc(-r * 1.4, -r * 0.3, 3.5, 0, Math.PI * 2);
          c.stroke();

          c.beginPath();
          c.arc(r * 1.2, 0, 3.5, 0, Math.PI * 2);
          c.fill();

          c.save();
          c.rotate(this.rotation);
          c.lineWidth = 1.8;
          c.setLineDash([4, 4]);
          c.beginPath();
          c.arc(0, 0, r * 0.5, 0, Math.PI * 2);
          c.stroke();
          c.restore();
        }

        c.restore();
      }
    }

    let fireworkRockets: GoldenFireworkRocket[] = [];
    let fireworkRays: GoldenFireworkRay[] = [];
    let fireworkGlitter: GoldenGlitterDot[] = [];
    let fireworkCores: GoldenFireworkCore[] = [];
    let fireworkLaunchTimer = 0;

    const spawnGoldenStarburst = (cx: number, cy: number) => {
      fireworkCores.push(new GoldenFireworkCore(cx, cy));

      // 100 - 130 radial rays shooting 360 degrees out
      const numRays = 110 + Math.floor(Math.random() * 30);
      for (let i = 0; i < numRays; i++) {
        const angle = (Math.PI * 2 * i) / numRays + (Math.random() - 0.5) * 0.08;
        const speed = 1.6 + Math.random() * 4.2;
        fireworkRays.push(new GoldenFireworkRay(cx, cy, angle, speed));
      }

      const numGlitter = 50 + Math.floor(Math.random() * 30);
      for (let i = 0; i < numGlitter; i++) {
        fireworkGlitter.push(new GoldenGlitterDot(cx, cy));
      }
    };

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
      } else if (effect === 'fire_sparks') {
        particles.push(new FireSparkParticle());
      } else if (effect === 'sci_fi_hud') {
        particles.push(new SciFiHudParticle(true));
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
        if (effect === 'fireworks') {
          fireworkLaunchTimer++;
          // Launch rockets regularly or when screen is quiet
          if (
            fireworkLaunchTimer % 80 === 0 ||
            (fireworkRockets.length === 0 &&
              fireworkRays.length === 0 &&
              fireworkCores.length === 0 &&
              Math.random() < 0.05)
          ) {
            fireworkRockets.push(new GoldenFireworkRocket());
          }

          // Update & draw rockets
          for (let i = fireworkRockets.length - 1; i >= 0; i--) {
            const rocket = fireworkRockets[i];
            rocket.update((cx, cy) => {
              spawnGoldenStarburst(cx, cy);
            });
            if (rocket.exploded) {
              fireworkRockets.splice(i, 1);
            } else {
              rocket.draw();
            }
          }

          // Update & draw Golden Cores
          for (let i = fireworkCores.length - 1; i >= 0; i--) {
            const core = fireworkCores[i];
            core.update();
            if (core.alpha <= 0) {
              fireworkCores.splice(i, 1);
            } else {
              core.draw();
            }
          }

          // Update & draw Golden Radial Rays
          for (let i = fireworkRays.length - 1; i >= 0; i--) {
            const ray = fireworkRays[i];
            ray.update();
            if (ray.alpha <= 0) {
              fireworkRays.splice(i, 1);
            } else {
              ray.draw();
            }
          }

          // Update & draw Golden Glitter
          for (let i = fireworkGlitter.length - 1; i >= 0; i--) {
            const g = fireworkGlitter[i];
            g.update();
            if (g.alpha <= 0) {
              fireworkGlitter.splice(i, 1);
            } else {
              g.draw();
            }
          }
        } else if (effect === 'sci_fi_hud') {
          const rgb = hexToRgb(effectColor);
          particles.forEach((p) => {
            p.update();
            p.draw(ctx, rgb);
          });
        } else {
          // Render general particles
          particles.forEach((p) => {
            p.update();
            p.draw();
          });
        }

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
