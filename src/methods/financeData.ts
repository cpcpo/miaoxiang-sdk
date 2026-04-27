import { apiRequest } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const FINANCE_DATA_URL = 'b/mcp/tool/searchData';

export async function financeData(
  apiKey: string,
  query: string
): Promise<{
  tables: Array<{
    entityName: string;
    title: string;
    headers: string[];
    rows: Array<Record<string, string>>;
  }>;
  rowCount: number;
  message?: string;
  error?: string;
}> {
  const callId = `call_${Date.now().toString(16)}`;
  const userId = `user_${Date.now().toString(16)}`;

  const response = await apiRequest(apiKey, {
    url: FINANCE_DATA_URL,
    body: {
      query,
      toolContext: {
        callId,
        userInfo: { userId },
      },
    },
  }) as Record<string, unknown>;

  const data = response.data as Record<string, unknown> | undefined;
  if (!data) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No finance data received');
  }

  const message = data.message as string | undefined;

  // 提取 dataTableDTOList
  const dtoList = _extractDataTableDTOList(data);
  if (!dtoList) {
    const errMsg = message || 'No dataTableDTOList in response';
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, errMsg);
  }

  const tables: Array<{
    entityName: string;
    title: string;
    headers: string[];
    rows: Array<Record<string, string>>;
  }> = [];

  let totalRowCount = 0;

  for (const dto of dtoList) {
    if (!dto || typeof dto !== 'object') continue;

    const entityName = String(dto.entityName || '');
    const title = String(dto.title || dto.inputTitle || entityName);

    const tableData = (dto.table || {}) as Record<string, unknown>;
    const nameMap = (dto.nameMap || {}) as Record<string, string>;

    const headers = (tableData.headName as string[]) || [];
    const indicatorOrder = (dto.indicatorOrder as string[]) || [];

    // 收集所有非 headName 的键作为指标
    const metricKeys = Object.keys(tableData).filter(k => k !== 'headName' && k !== 'headNameSub');

    // 按 indicatorOrder 排序
    const orderedKeys = _orderKeys(metricKeys, indicatorOrder);

    const rows: Array<Record<string, string>> = [];
    for (const key of orderedKeys) {
      const values = (tableData[key] as string[]) || [];
      const label = nameMap[key] || key;

      // 横向拼接：entityName + 所有 header 值
      const row: Record<string, string> = {
        [entityName || 'indicator']: label,
      };
      for (let i = 0; i < headers.length; i++) {
        row[headers[i]] = values[i] || '';
      }
      rows.push(row);
    }

    if (rows.length > 0) {
      tables.push({
        entityName,
        title,
        headers: [entityName || 'indicator', ...headers],
        rows,
      });
      totalRowCount += rows.length;
    }
  }

  const result: {
    tables: Array<{
      entityName: string;
      title: string;
      headers: string[];
      rows: Array<Record<string, string>>;
    }>;
    rowCount: number;
    message?: string;
  } = {
    tables,
    rowCount: totalRowCount,
  };

  if (message) {
    result.message = message;
  }

  return result;
}

function _extractDataTableDTOList(data: Record<string, unknown>): Array<Record<string, unknown>> | null {
  // 兼容多种路径
  const searchResult = data.searchDataResultDTO as Record<string, unknown> | undefined;
  if (searchResult?.dataTableDTOList) {
    return searchResult.dataTableDTOList as Array<Record<string, unknown>>;
  }
  if (data.dataTableDTOList) {
    return data.dataTableDTOList as Array<Record<string, unknown>>;
  }
  return null;
}

function _orderKeys(keys: string[], order: string[]): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();
  for (const k of order) {
    if (keys.includes(k) && !seen.has(k)) {
      ordered.push(k);
      seen.add(k);
    }
  }
  for (const k of keys) {
    if (!seen.has(k)) {
      ordered.push(k);
      seen.add(k);
    }
  }
  return ordered;
}