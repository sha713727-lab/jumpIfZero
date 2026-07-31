"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export type ThreeDMarqueeProps = {
  readonly images: readonly string[];
  readonly className?: string;
};

function buildColumns(images: readonly string[], columns: number): string[][] {
  const looped = [...images, ...images];
  const perColumn = 5;

  return Array.from({ length: columns }, (_, colIndex) => {
    const start = colIndex * perColumn;
    return looped.slice(start, start + perColumn);
  });
}

export function ThreeDMarquee({ images, className }: ThreeDMarqueeProps) {
  const reduceMotion = useReducedMotion();
  const chunks = buildColumns(images, 3);

  const rootClass = className
    ? `relative mx-auto block h-full min-h-[100svh] w-full overflow-hidden ${className}`
    : "relative mx-auto block h-full min-h-[100svh] w-full overflow-hidden";

  return (
    <div className={rootClass} aria-hidden="true">
      <div className="absolute inset-0 bg-[#0d120b]" />

      <div className="relative z-0 flex size-full items-center justify-center [perspective:1100px]">
        <div className="aspect-square size-[210%] shrink-0 scale-[1.55] max-sm:size-[230%] max-sm:scale-[1.7] sm:size-[180%] sm:scale-[1.48] md:size-[155%] md:scale-[1.58] xl:size-[62rem] xl:scale-[1.62]">
          <div className="relative top-[2%] right-[-48%] grid size-full origin-top-left grid-cols-3 gap-2.5 [transform:rotateX(26deg)_rotateY(0deg)_rotateZ(20deg)] [transform-style:preserve-3d] max-sm:right-[-54%] max-sm:top-[6%] max-sm:gap-2 sm:right-[-36%] sm:top-0 sm:gap-3.5 sm:[transform:rotateX(30deg)_rotateZ(24deg)] md:right-[-22%] md:top-[-8%] md:gap-5 md:[transform:rotateX(34deg)_rotateZ(28deg)]">
            {chunks.map((subarray, colIndex) => {
              const columnClass =
                "flex flex-col items-stretch gap-2.5 max-sm:gap-2 sm:gap-3.5 md:gap-5";
              const tiles = subarray.map((src, imageIndex) => (
                <div
                  key={`${src}-${colIndex}-${imageIndex}`}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-[0.85rem] border border-white/[0.08] bg-[#161c13] shadow-[0_14px_32px_rgba(5,7,5,0.5)] sm:rounded-[1rem] md:rounded-[1.15rem]"
                >
                  <Image
                    src={src}
                    alt=""
                    aria-hidden="true"
                    fill
                    draggable={false}
                    className="object-cover select-none"
                    sizes="(max-width: 768px) 55vw, 28vw"
                    loading="lazy"
                  />
                </div>
              ));

              if (reduceMotion) {
                return (
                  <figure
                    key={`marquee-col-${colIndex}`}
                    className={columnClass}
                  >
                    {tiles}
                  </figure>
                );
              }

              return (
                <motion.figure
                  key={`marquee-col-${colIndex}`}
                  className={columnClass}
                  animate={{ y: colIndex % 2 === 0 ? 28 : -28 }}
                  transition={{
                    duration: colIndex % 2 === 0 ? 12 : 16,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                >
                  {tiles}
                </motion.figure>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
