import { apiRequest } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const STOCK_SCREENER_URL = 'b/mcp/tool/selectSecurity';

export async function stockScreener(
  apiKey: string,
  query: string
): Promise<string> {
  const response = await apiRequest(apiKey, {
    url: STOCK_SCREENER_URL,
    body: {
      query,
      toolContext: {
        callId: `call_${Date.now().toString(16)}`,
        userInfo: { userId: `user_${Date.now().toString(16)}` }
      }
    },
  }) as Record<string, unknown>;

  const data = response.data as Record<string, unknown> | undefined;

  const message = data?.message as string | undefined;
  if (message?.includes('暂不支持') || message?.includes('数据量已达到上限')) {
    throw new MiaoxiangError(ErrorCodes.API_ERROR, message);
  }

  const partialResults = data?.partialResults as string | undefined;
  if (partialResults && partialResults.trim()) {
    return partialResults;
  }

  const allResults = data?.allResults as Record<string, unknown> | undefined;
  const result = allResults?.result as Record<string, unknown> | undefined;
  const dataList = result?.dataList as Array<Record<string, unknown>> | undefined;
  const columns = result?.columns as Array<Record<string, unknown>> | undefined;

  if (dataList?.length && columns?.length) {
    const columnMap = new Map(
      columns.map(c => [c.key as string, c.title as string])
    );
    const keys = columns.map(c => c.key as string);

    const header = keys.map(k => columnMap.get(k) || k).join(' | ');
    const separator = keys.map(() => '---').join(' | ');
    const rows = dataList.slice(0, 20).map(row =>
      keys.map(k => String(row[k] ?? '')).join(' | ')
    ).join('\n');

    return `| ${header}\n| ${separator}\n| ${rows}`;
  }

  const securityCount = data?.securityCount as number | undefined;
  if (securityCount === 0) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, `No stocks match the query: ${query}`);
  }

  throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No screening results');
}