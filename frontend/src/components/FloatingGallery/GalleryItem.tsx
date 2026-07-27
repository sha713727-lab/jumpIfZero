"use client";

import { memo } from "react";
import type { GalleryItemData } from "./types";
import styles from "./gallery.module.css";

type GalleryItemProps = {
  readonly item: GalleryItemData;
  readonly itemRef: (node: HTMLElement | null) => void;
};

function GalleryItemComponent({ item, itemRef }: GalleryItemProps) {
  return (
    <figure
      ref={itemRef}
      className={styles.item}
      data-gallery-item={item.id}
      aria-hidden="true"
    >
      <img
        className={styles.image}
        src={item.src}
        alt=""
        width={item.width}
        height={item.height}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        draggable={false}
      />
    </figure>
  );
}

export const GalleryItem = memo(GalleryItemComponent);
