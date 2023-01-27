import _ from 'lodash';
import { syncDailyBars } from './downloaders/1day';

const f = async () => {
  // by default if nothing in data directory, does full sync.
  // if there's data in the data directory, sync last 30 days.
  // for now no extra params. just run daily.
  
  await syncDailyBars();
}

f();
