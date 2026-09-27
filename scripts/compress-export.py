"""Shrink JPEGs in the static export so the Workers bundle stays under 25 MB."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "out" / "media"
LIMIT = 1800
QUALITY = 80


def main() -> None:
    if not ROOT.is_dir():
        raise SystemExit(f"Missing export media directory: {ROOT}")
    for path in sorted(ROOT.iterdir()):
        if path.suffix.lower() not in {".jpg", ".jpeg"}:
            continue
        image = Image.open(path).convert("RGB")
        width, height = image.size
        long_side = max(width, height)
        if long_side > LIMIT:
            scale = LIMIT / long_side
            image = image.resize(
                (max(1, int(width * scale)), max(1, int(height * scale))),
                Image.Resampling.LANCZOS,
            )
        image.save(path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    total = sum(path.stat().st_size for path in ROOT.iterdir())
    print(f"compressed out/media to {total / 1_000_000:.2f} MB")


if __name__ == "__main__":
    main()
