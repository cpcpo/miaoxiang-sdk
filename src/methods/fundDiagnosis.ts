import { apiRequest, extractDisplayData } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const FUND_DIAGNOSIS_URL = 'app-robo-advisor-api/assistant/fund-analysis';

export async function fundDiagnosis(
  apiKey: string,
  query: string
): Promise<string> {
  const response = await apiRequest(apiKey, {
    url: FUND_DIAGNOSIS_URL,
    body: { question: query },
  }) as Record<string, unknown>;

  const content = extractDisplayData(response);
  if (!content) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No fund diagnosis results');
  }

  return content;
}