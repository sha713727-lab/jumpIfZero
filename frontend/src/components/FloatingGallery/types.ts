export type GalleryImageSource = {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
};

export type GalleryTransform = {
  readonly translateX: number;
  readonly translateY: number;
  readonly translateZ: number;
  readonly rotationX: number;
  readonly rotationY: number;
  readonly rotationZ: number;
  readonly scale: number;
};

export type GalleryItemData = GalleryImageSource &
  GalleryTransform & {
    readonly pathT: number;
    readonly lane: number;
  };

export type CurveSample = {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly depthRatio: number;
  readonly rotateX: number;
  readonly rotateY: number;
  readonly rotateZ: number;
};

export type GalleryViewport = {
  readonly width: number;
  readonly height: number;
  readonly isMobile: boolean;
  readonly isTablet: boolean;
};

export type GalleryLayoutConfig = {
  readonly itemCount: number;
  readonly scrollDistance: number;
  readonly floatAmplitude: number;
  readonly pathTravel: number;
  readonly minScale: number;
  readonly maxScale: number;
  readonly ribbonLanes: number;
  readonly laneSpread: number;
  readonly spreadX: number;
  readonly spreadY: number;
  readonly pathVariant: RibbonPathVariant;
};

export type RibbonPathVariant = "landscape" | "portrait";

export type AboutCopy = {
  readonly watermark: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly cta: {
    readonly label: string;
    readonly href: string;
  };
};

export type FloatingGalleryProps = {
  readonly sectionId?: string;
  readonly ariaLabel?: string;
  readonly copy?: AboutCopy;
};
