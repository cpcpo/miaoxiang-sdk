import { apiRequest, extractDisplayData } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const TOPIC_RESEARCH_URL = 'app-robo-advisor-api/assistant/write/thematic/research';

export async function topicResearch(
  apiKey: string,
  query: string
): Promise<string> {
  const response = await apiRequest(apiKey, {
    url: TOPIC_RESEARCH_URL,
    body: { query },
    timeout: 1200000, // 20 minutes for report generation
  }) as Record<string, unknown>;

  const content = extractDisplayData(response);
  if (!content) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No topic research results');
  }

  return content;
}