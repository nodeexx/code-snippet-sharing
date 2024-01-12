import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
  type Mock,
} from 'vitest';
import * as appNavigationModule from '$app/navigation';
import { goBack } from './navigation.utils';

describe(goBack.name, () => {
  let mockHistoryBack: Mock;
  let documentReferrerSpy: MockInstance;
  let gotoSpy: MockInstance;

  beforeEach(() => {
    // NOTE: `vi.spyOn(window.location, 'origin', 'get')` doesn't work
    mockHistoryBack = vi.fn();
    vi.spyOn(window, 'window', 'get').mockReturnValue({
      location: {
        origin: 'http://localhost:3000',
      } as Partial<Location> as Location,
      history: {
        back: mockHistoryBack,
      } as Partial<History> as History,
    } as Partial<Window> as any);
    documentReferrerSpy = vi
      .spyOn(document, 'referrer', 'get')
      .mockReturnValue('');
    gotoSpy = vi.spyOn(appNavigationModule, 'goto').mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should go to the root page', async () => {
    await goBack();

    expect(mockHistoryBack).toBeCalledTimes(0);
    expect(gotoSpy).toBeCalledTimes(1);
  });

  it('should go back to the previous page', async () => {
    documentReferrerSpy.mockReturnValue('http://localhost:3000/some/path');

    await goBack();

    expect(mockHistoryBack).toBeCalledTimes(1);
    expect(gotoSpy).toBeCalledTimes(0);
  });
});
