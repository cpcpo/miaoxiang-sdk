import { MiaoxiangSDK } from '../src/core/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = (globalThis.process?.env?.EM_API_KEY as string | undefined) || '';
if (!apiKey) {
  console.log('⚠ EM_API_KEY not set, skipping integration tests');
  globalThis.process?.exit(0);
}

const sdk = new MiaoxiangSDK({ apiKey });

console.log('Running integration tests...\n');

async function testMethod(name: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('暂不支持') || msg.includes('不支持') || msg.includes('服务暂时')) {
      console.log(`⚠ ${name} not supported: ${msg.slice(0, 80)}`);
    } else {
      console.log(`✗ ${name} failed: ${msg.slice(0, 80)}`);
    }
  }
}

async function run() {
  await testMethod('financialAssistant', () =>
    sdk.financialAssistant('贵州茅台当前估值如何？').then(r => { if (!r) throw new Error('empty'); return r; })
  );

  await testMethod('stockDiagnosis', () =>
    sdk.stockDiagnosis('贵州茅台').then(r => { if (!r) throw new Error('empty'); return r; })
  );

  await testMethod('financialSearch', () =>
    sdk.financialSearch('寒武纪最新研报').then(r => { if (!r) throw new Error('empty'); return r; })
  );

  await testMethod('macroData', () =>
    sdk.macroData('中国GDP').then(r => { if (!r.rowCounts) throw new Error('empty'); return r; })
  );

  await testMethod('stockScreener', () =>
    sdk.stockScreener('市盈率低于15的银行股').then(r => { if (!r) throw new Error('empty'); return r; })
  );

  await testMethod('stockHotspot', () =>
    sdk.stockHotspot('今日热门板块').then(r => { if (!r) throw new Error('empty'); return r; })
  );

  await testMethod('fundDiagnosis', () =>
    sdk.fundDiagnosis('招商银行基金').then(r => { if (!r) throw new Error('empty'); return r; })
  );

  await testMethod('comparableAnalysis', () =>
    sdk.comparableAnalysis('宁德时代与比亚迪对比').then(r => { if (!r) throw new Error('empty'); return r; })
  );

  await testMethod('industryTracker', () =>
    sdk.industryTracker('新能源汽车').then(r => { if (!r) throw new Error('empty'); return r; })
  );

  await testMethod('industryResearch', () =>
    sdk.industryResearch('半导体行业').then(r => { if (!r) throw new Error('empty'); return r; })
  );

  await testMethod('earningsReview', () =>
    sdk.earningsReview('贵州茅台', '2024-12-31').then(r => { if (!r.content) throw new Error('empty'); return r; })
  );

  await testMethod('topicResearch', () =>
    sdk.topicResearch('AI算力').then(r => { if (!r) throw new Error('empty'); return r; })
  );

  await testMethod('initiationCoverage', () =>
    sdk.initiationCoverage('新股分析').then(r => { if (!r) throw new Error('empty'); return r; })
  );

  await testMethod('financeData', () =>
    sdk.financeData('贵州茅台最近一年的营业收入和净利润').then(r => { if (!r || !r.tables) throw new Error('empty'); return r; })
  );

  console.log('\nDone.');
}

run();
