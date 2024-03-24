import { expect, test } from '@playwright/test';

test.describe('POST /sign-in?/google-auth', () => {
  test('successfully redirects to /auth/google page', async ({
    request,
    baseURL,
  }, testInfo) => {
    if (!baseURL) {
      throw new Error('Base URL is not set');
    }

    const response = await request.post('/sign-in?/google-auth', {
      headers: {
        // Needed to pass CSRF check
        origin: baseURL,
      },
      form: {},
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    const locationUrl = new URL(json.location);
    expect(locationUrl.origin).toBe('https://accounts.google.com');
    // `searchParams.get` method automatically decodes given query param value
    expect(locationUrl.searchParams.get('redirect_uri')).toBe(
      `${testInfo.project.use.baseURL}/sign-in?oauth-type=google`,
    );
    expect(await response.json()).toEqual({
      location: expect.any(String),
      status: 307,
      type: 'redirect',
    });
  });
});
