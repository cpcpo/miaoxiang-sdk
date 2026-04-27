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
    const result = await sdk.topicResearch('AI算力');
    if (!result) {
      throw new Error('empty result');
    }
    console.log('✓ topicResearch passed');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('暂不支持') || msg.includes('不支持') || msg.includes('服务暂时')) {
      console.log(`⚠ topicResearch not supported: ${msg.slice(0, 80)}`);
    } else {
      console.log(`✗ topicResearch failed: ${msg}`);
      process.exit(1);
    }
  }
}

test();