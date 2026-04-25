import { apiRequest, extractDisplayData } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const INDUSTRY_TRACKER_URL = 'app-robo-advisor-api/assistant/write/tracking/report';

export async function industryTracker(
  apiKey: string,
  query: string
): Promise<string> {
  const response = await apiRequest(apiKey, {
    url: INDUSTRY_TRACKER_URL,
    body: { query },
    timeout: 1200000, // 20 minutes for report generation
  }) as Record<string, unknown>;

  const content = extractDisplayData(response);
  if (!content) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No industry tracker results');
  }

  return content;
}