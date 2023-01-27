import { AlpacaClient } from '@master-chief/alpaca';
import { find } from 'lodash';

const key = process.env.ALPACA_KEY;
const secret = process.env.ALPACA_SECRET;
if (!key || !secret) {
  throw Error(`Missing alpaca key or secret`);
}

const dataDirectoryArg = find(process.argv, x => {
  return x.includes('data-dir=');
})

// Don't end this with a slash. Should identify a folder not what's under the folder.
export const dataDirectory = dataDirectoryArg ? dataDirectoryArg.split('data-dir=')[1] : '../data';
// divide into temp & finalized
export const dailyBarHeaders = `symbol,open,high,low,close,volume_weighted,n`;

const credentials = {
  key,
  secret,
  paper: false
};

export const alpaca = new AlpacaClient({ credentials, rate_limit: true });
