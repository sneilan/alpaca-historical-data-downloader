import _ from 'lodash';
import { syncDailyBars } from './downloaders/daily';
import yargs from 'yargs/yargs';

const f = async () => {
  // @TODO work in progress.
  // await syncLatestIntradayBars('1Min');
  /*
  const argv = yargs(process.argv.slice(2)).options({
    start: {
      type: 'string'
    },
    end: {
      type: 'string'
    }
  }).parseSync();
  // @TODO param to do full sync.
  */

  await syncDailyBars();
}

f();
