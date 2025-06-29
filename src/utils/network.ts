export interface ProxyConfig {
  host: string;
  port: number;
  protocol?: 'http' | 'https';
  auth?: {
    username: string;
    password: string;
  };
}

export const fetchEvent = async (url: string, proxy?: ProxyConfig) => {
  try {
    const headers = {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.6',
      'cache-control': 'max-age=0',
      // NOTE: Need these headers to get all the event data, some combo of the sec fetch headers
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'sec-gpc': '1',
      'upgrade-insecure-requests': '1',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    };

    // Note: Native fetch doesn't support proxy configuration directly
    // For proxy support, you would need to use a proxy agent or configure it at the environment level
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (err: any) {
    // TODO: if in debug, print error: err.message ?? err
    throw new Error(
      'Error fetching event, make sure your URL is correct and the event is accessible to the public.'
    );
  }
};
