import { apiRequest } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

const MACRO_DATA_URL = 'b/mcp/tool/searchMacroData';

export interface MacroDataResult {
  csvPaths: string[];
  descriptionPath?: string;
  rowCounts: Record<string, number>;
  message?: string;
  error?: string;
  data?: Array<{
    entityName: string;
    frequency: string;
    headers: string[];
    rows: Array<Record<string, string>>;
  }>;
}

export async function macroData(
  apiKey: string,
  query: string
): Promise<MacroDataResult> {
  const callId = `call_${Date.now().toString(16)}`;
  const userId = `user_${Date.now().toString(16)}`;

  const response = await apiRequest(apiKey, {
    url: MACRO_DATA_URL,
    body: {
      query,
      toolContext: {
        callId,
        userInfo: { userId }
      }
    },
  }) as Record<string, unknown>;

  const data = response.data as Record<string, unknown> | undefined;
  if (!data) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No macro data received');
  }

  const dataTables = data.dataTables as Array<Record<string, unknown>> | undefined;
  const message = data.message as string | undefined;

  if (!dataTables || !Array.isArray(dataTables)) {
    const msg = message || 'Unable to parse macro data';
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, msg);
  }

  const frequencyGroups: Record<string, { headers: string[]; rows: Array<Record<string, string>> }> = {};

  if (dataTables && Array.isArray(dataTables)) {
    for (const table of dataTables) {
      const entityName = (table.entityName as string) || '';
      const tableData = table.table as Record<string, unknown> | undefined;
      const nameMap = table.nameMap as Record<string, string> || {};

      if (!tableData) continue;

      const frequency = entityName.includes('年') ? 'yearly' :
                       entityName.includes('季度') || entityName.includes('季') ? 'quarterly' :
                       entityName.includes('月') ? 'monthly' :
                       entityName.includes('周') ? 'weekly' :
                       entityName.includes('日') ? 'daily' : 'unknown';

      const rawHeaders = tableData.headName as string[] || [];
      const headers = ['entity_name', 'indicator_name', 'indicator_code', 'frequency', ...rawHeaders];

      const metricKeys = Object.keys(tableData).filter(k => k !== 'headName' && k !== 'headNameSub');
      const rows: Array<Record<string, string>> = [];

      for (const key of metricKeys) {
        const values = tableData[key] as string[] || [];
        if (values.length === 0) continue;

        const indicatorName = nameMap[key] || key;
        const row: Record<string, string> = {
          entity_name: entityName,
          indicator_name: indicatorName,
          indicator_code: key,
          frequency,
        };

        for (let j = 0; j < rawHeaders.length; j++) {
          row[rawHeaders[j]] = values[j] || '';
        }
        rows.push(row);
      }

      if (rows.length > 0) {
        if (!frequencyGroups[frequency]) {
          frequencyGroups[frequency] = { headers, rows: [] };
        }
        frequencyGroups[frequency].rows.push(...rows);
      }
    }
  }

  const rowCounts: Record<string, number> = {};
  for (const [freq, group] of Object.entries(frequencyGroups)) {
    rowCounts[freq] = group.rows.length;
  }

  const result: MacroDataResult = {
    csvPaths: [],
    rowCounts,
    message: message || (Object.keys(frequencyGroups).length > 0 ? `Received ${Object.keys(frequencyGroups).length} frequency group(s)` : undefined),
  };

  if (Object.keys(frequencyGroups).length > 0) {
    result.data = Object.entries(frequencyGroups).map(([frequency, group]) => ({
      entityName: group.rows[0]?.entity_name || '',
      frequency,
      headers: group.headers,
      rows: group.rows,
    }));
  } else if (message) {
    result.error = message;
  }

  return result;
}