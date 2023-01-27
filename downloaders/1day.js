"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDailyBars = exports.cleanup = exports.mergeTempAndRegular = exports.dailyBarHeaders = void 0;
const logger_1 = __importDefault(require("../logger"));
const helpers_1 = require("../helpers");
const fs_1 = __importDefault(require("fs"));
// divide into temp & finalized
exports.dailyBarHeaders = `symbol,open,high,low,close,volume_weighted,n`;
// Delete the temp folder.
// Download all the daily bars into files into that temp folder
// merge the files.
const downloadAllDailyBarsIntoTempFiles = (symbol, start, end, tempDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Getting all daily bars from alpaca for symbol ${symbol}`);
    const timeframe = '1Day';
    const bars = yield (0, helpers_1.getAllBarsFromAlpaca)(symbol, timeframe, start.toJSDate(), end.minus({ days: 1 }).toJSDate());
    for (const bar of bars) {
        const date = bar.t.toISOString().split('T')[0];
        const file = `${tempDirectory}/${date}.csv`;
        fs_1.default.mkdirSync(tempDirectory, { recursive: true });
        const barData = `${symbol},${bar.o},${bar.h},${bar.l},${bar.c},${bar.vw},${bar.n}`;
        if (fs_1.default.existsSync(file)) {
            fs_1.default.appendFileSync(file, barData + '\n');
        }
        else {
            const barHeaders = `symbol,open,high,low,close,volume_weighted,n`;
            const barFileContent = [barHeaders, barData].join('\n');
            fs_1.default.writeFileSync(file, barFileContent + '\n');
        }
    }
    logger_1.default.info(`Downloaded ${bars.length} ${timeframe} bars for ${symbol}`);
});
const mergeTempAndRegular = (directory, tempDirectory, mergeDirectory) => {
    if (!fs_1.default.existsSync(directory)) {
        fs_1.default.mkdirSync(directory, { recursive: true });
    }
    for (const f of fs_1.default.readdirSync(tempDirectory)) {
        const tempStockFile = `${tempDirectory}/${f}`;
        const stockFile = `${directory}/${f}`;
        const mergedStockFile = `${mergeDirectory}/${f}`;
        logger_1.default.info(stockFile);
        if (fs_1.default.existsSync(stockFile)) {
            logger_1.default.info(f);
            // slice skips the header row.
            const readSymbolsFromFileIntoDict = (filename) => {
                const stockData = fs_1.default.readFileSync(filename, { encoding: 'utf8' });
                const lines = stockData.split('\n').filter(x => x != '').slice(1);
                const linesBySymbol = lines.reduce((grouping, line) => {
                    const symbol = line.split(',')[0];
                    // Choose to overwrite existing duplicate data if it exists.
                    // The latest stock data will always be near the end of the file.
                    grouping[symbol] = line;
                    return grouping;
                }, {});
                return linesBySymbol;
            };
            const stockSymbols = readSymbolsFromFileIntoDict(stockFile);
            const tempStockSymbols = readSymbolsFromFileIntoDict(tempStockFile);
            // Merging dictionaries like this brings in all the symbols from stockSymbol
            // And then overwrites them with tempStockSymbols
            const merged = Object.assign(Object.assign({}, stockSymbols), tempStockSymbols);
            const mergedFileContent = Object.values(merged).sort();
            // @TODO this is probably not efficient.
            if (!fs_1.default.existsSync(mergeDirectory)) {
                fs_1.default.mkdirSync(mergeDirectory, { recursive: true });
            }
            fs_1.default.writeFileSync(mergedStockFile, [exports.dailyBarHeaders, ...mergedFileContent].join('\n'));
            fs_1.default.copyFileSync(mergedStockFile, stockFile);
        }
        else {
            logger_1.default.info(`Copying ${tempStockFile} to ${stockFile}`);
            fs_1.default.copyFileSync(tempStockFile, stockFile);
        }
    }
};
exports.mergeTempAndRegular = mergeTempAndRegular;
const cleanup = (tempDirectory, mergeDirectory) => {
    fs_1.default.rmSync(tempDirectory, { force: true, recursive: true });
    fs_1.default.rmSync(mergeDirectory, { force: true, recursive: true });
};
exports.cleanup = cleanup;
// It's probably better to write to a new file and resolve the files line by line.
const syncDailyBars = (dataDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    const directory = `${dataDirectory}/${(0, helpers_1.mapTimeframeToDirName)('1Day')}`;
    const tempDirectory = `${directory}.temp`;
    const mergeDirectory = `${directory}.merge`;
    (0, exports.mergeTempAndRegular)(directory, tempDirectory, mergeDirectory);
    (0, exports.cleanup)(tempDirectory, mergeDirectory);
    /*
    // In case program died unexpectedly, run cleanup.
    cleanup(tempDirectory, mergeDirectory);
  
    const tradeableSymbols = (await getTradeableAssets()).map(x => {
      return x.symbol;
    });
  
    // Adjust to taste or set to many years ago if doing a full sync.
    const end = DateTime.now();
    let start = DateTime.now().minus({ months: 1 });
    if (!fs.existsSync(directory)) {
      start = DateTime.now().minus({ years: 6 });
    }
  
    // When downloading daily bars, first rm the existing days bars & then overwrite the bars.
    for (const s of tradeableSymbols) {
      logger.info(`Downloading daily data for ${s} from ${start} onwards.`);
      await downloadAllDailyBarsIntoTempFiles(s, start, end, tempDirectory);
      // @TODO provide a checksum that says if we have retrieved all bars instead of simply reporting it's up to date.
      // logger.info(`Symbol ${s} is up to date.`);
    }
  
    mergeTempAndRegular(directory, tempDirectory, mergeDirectory);
    cleanup(tempDirectory, mergeDirectory);
    */
});
exports.syncDailyBars = syncDailyBars;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIjFkYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsdURBQStCO0FBQy9CLHdDQUE2RjtBQUM3Riw0Q0FBb0I7QUFHcEIsK0JBQStCO0FBQ2xCLFFBQUEsZUFBZSxHQUFHLDhDQUE4QyxDQUFDO0FBRTlFLDBCQUEwQjtBQUMxQiwrREFBK0Q7QUFDL0QsbUJBQW1CO0FBRW5CLE1BQU0saUNBQWlDLEdBQUcsQ0FBTyxNQUFjLEVBQUUsS0FBZSxFQUFFLEdBQWEsRUFBRSxhQUFxQixFQUFFLEVBQUU7SUFDeEgsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsaURBQWlELE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDdkUsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDO0lBRXpCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSw4QkFBb0IsRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUVoSCxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtRQUN0QixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxNQUFNLElBQUksR0FBRyxHQUFHLGFBQWEsSUFBSSxJQUFJLE1BQU0sQ0FBQztRQUU1QyxZQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRS9DLE1BQU0sT0FBTyxHQUFHLEdBQUcsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJ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QUM7SUFDdEUsTUFBTSxhQUFhLEdBQUcsR0FBRyxTQUFTLE9BQU8sQ0FBQztJQUMxQyxNQUFNLGNBQWMsR0FBRyxHQUFHLFNBQVMsUUFBUSxDQUFDO0lBQzVDLElBQUEsMkJBQW1CLEVBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUM5RCxJQUFBLGVBQU8sRUFBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFdkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUF5QkU7QUFDSixDQUFDLENBQUEsQ0FBQTtBQWpDWSxRQUFBLGFBQWEsaUJBaUN6QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSAnbHV4b24nO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgZ2V0QWxsQmFyc0Zyb21BbHBhY2EsIG1hcFRpbWVmcmFtZVRvRGlyTmFtZSwgZ2V0VHJhZGVhYmxlQXNzZXRzIH0gZnJvbSAnLi4vaGVscGVycyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuLy8gZGl2aWRlIGludG8gdGVtcCAmIGZpbmFsaXplZFxuZXhwb3J0IGNvbnN0IGRhaWx5QmFySGVhZGVycyA9IGBzeW1ib2wsb3BlbixoaWdoLGxvdyxjbG9zZSx2b2x1bWVfd2VpZ2h0ZWQsbmA7XG5cbi8vIERlbGV0ZSB0aGUgdGVtcCBmb2xkZXIuXG4vLyBEb3dubG9hZCBhbGwgdGhlIGRhaWx5IGJhcnMgaW50byBmaWxlcyBpbnRvIHRoYXQgdGVtcCBmb2xkZXJcbi8vIG1lcmdlIHRoZSBmaWxlcy5cblxuY29uc3QgZG93bmxvYWRBbGxEYWlseUJhcnNJbnRvVGVtcEZpbGVzID0gYXN5bmMgKHN5bWJvbDogc3RyaW5nLCBzdGFydDogRGF0ZVRpbWUsIGVuZDogRGF0ZVRpbWUsIHRlbXBEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBsb2dnZXIuaW5mbyhgR2V0dGluZyBhbGwgZGFpbHkgYmFycyBmcm9tIGFscGFjYSBmb3Igc3ltYm9sICR7c3ltYm9sfWApO1xuICBjb25zdCB0aW1lZnJhbWUgPSAnMURheSc7XG5cbiAgY29uc3QgYmFycyA9IGF3YWl0IGdldEFsbEJhcnNGcm9tQWxwYWNhKHN5bWJvbCwgdGltZWZyYW1lLCBzdGFydC50b0pTRGF0ZSgpLCBlbmQubWludXMoeyBkYXlzOiAxIH0pLnRvSlNEYXRlKCkpO1xuXG4gIGZvciAoY29uc3QgYmFyIG9mIGJhcnMpIHtcbiAgICBjb25zdCBkYXRlID0gYmFyLnQudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdO1xuICAgIGNvbnN0IGZpbGUgPSBgJHt0ZW1wRGlyZWN0b3J5fS8ke2RhdGV9LmNzdmA7XG5cbiAgICBmcy5ta2RpclN5bmModGVtcERpcmVjdG9yeSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cbiAgICAgIGNvbnN0IGJhckRhdGEgPSBgJHtzeW1ib2x9LCR7YmFyLm99LCR7YmFyLmh9LCR7YmFyLmx9LCR7YmFyLmN9LCR7KGJhciBhcyBhbnkpLnZ3fSwkeyhiYXIgYXMgYW55KS5ufWA7XG5cbiAgICBpZiAoZnMuZXhpc3RzU3luYyhmaWxlKSkge1xuICAgICAgZnMuYXBwZW5kRmlsZVN5bmMoZmlsZSwgYmFyRGF0YSArICdcXG4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYmFySGVhZGVycyA9IGBzeW1ib2wsb3BlbixoaWdoLGxvdyxjbG9zZSx2b2x1bWVfd2VpZ2h0ZWQsbmA7XG4gICAgICBjb25zdCBiYXJGaWxlQ29udGVudCA9IFtiYXJIZWFkZXJzLCBiYXJEYXRhXS5qb2luKCdcXG4nKTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZSwgYmFyRmlsZUNvbnRlbnQgKyAnXFxuJyk7XG4gICAgfVxuICB9XG5cbiAgbG9nZ2VyLmluZm8oYERvd25sb2FkZWQgJHtiYXJzLmxlbmd0aH0gJHt0aW1lZnJhbWV9IGJhcnMgZm9yICR7c3ltYm9sfWApO1xufVxuXG5leHBvcnQgY29uc3QgbWVyZ2VUZW1wQW5kUmVndWxhciA9IChkaXJlY3Rvcnk6IHN0cmluZywgdGVtcERpcmVjdG9yeTogc3RyaW5nLCBtZXJnZURpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gIGlmICghZnMuZXhpc3RzU3luYyhkaXJlY3RvcnkpKSB7XG4gICAgZnMubWtkaXJTeW5jKGRpcmVjdG9yeSwge3JlY3Vyc2l2ZTogdHJ1ZX0pO1xuICB9XG5cbiAgZm9yIChjb25zdCBmIG9mIGZzLnJlYWRkaXJTeW5jKHRlbXBEaXJlY3RvcnkpKSB7XG4gICAgY29uc3QgdGVtcFN0b2NrRmlsZSA9IGAke3RlbXBEaXJlY3Rvcnl9LyR7Zn1gO1xuICAgIGNvbnN0IHN0b2NrRmlsZSA9IGAke2RpcmVjdG9yeX0vJHtmfWA7XG4gICAgY29uc3QgbWVyZ2VkU3RvY2tGaWxlID0gYCR7bWVyZ2VEaXJlY3Rvcnl9LyR7Zn1gXG5cbiAgICBsb2dnZXIuaW5mbyhzdG9ja0ZpbGUpO1xuICAgIGlmIChmcy5leGlzdHNTeW5jKHN0b2NrRmlsZSkpIHtcbiAgICAgIGxvZ2dlci5pbmZvKGYpO1xuXG4gICAgICAvLyBzbGljZSBza2lwcyB0aGUgaGVhZGVyIHJvdy5cbiAgICAgIGNvbnN0IHJlYWRTeW1ib2xzRnJvbUZpbGVJbnRvRGljdCA9IChmaWxlbmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b2NrRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pO1xuICAgICAgICBjb25zdCBsaW5lcyA9IHN0b2NrRGF0YS5zcGxpdCgnXFxuJykuZmlsdGVyKHggPT4geCAhPSAnJykuc2xpY2UoMSk7XG4gICAgICAgIGNvbnN0IGxpbmVzQnlTeW1ib2wgPSBsaW5lcy5yZWR1Y2UoKGdyb3VwaW5nLCBsaW5lKSA9PiB7XG4gICAgICAgICAgY29uc3Qgc3ltYm9sID0gbGluZS5zcGxpdCgnLCcpWzBdXG4gICAgICAgICAgLy8gQ2hvb3NlIHRvIG92ZXJ3cml0ZSBleGlzdGluZyBkdXBsaWNhdGUgZGF0YSBpZiBpdCBleGlzdHMuXG4gICAgICAgICAgLy8gVGhlIGxhdGVzdCBzdG9jayBkYXRhIHdpbGwgYWx3YXlzIGJlIG5lYXIgdGhlIGVuZCBvZiB0aGUgZmlsZS5cbiAgICAgICAgICBncm91cGluZ1tzeW1ib2xdID0gbGluZTtcbiAgICAgICAgICByZXR1cm4gZ3JvdXBpbmc7XG4gICAgICAgIH0sIHt9IGFzIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0pXG4gICAgICAgIHJldHVybiBsaW5lc0J5U3ltYm9sO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzdG9ja1N5bWJvbHMgPSByZWFkU3ltYm9sc0Zyb21GaWxlSW50b0RpY3Qoc3RvY2tGaWxlKTtcbiAgICAgIGNvbnN0IHRlbXBTdG9ja1N5bWJvbHMgPSByZWFkU3ltYm9sc0Zyb21GaWxlSW50b0RpY3QodGVtcFN0b2NrRmlsZSk7XG4gICAgICAvLyBNZXJnaW5nIGRpY3Rpb25hcmllcyBsaWtlIHRoaXMgYnJpbmdzIGluIGFsbCB0aGUgc3ltYm9scyBmcm9tIHN0b2NrU3ltYm9sXG4gICAgICAvLyBBbmQgdGhlbiBvdmVyd3JpdGVzIHRoZW0gd2l0aCB0ZW1wU3RvY2tTeW1ib2xzXG4gICAgICBjb25zdCBtZXJnZWQgPSB7IC4uLnN0b2NrU3ltYm9scywgLi4udGVtcFN0b2NrU3ltYm9scyB9O1xuICAgICAgY29uc3QgbWVyZ2VkRmlsZUNvbnRlbnQgPSBPYmplY3QudmFsdWVzKG1lcmdlZCkuc29ydCgpO1xuXG4gICAgICAvLyBAVE9ETyB0aGlzIGlzIHByb2JhYmx5IG5vdCBlZmZpY2llbnQuXG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMobWVyZ2VEaXJlY3RvcnkpKSB7XG4gICAgICAgIGZzLm1rZGlyU3luYyhtZXJnZURpcmVjdG9yeSwge3JlY3Vyc2l2ZTogdHJ1ZX0pO1xuICAgICAgfVxuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKG1lcmdlZFN0b2NrRmlsZSwgW2RhaWx5QmFySGVhZGVycywgLi4ubWVyZ2VkRmlsZUNvbnRlbnRdLmpvaW4oJ1xcbicpKTtcbiAgICAgIGZzLmNvcHlGaWxlU3luYyhtZXJnZWRTdG9ja0ZpbGUsIHN0b2NrRmlsZSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2VyLmluZm8oYENvcHlpbmcgJHt0ZW1wU3RvY2tGaWxlfSB0byAke3N0b2NrRmlsZX1gKTtcbiAgICAgIGZzLmNvcHlGaWxlU3luYyh0ZW1wU3RvY2tGaWxlLCBzdG9ja0ZpbGUpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgY2xlYW51cCA9ICh0ZW1wRGlyZWN0b3J5OiBzdHJpbmcsIG1lcmdlRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgZnMucm1TeW5jKHRlbXBEaXJlY3RvcnksIHsgZm9yY2U6IHRydWUsIHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgZnMucm1TeW5jKG1lcmdlRGlyZWN0b3J5LCB7IGZvcmNlOiB0cnVlLCByZWN1cnNpdmU6IHRydWUgfSk7XG59XG5cbi8vIEl0J3MgcHJvYmFibHkgYmV0dGVyIHRvIHdyaXRlIHRvIGEgbmV3IGZpbGUgYW5kIHJlc29sdmUgdGhlIGZpbGVzIGxpbmUgYnkgbGluZS5cblxuZXhwb3J0IGNvbnN0IHN5bmNEYWlseUJhcnMgPSBhc3luYyAoZGF0YURpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGRpcmVjdG9yeSA9IGAke2RhdGFEaXJlY3Rvcnl9LyR7bWFwVGltZWZyYW1lVG9EaXJOYW1lKCcxRGF5Jyl9YDtcbiAgY29uc3QgdGVtcERpcmVjdG9yeSA9IGAke2RpcmVjdG9yeX0udGVtcGA7XG4gIGNvbnN0IG1lcmdlRGlyZWN0b3J5ID0gYCR7ZGlyZWN0b3J5fS5tZXJnZWA7XG4gIG1lcmdlVGVtcEFuZFJlZ3VsYXIoZGlyZWN0b3J5LCB0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG4gIGNsZWFudXAodGVtcERpcmVjdG9yeSwgbWVyZ2VEaXJlY3RvcnkpO1xuXG4gIC8qXG4gIC8vIEluIGNhc2UgcHJvZ3JhbSBkaWVkIHVuZXhwZWN0ZWRseSwgcnVuIGNsZWFudXAuXG4gIGNsZWFudXAodGVtcERpcmVjdG9yeSwgbWVyZ2VEaXJlY3RvcnkpO1xuXG4gIGNvbnN0IHRyYWRlYWJsZVN5bWJvbHMgPSAoYXdhaXQgZ2V0VHJhZGVhYmxlQXNzZXRzKCkpLm1hcCh4ID0+IHtcbiAgICByZXR1cm4geC5zeW1ib2w7XG4gIH0pO1xuXG4gIC8vIEFkanVzdCB0byB0YXN0ZSBvciBzZXQgdG8gbWFueSB5ZWFycyBhZ28gaWYgZG9pbmcgYSBmdWxsIHN5bmMuXG4gIGNvbnN0IGVuZCA9IERhdGVUaW1lLm5vdygpO1xuICBsZXQgc3RhcnQgPSBEYXRlVGltZS5ub3coKS5taW51cyh7IG1vbnRoczogMSB9KTtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcmVjdG9yeSkpIHtcbiAgICBzdGFydCA9IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgeWVhcnM6IDYgfSk7XG4gIH1cblxuICAvLyBXaGVuIGRvd25sb2FkaW5nIGRhaWx5IGJhcnMsIGZpcnN0IHJtIHRoZSBleGlzdGluZyBkYXlzIGJhcnMgJiB0aGVuIG92ZXJ3cml0ZSB0aGUgYmFycy5cbiAgZm9yIChjb25zdCBzIG9mIHRyYWRlYWJsZVN5bWJvbHMpIHtcbiAgICBsb2dnZXIuaW5mbyhgRG93bmxvYWRpbmcgZGFpbHkgZGF0YSBmb3IgJHtzfSBmcm9tICR7c3RhcnR9IG9ud2FyZHMuYCk7XG4gICAgYXdhaXQgZG93bmxvYWRBbGxEYWlseUJhcnNJbnRvVGVtcEZpbGVzKHMsIHN0YXJ0LCBlbmQsIHRlbXBEaXJlY3RvcnkpO1xuICAgIC8vIEBUT0RPIHByb3ZpZGUgYSBjaGVja3N1bSB0aGF0IHNheXMgaWYgd2UgaGF2ZSByZXRyaWV2ZWQgYWxsIGJhcnMgaW5zdGVhZCBvZiBzaW1wbHkgcmVwb3J0aW5nIGl0J3MgdXAgdG8gZGF0ZS5cbiAgICAvLyBsb2dnZXIuaW5mbyhgU3ltYm9sICR7c30gaXMgdXAgdG8gZGF0ZS5gKTtcbiAgfVxuXG4gIG1lcmdlVGVtcEFuZFJlZ3VsYXIoZGlyZWN0b3J5LCB0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG4gIGNsZWFudXAodGVtcERpcmVjdG9yeSwgbWVyZ2VEaXJlY3RvcnkpO1xuICAqL1xufVxuIl19