import React, { useEffect, useRef } from 'react';

export const Confetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number, y: number, r: number, dx: number, dy: number, color: string, tilt: number, tiltAngleIncrement: number, tiltAngle: number }[] = [];
    const colors = ['#ff007a', '#00e0b8', '#f5f3ff', '#a09fb9', '#2a254e'];
    
    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2, // Start from center
        r: Math.random() * 6 + 2,
        dx: Math.random() * 20 - 10,
        dy: Math.random() * -20 - 10, // Initial upwards velocity
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncrement: (Math.random() * 0.07) + 0.05,
        tiltAngle: 0
      });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(p.tiltAngle) + p.dy + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle) * 2 + p.dx;
        
        // Add gravity
        p.dy += 0.5;
        
        // Add friction
        p.dx *= 0.98;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();
      });

      // Continue animation if some particles are still on screen
      if (particles.some(p => p.y < canvas.height)) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      aria-hidden="true"
    />
  );
};
