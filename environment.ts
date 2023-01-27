import { AlpacaClient } from '@master-chief/alpaca';

const key = process.env.ALPACA_KEY;
const secret = process.env.ALPACA_SECRET;
if (!key || !secret) {
  throw Error(`Missing alpaca key or secret`);
}

const credentials = {
  key,
  secret,
  paper: false
};

export const alpaca = new AlpacaClient({ credentials, rate_limit: true });
