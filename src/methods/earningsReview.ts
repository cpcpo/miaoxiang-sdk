import { apiRequest } from '../core/http';
import { MiaoxiangError, ErrorCodes } from '../core/errors';

export interface EarningsReviewResult {
  title: string;
  content: string;
  shareUrl?: string;
  files?: {
    pdf?: string;
    word?: string;
    dataSheet?: string;
  };
}

const EARNINGS_REVIEW_URL = 'app-robo-advisor-api/assistant/write/performance/comment';
const ENTITY_API = 'entity/dialogTagsV2';

const SUPPORTED_CLASS_CODES = new Set(['002001', '002003', '002004']);

interface EntityInfo {
  classCode: string;
  secuCode: string;
  marketChar: string;
  secuName: string;
  emCode: string;
}

async function resolveEntity(apiKey: string, query: string): Promise<EntityInfo> {
  const response = await apiRequest(apiKey, {
    url: ENTITY_API,
    body: { content: query },
    timeout: 30000,
  }) as Record<string, unknown>;

  if (response.message && response.status !== undefined && response.status !== 0) {
    throw new MiaoxiangError(ErrorCodes.API_ERROR, `Entity API error: ${response.message}`);
  }

  const data = response.data as Record<string, unknown> | undefined;
  if (!data) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'Entity resolution failed: no data returned');
  }

  let first: Record<string, unknown> | null = null;

  if (typeof data.entityMetricList === 'object' && Array.isArray(data.entityMetricList)) {
    const list = data.entityMetricList as Array<unknown>;
    if (list.length > 0 && Array.isArray(list[0]) && list[0].length > 0) {
      first = list[0][0] as Record<string, unknown>;
    }
  } else if (typeof data.entityList === 'object' && Array.isArray(data.entityList)) {
    const list = data.entityList as Array<unknown>;
    if (list.length > 0 && typeof list[0] === 'object') {
      first = list[0] as Record<string, unknown>;
    }
  } else if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object') {
      first = data[0] as Record<string, unknown>;
    }
  }

  if (!first) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'Entity not found');
  }

  const classCode = String(first.classCode || '');
  if (!SUPPORTED_CLASS_CODES.has(classCode)) {
    throw new MiaoxiangError(ErrorCodes.API_ERROR, `目前仅支持沪深京港美实体进行业绩点评 (classCode: ${classCode})`);
  }

  const secuCode = String(first.secuCode || '');
  if (!secuCode) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'Entity secuCode not found');
  }

  const marketChar = String(first.marketChar || '');
  const emCode = marketChar.startsWith('.') ? `${secuCode}${marketChar}` : `${secuCode}.${marketChar}`;

  return {
    classCode,
    secuCode,
    marketChar,
    secuName: String(first.shortName || ''),
    emCode,
  };
}

export interface EarningsReviewParams {
  query: string;
  reportDate?: string;
}

export async function earningsReview(
  apiKey: string,
  params: EarningsReviewParams
): Promise<EarningsReviewResult> {
  const entity = await resolveEntity(apiKey, params.query);

  const body: Record<string, unknown> = {
    query: entity.emCode,
    reportDate: params.reportDate || '',
  };

  const response = await apiRequest(apiKey, {
    url: EARNINGS_REVIEW_URL,
    body,
    headers: {
      'em_base_info': JSON.stringify({ productType: 'mx' }),
    },
    timeout: 1200000,
  }) as Record<string, unknown>;

  const data = response.data as Record<string, unknown> | undefined;
  if (!data) {
    throw new MiaoxiangError(ErrorCodes.EMPTY_RESPONSE, 'No earnings review data');
  }

  return {
    title: (data.title as string) || '',
    content: (data.content as string) || JSON.stringify(data),
    shareUrl: data.shareUrl as string | undefined,
    files: data.files as EarningsReviewResult['files'],
  };
}