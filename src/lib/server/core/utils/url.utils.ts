export function getRefererHeaderUrl(request: Request): URL | null {
  const refererHeaderValue = request.headers.get('referer');
  if (!refererHeaderValue) {
    return null;
  }
  const refererHeaderUrl = new URL(refererHeaderValue);

  return refererHeaderUrl;
}
