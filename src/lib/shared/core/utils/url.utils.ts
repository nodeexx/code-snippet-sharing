export const ORIGINAL_PATH_URL_QUERY_PARAM_NAME = 'originalPath';

export function getUrlPathAndQueryParams(url: URL): string {
  return `${url.pathname}${url.search}`;
}

export function encodeOriginalPath(url: URL): string {
  return encodeURIComponent(getUrlPathAndQueryParams(url));
}

export function decodeOriginalPath(url: URL): string | null {
  const encodedOriginalPath = url.searchParams.get(
    ORIGINAL_PATH_URL_QUERY_PARAM_NAME,
  );
  const originalPath =
    encodedOriginalPath && decodeURIComponent(encodedOriginalPath);

  return originalPath;
}
