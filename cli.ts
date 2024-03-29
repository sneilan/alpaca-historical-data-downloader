#!/usr/bin/env node

import _ from 'lodash';
import { syncDailyBars } from './downloaders/1day';
import { program } from 'commander';
import { addIndexes, buildDb } from './construct-db';
import logger from './logger';
import { syncLatestIntradayBars } from './downloaders/intraday';
// import { getTradeableAssets } from './helpers';
// import { DateTime } from 'luxon';

const f = async () => {
  // by default if nothing in data directory, does full sync.
  // if there's data in the data directory, sync last 30 days.
  // for now no extra params. just run daily.

  program.option(
    '--start <startDate>',
    'Date in YYYY-MM-DD format to start downloading data from. Defaults to 5 days ago.',
    undefined
  );
  program.option('--end <endDate>', 'Date in YYYY-MM-DD format to download data to. Defaults to yesterday.', undefined);
  program.option(
    '--symbols [symbols...]',
    'List of symbols to ger data for in format of MSFT,AAPL,GLD defaults to all symbols.',
    undefined
  );

  program.option('--paper', 'Use paper trading data.', false);
  program.option('--data-dir <dir>', 'The directory to store historical data from alpaca', './data');
  program.option(
    '--construct-database',
    `Constructs a sqlite3 database file called daily.db inside of --data-dir from all 1day files.
    If daily.db already exists, updates file.`,
    false
  );

  program.option(
    '--add-indexes',
    `Add indexes to daily db database.`,
    false
  );

  program.option(
    '--download-1-min-bars',
    'Download 1 minute bars in --data-dir. By default syncs all minute bars from 6 years ago.',
    false
  );

  program.parse();
  const options = program.opts();
  if (options.constructDatabase) {
    logger.info(`Constructing SQL database in ${options.dataDir}/daily.db`);
    buildDb(options.dataDir);
    return;
  }

  if (options.addIndexes) {
    logger.info(`Add indexes to database ${options.dataDir}/daily.db`);
    addIndexes(options.dataDir);
    return;
  }
  if (options.download1MinBars) {
    logger.info(`Downloading 1 min bars`);
    syncLatestIntradayBars(options.dataDir, '1Min');
    return;
  }

  options.symbols = options.symbols ? (options.symbols as string[]) : undefined;
  await syncDailyBars(options as { dataDir: string; start?: string; end?: string; symbols?: string[] });
};
f();
