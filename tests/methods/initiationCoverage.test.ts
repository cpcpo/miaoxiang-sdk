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
    const result = await sdk.initiationCoverage('新股分析');
    if (!result) {
      throw new Error('empty result');
    }
    console.log('✓ initiationCoverage passed');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('暂不支持') || msg.includes('不支持') || msg.includes('服务暂时')) {
      console.log(`⚠ initiationCoverage not supported: ${msg.slice(0, 80)}`);
    } else {
      console.log(`✗ initiationCoverage failed: ${msg}`);
      process.exit(1);
    }
  }
}

test();