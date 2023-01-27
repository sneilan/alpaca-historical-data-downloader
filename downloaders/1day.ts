import { DateTime } from 'luxon';
import logger from '../logger';
import { getAllBarsFromAlpaca, mapTimeframeToDirName, getTradeableAssets } from '../helpers';
import fs from 'fs';
import _ from 'lodash';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';

const b1 = new cliProgress.SingleBar({
  format: colors.cyan('{bar}') + ' | {percentage}% | {symbol} {value}/{total} Symbols | Runtime: {duration_formatted} Eta: {eta_formatted}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
});

const start = DateTime.now();

// divide into temp & finalized
export const dailyBarHeaders = `symbol,open,high,low,close,volume_weighted,n`;

// Delete the temp folder.
// Download all the daily bars into files into that temp folder
// merge the files.

const downloadAllDailyBarsIntoTempFiles = async (symbol: string, start: DateTime, end: DateTime, tempDirectory: string) => {
  // logger.info(`Getting all daily bars from alpaca for symbol ${symbol}`);
  const timeframe = '1Day';

  const bars = await getAllBarsFromAlpaca(symbol, timeframe, start.toJSDate(), end.minus({ days: 1 }).toJSDate());

  for (const bar of bars) {
    const date = bar.t.toISOString().split('T')[0];
    const file = `${tempDirectory}/${date}.csv`;

    fs.mkdirSync(tempDirectory, { recursive: true });

    const barData = `${symbol},${bar.o},${bar.h},${bar.l},${bar.c},${(bar as any).vw},${(bar as any).n}`;

    if (fs.existsSync(file)) {
      fs.appendFileSync(file, barData + '\n');
    } else {
      const barHeaders = `symbol,open,high,low,close,volume_weighted,n`;
      const barFileContent = [barHeaders, barData].join('\n');
      fs.writeFileSync(file, barFileContent + '\n');
    }
  }

  b1.increment(1, {
    symbol
  });

  // logger.info(`Downloaded ${bars.length} ${timeframe} bars for ${symbol}`);
}

export const mergeTempAndRegular = (directory: string, tempDirectory: string, mergeDirectory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {recursive: true});
  }

  for (const f of fs.readdirSync(tempDirectory)) {
    const tempStockFile = `${tempDirectory}/${f}`;
    const stockFile = `${directory}/${f}`;
    const mergedStockFile = `${mergeDirectory}/${f}`

    // logger.info(stockFile);
    if (fs.existsSync(stockFile)) {
      // logger.info(f);

      // slice skips the header row.
      const readSymbolsFromFileIntoDict = (filename: string) => {
        const stockData = fs.readFileSync(filename, { encoding: 'utf8' });
        const lines = stockData.split('\n').filter(x => x != '').slice(1);
        const linesBySymbol = lines.reduce((grouping, line) => {
          const symbol = line.split(',')[0]
          // Choose to overwrite existing duplicate data if it exists.
          // The latest stock data will always be near the end of the file.
          grouping[symbol] = line;
          return grouping;
        }, {} as { [key: string]: string })
        return linesBySymbol;
      }

      const stockSymbols = readSymbolsFromFileIntoDict(stockFile);
      const tempStockSymbols = readSymbolsFromFileIntoDict(tempStockFile);
      // Merging dictionaries like this brings in all the symbols from stockSymbol
      // And then overwrites them with tempStockSymbols
      const merged = { ...stockSymbols, ...tempStockSymbols };
      const mergedFileContent = Object.values(merged).sort();

      // @TODO this is probably not efficient.
      if (!fs.existsSync(mergeDirectory)) {
        fs.mkdirSync(mergeDirectory, {recursive: true});
      }

      fs.writeFileSync(mergedStockFile, [dailyBarHeaders, ...mergedFileContent].join('\n'));
      fs.copyFileSync(mergedStockFile, stockFile);

    } else {
      // logger.info(`Copying ${tempStockFile} to ${stockFile}`);
      fs.copyFileSync(tempStockFile, stockFile);
    }
  }
}

export const cleanup = (tempDirectory: string, mergeDirectory: string) => {
  fs.rmSync(tempDirectory, { force: true, recursive: true });
  fs.rmSync(mergeDirectory, { force: true, recursive: true });
}

// It's probably better to write to a new file and resolve the files line by line.

export const syncDailyBars = async (dataDirectory: string) => {

  const directory = `${dataDirectory}/${mapTimeframeToDirName('1Day')}`;
  const tempDirectory = `${directory}.temp`;
  const mergeDirectory = `${directory}.merge`;

  // In case program died unexpectedly, run cleanup.
  cleanup(tempDirectory, mergeDirectory);

  const tradeableSymbols = (await getTradeableAssets()).map(x => {
    return x.symbol;
  });

  b1.start(tradeableSymbols.length, 0, {
    speed: "N/A"
  });

  // Adjust to taste or set to many years ago if doing a full sync.
  const end = DateTime.now();
  let start = DateTime.now().minus({ months: 1 });
  if (!fs.existsSync(directory)) {
    start = DateTime.now().minus({ years: 6 });
  }

  // When downloading daily bars, first rm the existing days bars & then overwrite the bars.
  for (const s of tradeableSymbols) {
    // logger.info(`Downloading daily data for ${s} from ${start} onwards.`);
    await downloadAllDailyBarsIntoTempFiles(s, start, end, tempDirectory);
    // @TODO provide a checksum that says if we have retrieved all bars instead of simply reporting it's up to date.
    // logger.info(`Symbol ${s} is up to date.`);
  }

  b1.stop();

  logger.info(`Merging alpaca temp files into main data folder...`)
  mergeTempAndRegular(directory, tempDirectory, mergeDirectory);
  cleanup(tempDirectory, mergeDirectory);
  logger.info(`Done!`)
}
