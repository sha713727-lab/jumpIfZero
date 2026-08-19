from __future__ import annotations

from pathlib import Path
import shutil

import imageio.v3 as iio
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\Apex Solution\Downloads\Creating_website_scroll_animatio…_202608192222.mp4")
OUT_DIR = ROOT / "public" / "images" / "JZ_Frames_Video_24FPS"
TARGET_WIDTH = 960
TARGET_HEIGHT = 540
QUALITY = 68


def fit_cover(image: Image.Image, width: int, height: int) -> Image.Image:
    scale = max(width / image.width, height / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = max(0, (resized.width - width) // 2)
    top = max(0, (resized.height - height) // 2)
    return resized.crop((left, top, left + width, top + height))


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Missing video: {SOURCE}")

    meta = iio.immeta(SOURCE)
    fps = float(meta.get("fps", 24.0))
    duration = float(meta.get("duration", 0.0))
    frame_count = max(1, round(fps * duration))

    shutil.rmtree(OUT_DIR, ignore_errors=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for index, frame in enumerate(iio.imiter(SOURCE)):
        image = Image.fromarray(frame).convert("RGB")
        fitted = fit_cover(image, TARGET_WIDTH, TARGET_HEIGHT)
        fitted.save(
            OUT_DIR / f"frame_{index:04d}.webp",
            format="WEBP",
            quality=QUALITY,
            method=6,
        )

        if (index + 1) % 24 == 0 or index + 1 == frame_count:
            print(f"{index + 1}/{frame_count}")

    print(frame_count)


if __name__ == "__main__":
    main()
