/** Public files are served under the Next.js base path. */
export const basePath = "/communiverse";

export function publicUrl(path: string) {
  if (!path.startsWith("/") || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}
