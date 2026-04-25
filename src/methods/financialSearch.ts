import { apiRequest } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const FINANCIAL_SEARCH_URL = 'b/mcp/tool/searchNews';

export async function financialSearch(
  apiKey: string,
  query: string
): Promise<string> {
  const response = await apiRequest(apiKey, {
    url: FINANCIAL_SEARCH_URL,
    body: {
      query,
      toolContext: {
        callId: `call_${Date.now().toString(16)}`,
        userInfo: { userId: `user_${Date.now().toString(16)}` }
      }
    },
  }) as Record<string, unknown>;

  const data = response.data as Record<string, unknown> | undefined;
  const llmSearchResponse = data?.llmSearchResponse;
  const searchResponse = data?.searchResponse;

  if (typeof llmSearchResponse === 'string') return llmSearchResponse;
  if (typeof llmSearchResponse === 'object' && llmSearchResponse !== null) {
    return JSON.stringify(llmSearchResponse, null, 2);
  }
  if (typeof searchResponse === 'string') return searchResponse;
  if (typeof searchResponse === 'object' && searchResponse !== null) {
    return JSON.stringify(searchResponse, null, 2);
  }

  const message = response.message as string | undefined;
  if (message) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, message);
  }

  throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No search results');
}