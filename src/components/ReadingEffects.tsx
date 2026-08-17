import React from 'react';

interface ReadingEffectsProps {
  effect?: 'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble';
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
    window.addEventListener('resize', handleResize);

    // Particle system containers
    let particles: any[] = [];
    const maxParticles = 
      effect === 'rain' ? 70 : 
      effect === 'snow' ? 45 : 
      effect === 'star' ? 40 : 
      effect === 'leaf' ? 14 : 
      effect === 'cherry_blossom' ? 18 : 
      effect === 'firefly' ? 25 : 
      effect === 'soap_bubble' ? 15 :
      0;

    class RainParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height - height;
      vy: number = 8 + Math.random() * 8;
      len: number = 12 + Math.random() * 18;
      opacity: number = 0.2 + Math.random() * 0.25;

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
        ctx.strokeStyle = isDarkTheme 
          ? `rgba(186, 230, 253, ${this.opacity})` // Light sky blue-silver on dark themes
          : `rgba(23, 37, 84, ${this.opacity + 0.3})`; // Rich dark navy blue on light themes (extremely visible)
        ctx.lineWidth = isDarkTheme ? 1.0 : 1.5;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.len);
        ctx.stroke();
      }
    }

    class SnowParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height;
      r: number = 1.5 + Math.random() * 2.5;
      vy: number = 0.5 + Math.random() * 0.8;
      opacity: number = 0.2 + Math.random() * 0.3;
      swing: number = Math.random() * 100;

      update() {
        this.y += this.vy;
        this.x += Math.sin((this.y + this.swing) / 30) * 0.4;
        if (this.y > height) {
          this.y = -10;
          this.x = Math.random() * width;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.fillStyle = isDarkTheme 
          ? `rgba(255, 255, 255, ${this.opacity})` 
          : `rgba(55, 65, 81, ${this.opacity + 0.35})`; // Distinct dark grey/slate snowflakes on light themes
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        ctx.fill();
      }
    }

    class StarParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height;
      r: number = 0.5 + Math.random() * 0.9;
      alpha: number = Math.random();
      speed: number = 0.003 + Math.random() * 0.008;
      isSparkle: boolean = Math.random() > 0.8; // Only 20% are delicate sparkles, 80% are soft micro-twinkles

      update() {
        this.alpha += this.speed;
        if (this.alpha > 0.9 || this.alpha < 0.1) {
          this.speed = -this.speed;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        const opacityVal = isDarkTheme 
          ? Math.max(0.12, this.alpha * 0.5) 
          : Math.max(0.08, this.alpha * 0.35);
          
        ctx.fillStyle = isDarkTheme 
          ? `rgba(254, 240, 138, ${opacityVal})` // Warm soft gold on dark
          : `rgba(180, 135, 75, ${opacityVal})`; // Delicate soft amber/bronze gold on light
          
        if (this.isSparkle) {
          // Draw a very tiny, delicate 4-pointed star sparkle
          const size = this.r * 1.8;
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.quadraticCurveTo(0, 0, size, 0);
          ctx.quadraticCurveTo(0, 0, 0, size);
          ctx.quadraticCurveTo(0, 0, -size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -size);
          ctx.closePath();
          ctx.fill();
        } else {
          // Soft circular background stars
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
      r: number = 8 + Math.random() * 6;
      angle: number = Math.random() * Math.PI * 2;
      rotationSpeed: number = (Math.random() - 0.5) * 0.025;
      vy: number = 0.7 + Math.random() * 0.8;
      vx: number = -0.5 + Math.random() * 0.5;
      opacity: number = 0.2 + Math.random() * 0.25;

      update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.y / 30) * 0.7; // Swaying motion
        this.angle += this.rotationSpeed;
        if (this.y > height + 20) {
          this.y = -20;
          this.x = Math.random() * width;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw highly realistic pointed leaf using two curved meeting paths
        ctx.beginPath();
        ctx.moveTo(0, -this.r);
        ctx.quadraticCurveTo(this.r * 0.65, -this.r * 0.1, 0, this.r);
        ctx.quadraticCurveTo(-this.r * 0.65, -this.r * 0.1, 0, -this.r);
        
        ctx.fillStyle = isDarkTheme 
          ? `rgba(244, 63, 94, ${this.opacity + 0.1})` // Rich bright rose leaf on dark
          : `rgba(180, 83, 9, ${this.opacity + 0.35})`; // Distinct rich auburn amber leaf on light
        ctx.fill();

        // Draw leaf central vein for superb authenticity
        ctx.beginPath();
        ctx.strokeStyle = isDarkTheme 
          ? `rgba(255, 255, 255, ${this.opacity * 0.45})` 
          : `rgba(78, 30, 0, ${this.opacity * 0.6})`;
        ctx.lineWidth = 0.9;
        ctx.moveTo(0, -this.r);
        ctx.lineTo(0, this.r);
        ctx.stroke();

        ctx.restore();
      }
    }

    class CherryBlossomParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height - 20;
      r: number = 4 + Math.random() * 5;
      angle: number = Math.random() * Math.PI * 2;
      rotationSpeed: number = (Math.random() - 0.5) * 0.03;
      vy: number = 0.5 + Math.random() * 0.7;
      vx: number = -0.3 + Math.random() * 0.3;
      opacity: number = 0.3 + Math.random() * 0.3;
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
        // Beautiful heart-shaped or curved petal
        ctx.bezierCurveTo(-this.r * 1.2, -this.r * 0.4, -this.r * 0.7, this.r * 0.7, 0, this.r);
        ctx.bezierCurveTo(this.r * 0.7, this.r * 0.7, this.r * 1.2, -this.r * 0.4, 0, -this.r);

        ctx.fillStyle = isDarkTheme 
          ? `rgba(244, 143, 177, ${this.opacity})` // Glowing soft pink on dark theme
          : `rgba(236, 72, 153, ${this.opacity + 0.2})`; // Brighter beautiful rose pink on light theme
        ctx.fill();

        ctx.restore();
      }
    }

    class FireflyParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height;
      r: number = 0.6 + Math.random() * 1.0; // Thân đom đóm thực tế siêu nhỏ
      
      // Quỹ đạo sinh học: Tốc độ bay tà tà và góc đổi hướng uốn lượn ngẫu nhiên
      angle: number = Math.random() * Math.PI * 2;
      baseSpeed: number = 0.08 + Math.random() * 0.12; // Bay lơ lửng cực kỳ chậm khi tắt đèn
      
      // Nhịp sinh học phát sáng: Đom đóm sáng theo chu kỳ bất đối xứng (phản ứng hóa học bùng nhanh, tắt chậm)
      timer: number = Math.floor(Math.random() * 300);
      flashDuration: number = 60 + Math.floor(Math.random() * 40); // Chu kỳ phát sáng (~1-1.5 giây)
      darkDuration: number = 120 + Math.floor(Math.random() * 180); // Thời gian tắt đèn nghỉ ngơi (~2-5 giây)
      alpha: number = 0;

      update() {
        // Chuyển động nhiễu loạn ngẫu nhiên (Brownian walk) giúp đường bay uốn lượn nhẹ nhàng, không bị đơ
        this.angle += (Math.random() - 0.5) * 0.18;
        
        // Mô phỏng đường bay "J-stroke" đặc trưng: khi phát sáng (alpha cao), đom đóm sẽ bứt tốc nhẹ bay vút lên
        const speedSurge = 1.0 + this.alpha * 1.8;
        const currentSpeed = this.baseSpeed * speedSurge;
        
        this.x += Math.cos(this.angle) * currentSpeed;
        // Xu hướng bay lững lờ hướng lên trên nhẹ nhàng, tăng tốc nâng lên khi chớp sáng
        this.y += Math.sin(this.angle) * currentSpeed - 0.03 - (this.alpha * 0.15);

        // Chu kỳ nhịp sinh học: Phản ứng hóa học Luciferase (bùng lên rất nhanh, lịm tắt từ từ)
        this.timer++;
        const cycleLength = this.flashDuration + this.darkDuration;
        const currentCycleTime = this.timer % cycleLength;

        if (currentCycleTime < this.flashDuration) {
          const progress = currentCycleTime / this.flashDuration;
          const attackPhase = 0.22; // 22% đầu tiên là pha bùng sáng cực nhanh (Attack)
          
          if (progress < attackPhase) {
            // Bùng sáng nhanh theo đường cong hình sin góc mở rộng
            this.alpha = Math.sin((progress / attackPhase) * Math.PI / 2);
          } else {
            // Tắt lịm dần chậm rãi theo hàm số mũ mũ 2 (Decay) mô phỏng chính xác phản ứng hóa học nguội đi
            const decayProgress = (progress - attackPhase) / (1 - attackPhase);
            this.alpha = Math.pow(1 - decayProgress, 2.2); 
          }
        } else {
          this.alpha = 0; // Tắt hẳn đèn hoàn toàn
        }

        // Tự động cuốn lại khi bay ra khỏi rìa màn hình với vùng đệm an toàn rộng rãi
        if (this.x < -30) this.x = width + 20;
        if (this.x > width + 30) this.x = -20;
        if (this.y < -30) this.y = height + 20;
        if (this.y > height + 30) {
          this.y = -20;
          this.x = Math.random() * width;
        }
      }

      draw() {
        if (this.alpha <= 0.01) return; // Tối ưu: Không vẽ khi đom đóm đang tắt đèn

        ctx.save();
        
        // Sử dụng chế độ trộn màu 'screen' trên nền tối giúp các luồng sáng đom đóm cộng hưởng lấp lánh chân thực
        if (isDarkTheme) {
          ctx.globalCompositeOperation = 'screen';
        }

        const pulseAlpha = this.alpha;
        // Quầng sáng nở rộ to nhỏ linh động theo nhịp sáng thực tế
        const glowRadius = this.r * (3.0 + pulseAlpha * 7.0);

        // Tạo quầng sáng lập lòe đa lớp (Bioluminescent Glow Aura)
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
        
        if (isDarkTheme) {
          // Màu vàng mật ong kết hợp hổ phách ấm áp (Bioluminescent Golden Amber thực tế)
          grad.addColorStop(0, `rgba(254, 240, 138, ${pulseAlpha * 0.95})`); // Lõi vàng rơm siêu sáng ấm áp
          grad.addColorStop(0.2, `rgba(245, 158, 11, ${pulseAlpha * 0.65})`); // Quầng sáng chuyển tiếp màu vàng cam mật ong
          grad.addColorStop(0.5, `rgba(217, 119, 6, ${pulseAlpha * 0.2})`); // Ánh hổ phách lan tỏa nhẹ nhàng ở rìa
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          // Tone màu hổ phách vàng cam ấm áp để nhìn rõ và sang trọng trên nền trang giấy sáng màu (Sepia/White)
          grad.addColorStop(0, `rgba(245, 158, 11, ${pulseAlpha * 0.75})`);
          grad.addColorStop(0.3, `rgba(217, 119, 6, ${pulseAlpha * 0.35})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Điểm nhân sáng siêu nhỏ cô đọng năng lượng sinh học bên trong
        ctx.beginPath();
        if (isDarkTheme) {
          ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.95})`; // Lõi màu trắng ấm cực sáng giống đốm lửa thật
        } else {
          ctx.fillStyle = `rgba(146, 64, 14, ${pulseAlpha * 0.8})`; // Điểm nhân tối bóng côn trùng trên nền sáng
        }
        ctx.arc(this.x, this.y, this.r * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    class SoapBubbleParticle {
      x: number = Math.random() * width;
      y: number = height + 20 + Math.random() * 100; // Xuất phát từ dưới mép màn hình lên
      r: number = 8 + Math.random() * 14; // Bán kính ngẫu nhiên cho đa dạng kích cỡ
      vx: number = (Math.random() - 0.5) * 0.3;
      vy: number = -(0.5 + Math.random() * 0.7); // Bay ngược lên trên chậm rãi
      opacity: number = 0.35 + Math.random() * 0.35;
      wobbleSpeed: number = 0.01 + Math.random() * 0.02;
      wobble: number = Math.random() * Math.PI * 2;
      hueOffset: number = Math.random() * 360; // Tạo màu cầu vồng ngẫu nhiên cho mỗi bóng

      update() {
        this.y += this.vy;
        this.wobble += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobble) * 0.25; // Đung đưa uốn lượn trái phải

        // Hồi sinh lại bong bóng ở dưới đáy khi bay ra ngoài màn hình
        if (this.y < -this.r * 2 || this.x < -this.r * 2 || this.x > width + this.r * 2) {
          this.y = height + 20 + Math.random() * 80;
          this.x = Math.random() * width;
          this.r = 8 + Math.random() * 14;
          this.vy = -(0.5 + Math.random() * 0.7);
        }
      }

      draw() {
        ctx.save();
        
        ctx.globalAlpha = this.opacity;

        // Tạo dải màu gradient cầu vồng 3D lấp lánh nhẹ (Iridescent Soap Film Effect)
        const bubbleGrad = ctx.createRadialGradient(
          this.x - this.r * 0.15, 
          this.y - this.r * 0.15, 
          this.r * 0.6, 
          this.x, 
          this.y, 
          this.r
        );
        
        const hue1 = (this.hueOffset + this.y * 0.08) % 360; // Màu sắc chuyển dời mượt mà khi bóng bay lên
        const hue2 = (hue1 + 120) % 360;
        const hue3 = (hue1 + 240) % 360;

        bubbleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
        bubbleGrad.addColorStop(0.7, `hsla(${hue1}, 75%, 75%, 0.12)`);
        bubbleGrad.addColorStop(0.9, `hsla(${hue2}, 80%, 70%, 0.32)`);
        bubbleGrad.addColorStop(1, `hsla(${hue3}, 85%, 65%, 0.55)`);

        ctx.beginPath();
        ctx.fillStyle = bubbleGrad;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();

        // Đường viền siêu mỏng lấp lánh sắc màu cầu vồng của màng xà phòng
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue1}, 75%, 70%, 0.45)`;
        ctx.lineWidth = 0.8;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.stroke();

        // Vệt phản chiếu ánh sáng trắng (Gleaming 3D highlight) ở góc trên bên trái tạo độ căng bóng tròn trịa
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.arc(this.x - this.r * 0.35, this.y - this.r * 0.35, this.r * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Vệt phản xạ phụ siêu mờ góc dưới bên phải
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.arc(this.x + this.r * 0.4, this.y + this.r * 0.4, this.r * 0.08, 0, Math.PI * 2);
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
        opacity: 0.35 + Math.random() * 0.2,
      };
    };

    // Glitch scanlines state
    let glitchTimer = 0;
    let glitchLines: number[] = [];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (effect === 'glitch') {
        // 1. CRT Scanlines (Very subtle and clean scanlines)
        ctx.beginPath();
        ctx.strokeStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.035)' : 'rgba(0, 0, 0, 0.02)';
        ctx.lineWidth = 1;
        for (let y = 0; y < height; y += 7) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        // 2. Horizontal slice offset glitches (Rare, subtle RGB Shift)
        glitchTimer++;
        if (glitchTimer % 180 === 0 || Math.random() < 0.008) {
          const numGlitches = 1 + Math.floor(Math.random() * 2);
          for (let i = 0; i < numGlitches; i++) {
            const sliceY = Math.random() * height;
            const sliceHeight = 3 + Math.random() * 10;
            const shift = (Math.random() - 0.5) * 8;

            // Cyan horizontal slice (Lower opacity)
            ctx.fillStyle = isDarkTheme ? 'rgba(6, 182, 212, 0.15)' : 'rgba(8, 145, 178, 0.1)';
            ctx.fillRect(shift, sliceY, width, sliceHeight);

            // Magenta horizontal slice (Lower opacity)
            ctx.fillStyle = isDarkTheme ? 'rgba(236, 72, 153, 0.15)' : 'rgba(219, 39, 119, 0.1)';
            ctx.fillRect(-shift, sliceY + 1, width, sliceHeight);
          }
        }

        // 3. Horizontal noise lines (Extremely rare and faint)
        if (Math.random() < 0.04) {
          ctx.fillStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
          const count = 1 + Math.floor(Math.random() * 2);
          for (let i = 0; i < count; i++) {
            ctx.fillRect(Math.random() * width, Math.random() * height, 10 + Math.random() * 30, 1.5);
          }
        }
      } else {
        // Render general particles
        particles.forEach((p) => {
          p.update();
          p.draw();
        });

        // Shooting Star for star effect
        if (effect === 'star') {
          if (!shootingStar && Math.random() < 0.008) {
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
            grad.addColorStop(0, isDarkTheme ? `rgba(255, 220, 230, ${shootingStar.opacity})` : `rgba(150, 100, 65, ${shootingStar.opacity})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
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
