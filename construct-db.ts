#!/usr/bin/env node
import fs from 'fs';
import winston from 'winston';
import { DateTime } from 'luxon';
import _ from 'lodash';

import { parseInt } from 'lodash';
import { Sequelize, STRING, INTEGER, NUMBER, DATEONLY } from 'sequelize';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ]
});

const getDatabaseName = (dataDirectory: string) => {
  return `${dataDirectory}/daily.db`;
}

const getBarModel = async (sequelize: Sequelize) => {
  const Bar = sequelize.define('daily_bars', {
    symbol: STRING,
    open: NUMBER,
    high: NUMBER,
    low: NUMBER,
    close: NUMBER,
    volume_weighted: INTEGER,
    n: INTEGER,
    // unix_time: INTEGER,
    date: DATEONLY
  });

  await sequelize.sync();

  return Bar;
}

const loadDb = async (dataDirectory: string) => {
  // if (fs.existsSync(storage)) {
    // fs.rmSync(storage);
  // }

  const storage = getDatabaseName(dataDirectory);

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    // https://sequelize.org/docs/v6/getting-started/#logging
    logging: false
  });

  await sequelize.authenticate();

  return sequelize;
}

export const buildDb = async (dataDirectory: string, start?: DateTime) => {
  const sequelize = await loadDb(dataDirectory);

  const Bar = await getBarModel(sequelize);

  const dir = '../data/1day';
  const dateFilenames = fs.readdirSync(dir);

  const filteredFiles = start ? dateFilenames.filter((d) => {
    const date = d.split('.csv')[0];

    if (DateTime.fromISO(date).startOf('day') <= start.startOf('day')) {
      return false;
    }

    return true;
  }) : dateFilenames;

  const beforeBars = await Bar.count();
  if (start) {
    await sequelize.query(`delete from daily_bars where date >= '${start.startOf('day').toFormat('yyyy-MM-dd')}'`);
  }

  await sequelize.query('PRAGMA synchronous = OFF');
  await sequelize.query('PRAGMA journal_mode = MEMORY');

  for (const dateFilename of filteredFiles) {
    const stocks = fs.readFileSync(`${dir}/${dateFilename}`).toString().split('\n').slice(1);
    const date = dateFilename.split('.csv')[0];
    const datetime = DateTime.fromISO(date);

    const transaction = await sequelize.transaction();
    for (const stock of stocks) {
      const [symbol, open, high, low, close, volume_weighted, n] = stock.split(',');
      // if (symbol !== 'SPY') {
      //   continue;
      // }

      await Bar.create({
        symbol,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        volume_weighted: parseInt(volume_weighted),
        n: parseInt(n),
        date
      });
    }

    logger.info(`Saved ${stocks.length} stocks under date ${dateFilename}`);
    await transaction.commit();
  }

  logger.info(`Before bars ${beforeBars}`);
  logger.info(`After bars ${await Bar.count()}`);

  sequelize.close();
}

const addIndexes = async (dataDirectory: string) => {
  const sequelize = await loadDb(dataDirectory);
  // const Bar = await getBarModel(sequelize);
  await sequelize.query(`create index idx_bar_date on daily_bars (date)`);
  await sequelize.query(`create index idx_symbol on daily_bars (symbol)`);
}

// buildDb(DateTime.now().minus({ months: 1 }));
// addIndexes()
