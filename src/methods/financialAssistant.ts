import { apiRequest, extractDisplayData } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const FINANCIAL_ASSISTANT_URL = 'app-robo-advisor-api/assistant/ask';

export interface FinancialAssistantOptions {
  deepThink?: boolean;
}

export async function financialAssistant(
  apiKey: string,
  query: string,
  options: FinancialAssistantOptions = {}
): Promise<string> {
  const body: Record<string, unknown> = { question: query };
  if (options.deepThink) {
    body.deepThink = true;
  }

  const response = await apiRequest(apiKey, {
    url: FINANCIAL_ASSISTANT_URL,
    body,
  }) as Record<string, unknown>;

  const code = response.code as number;
  if (code !== undefined && code !== 200) {
    const message = (response.message as string) || 'API error';
    throw new MiaoxiangError(ErrorCodes.API_ERROR, message, { code });
  }

  const answer = extractDisplayData(response);
  if (!answer) {
    throw new MiaoxiangError(
      ErrorCodes.EMPTY_RESPONSE,
      'No valid answer received'
    );
  }

  return answer;
}