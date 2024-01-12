import { describe, it, expect } from 'vitest';
import { getRefererHeaderUrl } from './url.utils';

describe(getRefererHeaderUrl.name, () => {
  it('should return null if request has no referer header', async () => {
    const request = {
      headers: new Headers(),
    } as Request;

    const refererUrl = getRefererHeaderUrl(request);

    expect(refererUrl).toEqual(null);
  });

  it('should return URL from the referer header', async () => {
    const urlString = 'http://localhost:3000/path?param=value';
    const request = {
      headers: new Headers({
        referer: urlString,
      }),
    } as Request;

    const refererUrl = getRefererHeaderUrl(request);

    expect(refererUrl?.toString()).toEqual(urlString);
  });
});
