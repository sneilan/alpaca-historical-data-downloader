import { AlpacaClient } from '@master-chief/alpaca';
import Alpaca from '@alpacahq/alpaca-trade-api';

const key = process.env.ALPACA_KEY;
if (!key) {
  throw Error(`Missing alpaca key. Define ALPACA_KEY in your environment.`);
}

const secret = process.env.ALPACA_SECRET;
if (!secret) {
  throw Error(`Missing alpaca secret. Define ALPACA_SECRET in your environment.`);
}

const credentials = {
  key,
  secret,
  paper: false
};

export const alpaca = new AlpacaClient({ credentials, rate_limit: true });
export const alpacaJs = new Alpaca({ keyId: key, secretKey: secret, paper: false });
