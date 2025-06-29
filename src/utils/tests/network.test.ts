import { fetchEvent } from '../network';

// Mock fetch globally for all tests in this file
global.fetch = jest.fn();
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('fetchEvent', () => {
  const eventUrl = 'https://www.facebook.com/events/1234567890';

  // Reset the mock before each test to ensure isolation
  afterEach(() => {
    mockedFetch.mockReset();
  });

  it('returns event data for a valid URL', async () => {
    const responseData = 'Some HTML event data';
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(responseData),
    } as Response);

    const result = await fetchEvent(eventUrl);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(eventUrl, {
      method: 'GET',
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.6',
        'cache-control': 'max-age=0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'sec-gpc': '1',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
      }
    });

    expect(result).toEqual(responseData);
  });

  it('handles proxy configuration gracefully', async () => {
    const responseData = 'Some HTML event data';
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(responseData),
    } as Response);

    const aProxy = { host: 'localhost', port: 8080 };
    // Spy on console.warn to assert it's called without cluttering test output
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await fetchEvent(eventUrl, aProxy);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Proxy configuration is not supported with native fetch. Consider using a proxy agent or environment-level proxy configuration.'
    );
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    // Assert that fetch is still called, but without any proxy options.
    expect(mockedFetch).toHaveBeenCalledWith(eventUrl, {
      method: 'GET',
      headers: expect.any(Object),
    });

    expect(result).toEqual(responseData);
    consoleWarnSpy.mockRestore(); // Clean up the spy
  });

  it('throws a user-friendly error for a network issue', async () => {
    const errorMessage =
      'Error fetching event, make sure your URL is correct and the event is accessible to the public.';
    // Mock a network error by rejecting the fetch promise
    mockedFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchEvent('invalid-url')).rejects.toThrow(errorMessage);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith('invalid-url', {
      method: 'GET',
      headers: expect.any(Object),
    });
  });

  it('throws a user-friendly error for a non-ok HTTP response', async () => {
    // Mock a resolved response, but with an error status
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    const url = 'https://example.com/nonexistent';
    await expect(fetchEvent(url)).rejects.toThrow(
      'Error fetching event, make sure your URL is correct and the event is accessible to the public.'
    );

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(url, {
      method: 'GET',
      headers: expect.any(Object),
    });
  });
});