import { apiRequest, extractDisplayData } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const COMPARABLE_ANALYSIS_URL = 'app-robo-advisor-api/assistant/comparable-company-analysis';

export async function comparableAnalysis(
  apiKey: string,
  query: string
): Promise<string> {
  const response = await apiRequest(apiKey, {
    url: COMPARABLE_ANALYSIS_URL,
    body: { question: query },
  }) as Record<string, unknown>;

  const content = extractDisplayData(response);
  if (!content) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No comparable analysis results');
  }

  return content;
}