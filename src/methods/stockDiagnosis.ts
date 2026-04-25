import { apiRequest, extractDisplayData } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const STOCK_DIAGNOSIS_URL = 'app-robo-advisor-api/assistant/stock-analysis';

export interface StockDiagnosisResult {
  content: string;
  raw?: unknown;
  outputPath?: string;
}

export async function stockDiagnosis(
  apiKey: string,
  query: string
): Promise<string> {
  const response = await apiRequest(apiKey, {
    url: STOCK_DIAGNOSIS_URL,
    body: { question: query },
  }) as Record<string, unknown>;

  const code = response.code as number | undefined;
  const status = response.status as number | undefined;
  const message = response.message as string | undefined;

  if (code !== undefined && code !== 200) {
    throw new MiaoxiangError(ErrorCodes.API_ERROR, message || `API error: code=${code}`);
  }
  if (status !== undefined && status < 0) {
    if (message?.includes('暂不支持') || message?.includes('不支持')) {
      throw new MiaoxiangError(ErrorCodes.API_ERROR, message);
    }
    throw new MiaoxiangError(ErrorCodes.API_ERROR, message || `API error: status=${status}`);
  }

  const content = extractDisplayData(response);
  if (!content || content === JSON.stringify(response)) {
    if (message) {
      throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, message);
    }
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No diagnosis content');
  }

  return content;
}