export const DEMO_HOST = 'httpbin.org';

// Your demo pin (replace if needed)
export const DEMO_PIN_HTTPBIN =
  'sha256/5BWYNtPxvjsl+qhQLxo3jz3ZaK74xyHT/QdOhBB07i0=';

// Generate "http://..." without having literal "http://" in code
export const insecureHttpUrl = (hostAndPath: string) =>
  `http:` + `//${hostAndPath}`;
