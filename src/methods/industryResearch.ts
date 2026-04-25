import { apiRequest, extractDisplayData } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const INDUSTRY_RESEARCH_URL = 'app-robo-advisor-api/assistant/write/industry/research';

export async function industryResearch(
  apiKey: string,
  query: string
): Promise<string> {
  const response = await apiRequest(apiKey, {
    url: INDUSTRY_RESEARCH_URL,
    body: { query },
    timeout: 1200000, // 20 minutes for report generation
  }) as Record<string, unknown>;

  const content = extractDisplayData(response);
  if (!content) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No industry research results');
  }

  return content;
}