import { MiaoxiangError, ErrorCodes } from './errors';

const API_BASE = 'https://ai-saas.eastmoney.com/proxy/';
const TIMEOUT_MS = 60000;

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

export async function apiRequest(
  apiKey: string,
  options: RequestOptions
): Promise<unknown> {
  const { url, method = 'POST', body, headers = {}, timeout = TIMEOUT_MS } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'em_api_key': apiKey,
    ...headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new MiaoxiangError(
        ErrorCodes.HTTP_ERROR,
        `HTTP error: ${response.status}`,
        { status: response.status, body: text.slice(0, 500) }
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof MiaoxiangError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new MiaoxiangError(ErrorCodes.TIMEOUT, 'Request timeout');
      }
      throw new MiaoxiangError(ErrorCodes.NETWORK_ERROR, error.message);
    }

    throw new MiaoxiangError(ErrorCodes.NETWORK_ERROR, 'Unknown network error');
  }
}

export function extractDisplayData(data: unknown): string {
  if (!data || typeof data !== 'object') return '';

  const d = data as Record<string, unknown>;

  if (d.data && typeof d.data === 'object') {
    const nested = d.data as Record<string, unknown>;
    const displayData = nested.displayData;
    if (typeof displayData === 'string') return displayData;

    if (typeof nested.llmSearchResponse === 'string') return nested.llmSearchResponse;
    if (typeof nested.searchResponse === 'string') return nested.searchResponse;
  }

  if (typeof d.displayData === 'string') return d.displayData;
  if (typeof d.llmSearchResponse === 'string') return d.llmSearchResponse;
  if (typeof d.searchResponse === 'string') return d.searchResponse;

  return JSON.stringify(data);
}