export interface ProxyConfig {
  host: string;
  port: number;
  protocol?: 'http' | 'https';
  auth?: {
    username: string;
    password: string;
  };
}

export const fetchEvent = async (url: string, proxy?: ProxyConfig): Promise<string> => {
  try {
    const headers = {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.6',
      'cache-control': 'max-age=0',
      // NOTE: These headers can be important for scraping sites that expect browser-like requests.
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'sec-gpc': '1',
      'upgrade-insecure-requests': '1',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    };

    // Note: Native fetch doesn't support proxy configuration directly in Node.js.
    // For proxy support, you would need to use a proxy agent or configure it at the environment level.
    if (proxy) {
      console.warn(
        'Proxy configuration is not supported with native fetch. Consider using a proxy agent or environment-level proxy configuration.'
      );
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      // Throws an error for non-successful HTTP statuses (e.g., 404, 500).
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (err: any) {
    // For debugging, you might want to log the original error:
    // if (process.env.NODE_ENV === 'development') {
    //   console.error('Original fetch error:', err.message ?? err);
    // }
    
    // Re-throw a generic, user-friendly error.
    throw new Error(
      'Error fetching event, make sure your URL is correct and the event is accessible to the public.'
    );
  }
};