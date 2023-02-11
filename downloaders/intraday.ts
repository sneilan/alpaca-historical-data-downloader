import _ from 'lodash';
import { BarsV1Timeframe } from '@master-chief/alpaca';
import { DateTime } from 'luxon';
import glob from 'glob';
import fs from 'fs';
import { logger } from '../logger';
import { getAllBarsFromAlpaca, getTradeableAssets, mapTimeframeToDirName } from '../helpers';
import { alpaca } from '../environment';

const downloadAllIntradayBars = async (
  dataDirectory: string,
  symbol: string,
  start: DateTime,
  end: DateTime,
  timeframe: BarsV1Timeframe
) => {
  // logger.info(`Getting all ${timeframe} bars from alpaca for symbol ${symbol}`);
  // const bars = await getAllBarsFromAlpaca([symbol], timeframe, start.toJSDate(), end.toJSDate());
  // const barsGroupedByDate = _.groupBy(bars, x => {
  //   return x.t.toISOString().substring(0, 10);
  // });
  // for (const date in barsGroupedByDate) {
  //   const bars = _.sortBy(barsGroupedByDate[date], x => {
  //     return x.t.valueOf();
  //   });
  //   const directory = `${dataDirectory}/${mapTimeframeToDirName(timeframe)}/${date}/`;
  //   const file = `${directory}/${symbol}.csv`;
  //   fs.mkdirSync(directory, { recursive: true });
  //   const barData = _.map(bars, bar => {
  //     const time = bar.t.valueOf();
  //     return `${bar.o},${bar.h},${bar.l},${bar.c},${(bar as any).vw},${(bar as any).n},${time}`;
  //   }).join('\n');
  //   const barHeaders = `open,high,low,close,volume_weighted,n,unix_time`;
  //   const barFileContent = [barHeaders, barData].join('\n');
  //   try {
  //     fs.writeFileSync(file, barFileContent);
  //   } catch (err: unknown) {
  //     throw Error(`Unable to write csv ${file} - ${err}`);
  //   }
  // }
  // logger.info(`Downloaded ${bars.length} ${timeframe} bars for ${symbol}`);
};

export const syncLatestIntradayBars = async (dataDirectory: string, timeframe: BarsV1Timeframe) => {
  const tradeableSymbols = (await getTradeableAssets()).map(x => {
    return x.symbol;
  });

  const calendar = await alpaca.getCalendar({
    start: DateTime.now().minus({ years: 6 }).toJSDate(),
    end: DateTime.now().minus({ days: 1 }).toJSDate()
  });

  for (const s of tradeableSymbols) {
    logger.info(`Checking ${s} if it's up to date`);
    for (const c of calendar.reverse()) {
      const downloaded =
        glob.sync(`${dataDirectory}/${mapTimeframeToDirName(timeframe)}/${c.date}/${s}.csv`).length === 1;
      if (!downloaded) {
        logger.info(`Downloading ${timeframe} bars for ${s} from ${c.date} onwards.`);
        await downloadAllIntradayBars(
          dataDirectory,
          s,
          DateTime.fromISO(c.date),
          DateTime.now().minus({ minutes: 15 }),
          timeframe
        );
        break;
      }
    }

    logger.info(`Symbol ${s} is up to date.`);
  }
};
