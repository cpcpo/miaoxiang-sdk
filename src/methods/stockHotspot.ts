import { apiRequest, extractDisplayData } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const STOCK_HOTSPOT_URL = 'app-robo-advisor-api/assistant/hotspot-discovery';

export async function stockHotspot(
  apiKey: string,
  query: string
): Promise<string> {
  const response = await apiRequest(apiKey, {
    url: STOCK_HOTSPOT_URL,
    body: { question: query },
  }) as Record<string, unknown>;

  const content = extractDisplayData(response);
  if (!content) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No hotspot data');
  }

  return content;
}