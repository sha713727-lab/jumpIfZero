"use client";

import { useEffect, useRef } from "react";
import { colors } from "@/constants/colors";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
};

type Pointer = {
  x: number;
  y: number;
  active: boolean;
};

const LINK_DIST = 148;
const GRAB_DIST = 220;
const NODE_COUNT_DESKTOP = 88;
const NODE_COUNT_MOBILE = 48;

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const n = Number.parseInt(value, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function nodeCountFor(width: number) {
  return width < 768 ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
}

function createNodes(width: number, height: number, count: number) {
  const nodes: Node[] = [];

  for (let i = 0; i < count; i += 1) {
    const cluster = Math.random();
    const biasX = cluster > 0.42 ? 0.52 + Math.random() * 0.48 : Math.random();
    const biasY = cluster > 0.42 ? 0.18 + Math.random() * 0.64 : Math.random();

    nodes.push({
      x: biasX * width,
      y: biasY * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r: 1.1 + Math.random() * 2.2,
      pulse: Math.random() * Math.PI * 2,
    });
  }

  return nodes;
}

export function HeroPlexus() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const cream = hexToRgb(colors.cream);
    const secondary = hexToRgb(colors.secondary);
    const pointer: Pointer = { x: 0, y: 0, active: false };
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = createNodes(width, height, nodeCountFor(width));
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        if (!a) {
          continue;
        }

        if (!reduceMotion) {
          a.x += a.vx;
          a.y += a.vy;
          a.pulse += 0.02;

          if (a.x < -20 || a.x > width + 20) {
            a.vx *= -1;
          }
          if (a.y < -20 || a.y > height + 20) {
            a.vy *= -1;
          }

          if (pointer.active) {
            const dx = pointer.x - a.x;
            const dy = pointer.y - a.y;
            const dist = Math.hypot(dx, dy);
            if (dist < GRAB_DIST && dist > 0.001) {
              a.x += (dx / dist) * 0.08;
              a.y += (dy / dist) * 0.08;
            }
          }
        }

        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          if (!b) {
            continue;
          }
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist > LINK_DIST) {
            continue;
          }

          const t = 1 - dist / LINK_DIST;
          const alpha = t * 0.42;
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(
            0,
            `rgba(${cream.r}, ${cream.g}, ${cream.b}, ${alpha})`,
          );
          grad.addColorStop(
            1,
            `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${alpha * 0.75})`,
          );
          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        if (pointer.active) {
          const pdx = pointer.x - a.x;
          const pdy = pointer.y - a.y;
          const pdist = Math.hypot(pdx, pdy);
          if (pdist < GRAB_DIST) {
            const t = 1 - pdist / GRAB_DIST;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${cream.r}, ${cream.g}, ${cream.b}, ${t * 0.35})`;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        const glow = 0.55 + Math.sin(node.pulse) * 0.25;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${cream.r}, ${cream.g}, ${cream.b}, ${0.16 * glow})`;
        ctx.arc(node.x, node.y, node.r * 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${cream.r}, ${cream.g}, ${cream.b}, ${0.78 * glow})`;
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-auto absolute inset-0 z-[1] h-full w-full"
    />
  );
}
