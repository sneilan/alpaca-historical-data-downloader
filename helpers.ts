import _ from 'lodash';
import logger from './logger';
import { alpaca, alpacaJs } from './environment';
import { TimeFrameUnit } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { Adjustment, GetBarsParams } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/rest_v2';

export type timeframe = 'hour' | 'min' | 'day' | 'week' | 'month';

export const getTimeFrame = (amount: number, unit: timeframe) => {
  const timeframeMap: { [frame in timeframe]: TimeFrameUnit } = {
    hour: TimeFrameUnit.HOUR,
    day: TimeFrameUnit.DAY,
    min: TimeFrameUnit.MIN,
    week: TimeFrameUnit.WEEK,
    month: TimeFrameUnit.MONTH
  };
  return alpacaJs.newTimeframe(amount, timeframeMap[unit]);
};

export const mapTimeframeToDirName = (timeframe: string) => {
  return timeframe.toLowerCase();
};

export async function* getAllBarsFromAlpaca(symbols: string[], start: Date, end: Date, timeframe: string) {
  const barParams: GetBarsParams = {
    // Needs to be in YYYY-MM-DD format per https://www.npmjs.com/package/@alpacahq/alpaca-trade-api
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    timeframe,
    adjustment: Adjustment.SPLIT
  };

  const barsGenerator = alpacaJs.getMultiBarsAsyncV2(symbols, barParams);

  do {
    const bar = await barsGenerator.next();

    if (bar.done) {
      return;
    }

    yield bar.value;
  } while (true);
}

export const getTradeableAssets = async () => {
  try {
    const assets = await alpaca.getAssets();
    return assets.filter(x => {
      return x.tradable && !x.symbol.includes('/');
    });
  } catch (e: unknown) {
    logger.error(`Could not get tradeable assets from alpaca. error is ${e}`);
    throw Error();
  }
};
