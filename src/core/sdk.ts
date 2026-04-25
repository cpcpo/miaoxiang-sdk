import { MiaoxiangError, ErrorCodes } from './errors';

import { financialAssistant, FinancialAssistantOptions } from '../methods/financialAssistant';
import { stockDiagnosis } from '../methods/stockDiagnosis';
import { stockHotspot } from '../methods/stockHotspot';
import { financialSearch } from '../methods/financialSearch';
import { fundDiagnosis } from '../methods/fundDiagnosis';
import { macroData, MacroDataResult } from '../methods/macroData';
import { stockScreener } from '../methods/stockScreener';
import { comparableAnalysis } from '../methods/comparableAnalysis';
import { industryTracker } from '../methods/industryTracker';
import { earningsReview, EarningsReviewResult } from '../methods/earningsReview';
import { industryResearch } from '../methods/industryResearch';
import { topicResearch } from '../methods/topicResearch';
import { initiationCoverage } from '../methods/initiationCoverage';

export interface SDKConfig {
  apiKey: string;
}

export class MiaoxiangSDK {
  private apiKey: string;

  constructor(config: SDKConfig) {
    if (!config.apiKey) {
      throw new MiaoxiangError(ErrorCodes.BAD_REQUEST, 'apiKey is required');
    }
    this.apiKey = config.apiKey;
  }

  async financialAssistant(query: string, options?: FinancialAssistantOptions): Promise<string> {
    return financialAssistant(this.apiKey, query, options);
  }

  async stockDiagnosis(query: string): Promise<string> {
    return stockDiagnosis(this.apiKey, query);
  }

  async stockHotspot(query: string): Promise<string> {
    return stockHotspot(this.apiKey, query);
  }

  async financialSearch(query: string): Promise<string> {
    return financialSearch(this.apiKey, query);
  }

  async fundDiagnosis(query: string): Promise<string> {
    return fundDiagnosis(this.apiKey, query);
  }

  async macroData(query: string): Promise<MacroDataResult> {
    return macroData(this.apiKey, query);
  }

  async stockScreener(query: string): Promise<string> {
    return stockScreener(this.apiKey, query);
  }

  async comparableAnalysis(query: string): Promise<string> {
    return comparableAnalysis(this.apiKey, query);
  }

  async industryTracker(query: string): Promise<string> {
    return industryTracker(this.apiKey, query);
  }

  async industryResearch(query: string): Promise<string> {
    return industryResearch(this.apiKey, query);
  }

  async earningsReview(query: string, reportDate?: string): Promise<EarningsReviewResult> {
    return earningsReview(this.apiKey, { query, reportDate });
  }

  async topicResearch(query: string): Promise<string> {
    return topicResearch(this.apiKey, query);
  }

  async initiationCoverage(query: string): Promise<string> {
    return initiationCoverage(this.apiKey, query);
  }
}
