import _ from 'lodash';
import { BarsV1Timeframe } from '@master-chief/alpaca';
import logger from './logger'
import { alpaca } from './env';

export const mapTimeframeToDirName = (timeframe: BarsV1Timeframe) => {
  return timeframe.toLowerCase();
}

export const getAllBarsFromAlpaca = async (
  symbol: string,
  timeframe: BarsV1Timeframe,
  start: Date,
  end: Date
) => {
  logger.info(`Grabbing first page of ${timeframe} bars for ${symbol}`);
  let resp = await alpaca.getBars({ symbol, start, end, timeframe }).catch(e => {
    logger.info(e);
    throw Error(`Issue with getting bars for symbol ${symbol} on ${timeframe}. Error is ${e}`);
  });

  if (!resp) {
    return [];
  }
  let bars = resp.bars;

  let page_token = resp.next_page_token;

  // until the next token we receive is null
  while (page_token != null) {
    logger.info(`Grabbing more data from ${timeframe} bars ${page_token} from ${symbol}`);
    let resp = await alpaca.getBars({ symbol, start, end, timeframe, page_token }).catch(e => {
      logger.error('Issue with paginated getting bars', e);
      return;
    });

    if (!resp) {
      return [];
    }

    bars = [...bars, ...resp.bars];
    page_token = resp.next_page_token;
  }

  return bars;
};

export const getTradeableAssets = async () => {
  try {
    const assets = await alpaca.getAssets();
    return assets.filter(x => {
      return x.tradable && !x.symbol.includes('/')
    });
  } catch (e: unknown) {
    logger.error(`Could not get tradeable assets from alpaca. error is ${e}`);
    throw Error()
  }
}
