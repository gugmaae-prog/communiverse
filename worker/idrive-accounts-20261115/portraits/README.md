# Verified Circles thumbnails

These are resized copies of the site's existing verified portraits. The original files remain at their public URLs and in IDrive E2.

| Thumbnail | Verified source | Source SHA-256 | Thumbnail SHA-256 |
| --- | --- | --- | --- |
| `keiffer-384.webp` | `/communiverse/_circles/20261022-v1/keiffer-1024.webp` | `70413f0f06e05ca8283a3eb179c982e6f19575690c78dd4fcb6fd0abf811992b` | `b4ba5c34f9b7233c440532451f0b884a55760c758d18d3e849d218dbb9d5ceff` |
| `luna-384.webp` | `/communiverse/_circles/20261022-v1/luna-1024.webp` | `31639d9b8624fcfdb97ca7194a3b8bf822940ff11c26355579ae451c0dbfe5be` | `f8040cded0ed990ad95c96b0b6f605d05cb8f348389c7108ffba9cd60dee318b` |

Both thumbnails were produced with `cwebp -q 82 -m 6 -resize 384 0`, preserving each original aspect ratio. The source hashes were checked against `worker/idrive-media-20261111/verified-portraits.json` before resizing.
