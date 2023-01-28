#!/usr/bin/env node

import _ from 'lodash';
import { syncDailyBars } from './downloaders/1day';
import { program } from 'commander';
import { buildDb } from './construct-db';
import logger from './logger';

const f = async () => {
  // by default if nothing in data directory, does full sync.
  // if there's data in the data directory, sync last 30 days.
  // for now no extra params. just run daily.
  
  // program.option('--paper', 'Use paper trading data.', false);
  program.option('--data-dir <dir>', 'The directory to store historical data from alpaca', './data');
  program.option('--construct-database', `Constructs a sqlite3 database file called daily.db inside of --data-dir from all 1day files.
    If daily.db already exists, updates file.`, false);
  program.parse();

  const options = program.opts();
  if (options.constructDatabase) {
    logger.info(`Constructing SQL database in ${options.dataDir}/daily.db`);
    buildDb(options.dataDir);
    return;
  }

  await syncDailyBars(options.dataDir);
}

f();
