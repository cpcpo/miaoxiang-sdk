import { MiaoxiangSDK } from '../../src/core/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.EM_API_KEY;
if (!apiKey) {
  console.log('⚠ EM_API_KEY not set, skipping test');
  process.exit(0);
}

const sdk = new MiaoxiangSDK({ apiKey });

async function test() {
  try {
    const result = await sdk.financeData('贵州茅台最近一年的营业收入和净利润');
    if (!result || !result.tables) {
      throw new Error('empty result');
    }
    console.log('✓ financeData passed');
    console.log(`  tables: ${result.tables.length}, rowCount: ${result.rowCount}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('暂不支持') || msg.includes('不支持') || msg.includes('服务暂时')) {
      console.log(`⚠ financeData not supported: ${msg.slice(0, 80)}`);
    } else {
      console.log(`✗ financeData failed: ${msg}`);
      process.exit(1);
    }
  }
}

test();