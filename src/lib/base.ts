export function withBase(
  path: string,
  base = import.meta.env.BASE_URL,
): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBase}${normalizedPath}`;
}

export function wikiHref(id: string, base = import.meta.env.BASE_URL): string {
  const encodedId = id.split("/").map(encodeURIComponent).join("/");
  return withBase(`wiki/${encodedId}/`, base);
}
