import { describe, it, expect } from 'vitest';
import {
  ORIGINAL_PATH_URL_QUERY_PARAM_NAME,
  decodeOriginalPath,
  encodeOriginalPath,
  getUrlPathAndQueryParams,
} from './url.utils';

describe(getUrlPathAndQueryParams.name, () => {
  it('should return path and query params', async () => {
    const url = new URL('http://localhost:3000/some/path?param=value');

    const urlPathAndQueryParams = getUrlPathAndQueryParams(url);

    expect(urlPathAndQueryParams).toEqual('/some/path?param=value');
  });
});

describe(encodeOriginalPath.name, () => {
  it('should encode path and query params', async () => {
    const url = new URL('http://localhost:3000/protected?param=value');

    const encodedOriginalPath = encodeOriginalPath(url);

    expect(encodedOriginalPath).toEqual('%2Fprotected%3Fparam%3Dvalue');
  });

  it('should encode root path', async () => {
    const url = new URL('http://localhost:3000');

    const encodedOriginalPath = encodeOriginalPath(url);

    expect(encodedOriginalPath).toEqual('%2F');
  });
});

describe(decodeOriginalPath.name, () => {
  it('should decode path and query params', async () => {
    const url = new URL(
      `http://localhost:3000/sign-in?${ORIGINAL_PATH_URL_QUERY_PARAM_NAME}=%2Fprotected%3Fparam%3Dvalue`,
    );

    const originalPath = decodeOriginalPath(url);

    expect(originalPath).toEqual('/protected?param=value');
  });

  it('should return null', async () => {
    const url = new URL('http://localhost:3000/sign-in?param=value');

    const originalPath = decodeOriginalPath(url);

    expect(originalPath).toEqual(null);
  });
});
