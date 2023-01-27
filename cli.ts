#!/usr/bin/env node

import _ from 'lodash';
import { syncDailyBars } from './downloaders/1day';
import { program } from 'commander';

const f = async () => {
  // by default if nothing in data directory, does full sync.
  // if there's data in the data directory, sync last 30 days.
  // for now no extra params. just run daily.
  
  // program.option('--paper', 'Use paper trading data.', false);
  program.option('--data-dir <dir>', 'The directory to store historical data from alpaca', './data');
  program.parse();

  const options = program.opts();
  await syncDailyBars(options.dataDir);
}

f();
