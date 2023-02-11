#!/usr/bin/env node

import _ from 'lodash';
import { syncDailyBars } from './downloaders/1day';
import { program } from 'commander';
import { buildDb } from './construct-db';
import logger from './logger';
import { syncLatestIntradayBars } from './downloaders/intraday';
import { alpacaJs } from './environment';
import { getTradeableAssets } from './helpers';
import { DateTime } from 'luxon';

const f = async () => {
  // by default if nothing in data directory, does full sync.
  // if there's data in the data directory, sync last 30 days.
  // for now no extra params. just run daily.

  // const symbols = ['AAPL', 'GOOG'];
  const symbols = (await getTradeableAssets()).map(x => x.symbol).slice(0, 1000);
  // const bars = await alpacaJs.getMultiBarsV2(symbols, {});
  const bars2 = alpacaJs.getMultiBarsAsyncV2(symbols, {
    start: DateTime.now().minus({ days: 30 }).toISODate(),
    end: DateTime.now().minus({ days: 1 }).toISODate(),
    timeframe: alpacaJs.newTimeframe(1, alpacaJs.timeframeUnit.DAY)
  });
  const symbolsDownloaded: string[] = [];
  let totalBars = 0;
  do {
    const blah = await bars2.next();
    if (blah.done) {
      break;
    }

    totalBars += 1;
    // console.log(blah.value.Symbol);
    if (!symbolsDownloaded.includes(blah.value.Symbol)) {
      symbolsDownloaded.push(blah.value.Symbol);
    }
  } while (true);

  console.log(symbols.length);
  console.log(symbolsDownloaded.length);
  // If you are missing symbols, it's because we do not have data for that symbol in IEX.

  // Missing data for the following symbols
  for (const symbol of symbols) {
    if (!symbolsDownloaded.includes(symbol)) {
      console.log(symbol);
    }
  }

  // // program.option('--paper', 'Use paper trading data.', false);
  // program.option('--data-dir <dir>', 'The directory to store historical data from alpaca', './data');
  // program.option(
  //   '--construct-database',
  //   `Constructs a sqlite3 database file called daily.db inside of --data-dir from all 1day files.
  //   If daily.db already exists, updates file.`,
  //   false
  // );
  // program.option(
  //   '--download-1-min-bars',
  //   'Download 1 minute bars in --data-dir. By default syncs all minute bars from 6 years ago.',
  //   false
  // );
  // program.parse();

  // const options = program.opts();
  // if (options.constructDatabase) {
  //   logger.info(`Constructing SQL database in ${options.dataDir}/daily.db`);
  //   buildDb(options.dataDir);
  //   return;
  // }

  // if (options.download1MinBars) {
  //   logger.info(`Downloading 1 min bars`);
  //   syncLatestIntradayBars(options.dataDir, '1Min');
  //   return;
  // }

  // await syncDailyBars(options.dataDir);
};
f();
