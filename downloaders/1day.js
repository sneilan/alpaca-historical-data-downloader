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
const luxon_1 = require("luxon");
const logger_1 = __importDefault(require("../logger"));
const helpers_1 = require("../helpers");
const fs_1 = __importDefault(require("fs"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const b1 = new cli_progress_1.default.SingleBar({
    format: ansi_colors_1.default.cyan('{bar}') +
        ' | {percentage}% | {symbol} {value}/{total} Symbols | Runtime: {duration_formatted} Eta: {eta_formatted}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});
// divide into temp & finalized
exports.dailyBarHeaders = `symbol,open,high,low,close,volume_weighted,n`;
// Delete the temp folder.
// Download all the daily bars into files into that temp folder
// merge the files.
const downloadAllDailyBarsIntoTempFiles = (symbols, start, end, tempDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    // logger.info(`Getting all daily bars from alpaca for symbol ${symbol}`);
    const timeframe = '1Day';
    const bars = yield (0, helpers_1.getAllBarsFromAlpaca)(symbols, timeframe, start.toJSDate(), end.minus({ days: 1 }).toJSDate());
    // {
    //   "t": "2022-04-11T04:00:00Z",
    //   "o": 168.77,
    //   "h": 169.03,
    //   "l": 166.1,
    //   "c": 166.975,
    //   "v": 40180280,
    //   "n": 435528,
    //   "vw": 167.08951
    // }
    // for (const bar of bars) {
    //   const date = bar.t.toISOString().split('T')[0];
    //   const file = `${tempDirectory}/${date}.csv`;
    //   fs.mkdirSync(tempDirectory, { recursive: true });
    //   const barData = `${symbol},${bar.o},${bar.h},${bar.l},${bar.c},${(bar as any).vw},${(bar as any).n}`;
    //   if (fs.existsSync(file)) {
    //     fs.appendFileSync(file, barData + '\n');
    //   } else {
    //     const barHeaders = `symbol,open,high,low,close,volume_weighted,n`;
    //     const barFileContent = [barHeaders, barData].join('\n');
    //     fs.writeFileSync(file, barFileContent + '\n');
    //   }
    // }
    // b1.increment(1, {
    //   symbol
    // });
    // logger.info(`Downloaded ${bars.length} ${timeframe} bars for ${symbol}`);
});
const mergeTempAndRegular = (directory, tempDirectory, mergeDirectory) => {
    if (!fs_1.default.existsSync(directory)) {
        fs_1.default.mkdirSync(directory, { recursive: true });
    }
    for (const f of fs_1.default.readdirSync(tempDirectory)) {
        const tempStockFile = `${tempDirectory}/${f}`;
        const stockFile = `${directory}/${f}`;
        const mergedStockFile = `${mergeDirectory}/${f}`;
        // logger.info(stockFile);
        if (fs_1.default.existsSync(stockFile)) {
            // logger.info(f);
            // slice skips the header row.
            const readSymbolsFromFileIntoDict = (filename) => {
                const stockData = fs_1.default.readFileSync(filename, { encoding: 'utf8' });
                const lines = stockData
                    .split('\n')
                    .filter(x => x != '')
                    .slice(1);
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
            // logger.info(`Copying ${tempStockFile} to ${stockFile}`);
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
const syncDailyBars = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { dataDirectory } = params;
    const directory = `${dataDirectory}/${(0, helpers_1.mapTimeframeToDirName)('1Day')}`;
    const tempDirectory = `${directory}.temp`;
    const mergeDirectory = `${directory}.merge`;
    // In case program died unexpectedly, run cleanup.
    (0, exports.cleanup)(tempDirectory, mergeDirectory);
    const tradeableSymbols = (yield (0, helpers_1.getTradeableAssets)()).map(x => {
        return x.symbol;
    });
    // Adjust to taste or set to many years ago if doing a full sync.
    const end = luxon_1.DateTime.now();
    let start = luxon_1.DateTime.now().minus({ days: 5 });
    if (!fs_1.default.existsSync(directory)) {
        start = luxon_1.DateTime.now().minus({ years: 6 });
    }
    logger_1.default.info(`Downloading 1Day bars since ${start.toRFC2822()})`);
    b1.start(tradeableSymbols.length, 0);
    // When downloading daily bars, first rm the existing days bars & then overwrite the bars.
    for (const s of tradeableSymbols) {
        // logger.info(`Downloading daily data for ${s} from ${start} onwards.`);
        yield downloadAllDailyBarsIntoTempFiles([s], start, end, tempDirectory);
        // @TODO provide a checksum that says if we have retrieved all bars instead of simply reporting it's up to date.
        // logger.info(`Symbol ${s} is up to date.`);
    }
    b1.stop();
    logger_1.default.info(`Merging alpaca temp files into main data folder...`);
    (0, exports.mergeTempAndRegular)(directory, tempDirectory, mergeDirectory);
    (0, exports.cleanup)(tempDirectory, mergeDirectory);
    logger_1.default.info(`Done!`);
});
exports.syncDailyBars = syncDailyBars;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIjFkYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHVEQUErQjtBQUMvQix3Q0FBNkY7QUFDN0YsNENBQW9CO0FBRXBCLGdFQUF1QztBQUN2Qyw4REFBaUM7QUFFakMsTUFBTSxFQUFFLEdBQUcsSUFBSSxzQkFBVyxDQUFDLFNBQVMsQ0FBQztJQUNuQyxNQUFNLEVBQ0oscUJBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3BCLDBHQUEwRztJQUM1RyxlQUFlLEVBQUUsUUFBUTtJQUN6QixpQkFBaUIsRUFBRSxRQUFRO0lBQzNCLFVBQVUsRUFBRSxJQUFJO0NBQ2pCLENBQUMsQ0FBQztBQUVILCtCQUErQjtBQUNsQixRQUFBLGVBQWUsR0FBRyw4Q0FBOEMsQ0FBQztBQUU5RSwwQkFBMEI7QUFDMUIsK0RBQStEO0FBQy9ELG1CQUFtQjtBQUVuQixNQUFNLGlDQUFpQyxHQUFHLENBQ3hDLE9BQWlCLEVBQ2pCLEtBQWUsRUFDZixHQUFhLEVBQ2IsYUFBcUIsRUFDckIsRUFBRTtJQUNGLDBFQUEwRTtJQUMxRSxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUM7SUFFekIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLDhCQUFvQixFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRWpILElBQUk7SUFDSixpQ0FBaUM7SUFDakMsaUJBQWlCO0lBQ2pCLGlCQUFpQjtJQUNqQixnQkFBZ0I7SUFDaEIsa0JBQWtCO0lBQ2xCLG1CQUFtQjtJQUNuQixpQkFBaUI7SUFDakIsb0JBQW9CO0lBQ3BCLElBQUk7SUFFSiw0QkFBNEI7SUFDNUIsb0RBQW9EO0lBQ3BELGlEQUFp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QUM7SUFDM0IsSUFBSSxLQUFLLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QyxJQUFJLENBQUMsWUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUM3QixLQUFLLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUM1QztJQUVELGdCQUFNLENBQUMsSUFBSSxDQUFDLCtCQUErQixLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pFLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXJDLDBGQUEwRjtJQUMxRixLQUFLLE1BQU0sQ0FBQyxJQUFJLGdCQUFnQixFQUFFO1FBQ2hDLHlFQUF5RTtRQUN6RSxNQUFNLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN4RSxnSEFBZ0g7UUFDaEgsNkNBQTZDO0tBQzlDO0lBRUQsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0lBRVYsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsQ0FBQztJQUNsRSxJQUFBLDJCQUFtQixFQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDOUQsSUFBQSxlQUFPLEVBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZDLGdCQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZCLENBQUMsQ0FBQSxDQUFDO0FBdENXLFFBQUEsYUFBYSxpQkFzQ3hCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tICdsdXhvbic7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBnZXRBbGxCYXJzRnJvbUFscGFjYSwgbWFwVGltZWZyYW1lVG9EaXJOYW1lLCBnZXRUcmFkZWFibGVBc3NldHMgfSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGNsaVByb2dyZXNzIGZyb20gJ2NsaS1wcm9ncmVzcyc7XG5pbXBvcnQgY29sb3JzIGZyb20gJ2Fuc2ktY29sb3JzJztcblxuY29uc3QgYjEgPSBuZXcgY2xpUHJvZ3Jlc3MuU2luZ2xlQmFyKHtcbiAgZm9ybWF0OlxuICAgIGNvbG9ycy5jeWFuKCd7YmFyfScpICtcbiAgICAnIHwge3BlcmNlbnRhZ2V9JSB8IHtzeW1ib2x9IHt2YWx1ZX0ve3RvdGFsfSBTeW1ib2xzIHwgUnVudGltZToge2R1cmF0aW9uX2Zvcm1hdHRlZH0gRXRhOiB7ZXRhX2Zvcm1hdHRlZH0nLFxuICBiYXJDb21wbGV0ZUNoYXI6ICdcXHUyNTg4JyxcbiAgYmFySW5jb21wbGV0ZUNoYXI6ICdcXHUyNTkxJyxcbiAgaGlkZUN1cnNvcjogdHJ1ZVxufSk7XG5cbi8vIGRpdmlkZSBpbnRvIHRlbXAgJiBmaW5hbGl6ZWRcbmV4cG9ydCBjb25zdCBkYWlseUJhckhlYWRlcnMgPSBgc3ltYm9sLG9wZW4saGlnaCxsb3csY2xvc2Usdm9sdW1lX3dlaWdodGVkLG5gO1xuXG4vLyBEZWxldGUgdGhlIHRlbXAgZm9sZGVyLlxuLy8gRG93bmxvYWQgYWxsIHRoZSBkYWlseSBiYXJzIGludG8gZmlsZXMgaW50byB0aGF0IHRlbXAgZm9sZGVyXG4vLyBtZXJnZSB0aGUgZmlsZXMuXG5cbmNvbnN0IGRvd25sb2FkQWxsRGFpbHlCYXJzSW50b1RlbXBGaWxlcyA9IGFzeW5jIChcbiAgc3ltYm9sczogc3RyaW5nW10sXG4gIHN0YXJ0OiBEYXRlVGltZSxcbiAgZW5kOiBEYXRlVGltZSxcbiAgdGVtcERpcmVjdG9yeTogc3RyaW5nXG4pID0+IHtcbiAgLy8gbG9nZ2VyLmluZm8oYEdldHRpbmcgYWxsIGRhaWx5IGJhcnMgZnJvbSBhbHBhY2EgZm9yIHN5bWJvbCAke3N5bWJvbH1gKTtcbiAgY29uc3QgdGltZWZyYW1lID0gJzFEYXknO1xuXG4gIGNvbnN0IGJhcnMgPSBhd2FpdCBnZXRBbGxCYXJzRnJvbUFscGFjYShzeW1ib2xzLCB0aW1lZnJhbWUsIHN0YXJ0LnRvSlNEYXRlKCksIGVuZC5taW51cyh7IGRheXM6IDEgfSkudG9KU0RhdGUoKSk7XG5cbiAgLy8ge1xuICAvLyAgIFwidFwiOiBcIjIwMjItMDQtMTFUMDQ6MDA6MDBaXCIsXG4gIC8vICAgXCJvXCI6IDE2OC43NyxcbiAgLy8gICBcImhcIjogMTY5LjAzLFxuICAvLyAgIFwibFwiOiAxNjYuMSxcbiAgLy8gICBcImNcIjogMTY2Ljk3NSxcbiAgLy8gICBcInZcIjogNDAxODAyODAsXG4gIC8vICAgXCJuXCI6IDQzNTUyOCxcbiAgLy8gICBcInZ3XCI6IDE2Ny4wODk1MVxuICAvLyB9XG5cbiAgLy8gZm9yIChjb25zdCBiYXIgb2YgYmFycykge1xuICAvLyAgIGNvbnN0IGRhdGUgPSBiYXIudC50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG4gIC8vICAgY29uc3QgZmlsZSA9IGAke3RlbXBEaXJlY3Rvcnl9LyR7ZGF0ZX0uY3N2YDtcblxuICAvLyAgIGZzLm1rZGlyU3luYyh0ZW1wRGlyZWN0b3J5LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAvLyAgIGNvbnN0IGJhckRhdGEgPSBgJHtzeW1ib2x9LCR7YmFyLm99LCR7YmFyLmh9LCR7YmFyLmx9LCR7YmFyLmN9LCR7KGJhciBhcyBhbnkpLnZ3fSwkeyhiYXIgYXMgYW55KS5ufWA7XG5cbiAgLy8gICBpZiAoZnMuZXhpc3RzU3luYyhmaWxlKSkge1xuICAvLyAgICAgZnMuYXBwZW5kRmlsZVN5bmMoZmlsZSwgYmFyRGF0YSArICdcXG4nKTtcbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgY29uc3QgYmFySGVhZGVycyA9IGBzeW1ib2wsb3BlbixoaWdoLGxvdyxjbG9zZSx2b2x1bWVfd2VpZ2h0ZWQsbmA7XG4gIC8vICAgICBjb25zdCBiYXJGaWxlQ29udGVudCA9IFtiYXJIZWFkZXJzLCBiYXJEYXRhXS5qb2luKCdcXG4nKTtcbiAgLy8gICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZSwgYmFyRmlsZUNvbnRlbnQgKyAnXFxuJyk7XG4gIC8vICAgfVxuICAvLyB9XG5cbiAgLy8gYjEuaW5jcmVtZW50KDEsIHtcbiAgLy8gICBzeW1ib2xcbiAgLy8gfSk7XG5cbiAgLy8gbG9nZ2VyLmluZm8oYERvd25sb2FkZWQgJHtiYXJzLmxlbmd0aH0gJHt0aW1lZnJhbWV9IGJhcnMgZm9yICR7c3ltYm9sfWApO1xufTtcblxuZXhwb3J0IGNvbnN0IG1lcmdlVGVtcEFuZFJlZ3VsYXIgPSAoZGlyZWN0b3J5OiBzdHJpbmcsIHRlbXBEaXJlY3Rvcnk6IHN0cmluZywgbWVyZ2VEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyZWN0b3J5KSkge1xuICAgIGZzLm1rZGlyU3luYyhkaXJlY3RvcnksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICB9XG5cbiAgZm9yIChjb25zdCBmIG9mIGZzLnJlYWRkaXJTeW5jKHRlbXBEaXJlY3RvcnkpKSB7XG4gICAgY29uc3QgdGVtcFN0b2NrRmlsZSA9IGAke3RlbXBEaXJlY3Rvcnl9LyR7Zn1gO1xuICAgIGNvbnN0IHN0b2NrRmlsZSA9IGAke2RpcmVjdG9yeX0vJHtmfWA7XG4gICAgY29uc3QgbWVyZ2VkU3RvY2tGaWxlID0gYCR7bWVyZ2VEaXJlY3Rvcnl9LyR7Zn1gO1xuXG4gICAgLy8gbG9nZ2VyLmluZm8oc3RvY2tGaWxlKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhzdG9ja0ZpbGUpKSB7XG4gICAgICAvLyBsb2dnZXIuaW5mbyhmKTtcblxuICAgICAgLy8gc2xpY2Ugc2tpcHMgdGhlIGhlYWRlciByb3cuXG4gICAgICBjb25zdCByZWFkU3ltYm9sc0Zyb21GaWxlSW50b0RpY3QgPSAoZmlsZW5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBzdG9ja0RhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcbiAgICAgICAgY29uc3QgbGluZXMgPSBzdG9ja0RhdGFcbiAgICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgLmZpbHRlcih4ID0+IHggIT0gJycpXG4gICAgICAgICAgLnNsaWNlKDEpO1xuICAgICAgICBjb25zdCBsaW5lc0J5U3ltYm9sID0gbGluZXMucmVkdWNlKChncm91cGluZywgbGluZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHN5bWJvbCA9IGxpbmUuc3BsaXQoJywnKVswXTtcbiAgICAgICAgICAvLyBDaG9vc2UgdG8gb3ZlcndyaXRlIGV4aXN0aW5nIGR1cGxpY2F0ZSBkYXRhIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgICAvLyBUaGUgbGF0ZXN0IHN0b2NrIGRhdGEgd2lsbCBhbHdheXMgYmUgbmVhciB0aGUgZW5kIG9mIHRoZSBmaWxlLlxuICAgICAgICAgIGdyb3VwaW5nW3N5bWJvbF0gPSBsaW5lO1xuICAgICAgICAgIHJldHVybiBncm91cGluZztcbiAgICAgICAgfSwge30gYXMgeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSk7XG4gICAgICAgIHJldHVybiBsaW5lc0J5U3ltYm9sO1xuICAgICAgfTtcblxuICAgICAgY29uc3Qgc3RvY2tTeW1ib2xzID0gcmVhZFN5bWJvbHNGcm9tRmlsZUludG9EaWN0KHN0b2NrRmlsZSk7XG4gICAgICBjb25zdCB0ZW1wU3RvY2tTeW1ib2xzID0gcmVhZFN5bWJvbHNGcm9tRmlsZUludG9EaWN0KHRlbXBTdG9ja0ZpbGUpO1xuICAgICAgLy8gTWVyZ2luZyBkaWN0aW9uYXJpZXMgbGlrZSB0aGlzIGJyaW5ncyBpbiBhbGwgdGhlIHN5bWJvbHMgZnJvbSBzdG9ja1N5bWJvbFxuICAgICAgLy8gQW5kIHRoZW4gb3ZlcndyaXRlcyB0aGVtIHdpdGggdGVtcFN0b2NrU3ltYm9sc1xuICAgICAgY29uc3QgbWVyZ2VkID0geyAuLi5zdG9ja1N5bWJvbHMsIC4uLnRlbXBTdG9ja1N5bWJvbHMgfTtcbiAgICAgIGNvbnN0IG1lcmdlZEZpbGVDb250ZW50ID0gT2JqZWN0LnZhbHVlcyhtZXJnZWQpLnNvcnQoKTtcblxuICAgICAgLy8gQFRPRE8gdGhpcyBpcyBwcm9iYWJseSBub3QgZWZmaWNpZW50LlxuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKG1lcmdlRGlyZWN0b3J5KSkge1xuICAgICAgICBmcy5ta2RpclN5bmMobWVyZ2VEaXJlY3RvcnksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfVxuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKG1lcmdlZFN0b2NrRmlsZSwgW2RhaWx5QmFySGVhZGVycywgLi4ubWVyZ2VkRmlsZUNvbnRlbnRdLmpvaW4oJ1xcbicpKTtcbiAgICAgIGZzLmNvcHlGaWxlU3luYyhtZXJnZWRTdG9ja0ZpbGUsIHN0b2NrRmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGxvZ2dlci5pbmZvKGBDb3B5aW5nICR7dGVtcFN0b2NrRmlsZX0gdG8gJHtzdG9ja0ZpbGV9YCk7XG4gICAgICBmcy5jb3B5RmlsZVN5bmModGVtcFN0b2NrRmlsZSwgc3RvY2tGaWxlKTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjbGVhbnVwID0gKHRlbXBEaXJlY3Rvcnk6IHN0cmluZywgbWVyZ2VEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBmcy5ybVN5bmModGVtcERpcmVjdG9yeSwgeyBmb3JjZTogdHJ1ZSwgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICBmcy5ybVN5bmMobWVyZ2VEaXJlY3RvcnksIHsgZm9yY2U6IHRydWUsIHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbn07XG5cbi8vIEl0J3MgcHJvYmFibHkgYmV0dGVyIHRvIHdyaXRlIHRvIGEgbmV3IGZpbGUgYW5kIHJlc29sdmUgdGhlIGZpbGVzIGxpbmUgYnkgbGluZS5cblxuZXhwb3J0IGNvbnN0IHN5bmNEYWlseUJhcnMgPSBhc3luYyAocGFyYW1zOiB7IGRhdGFEaXJlY3Rvcnk6IHN0cmluZyB9KSA9PiB7XG4gIGNvbnN0IHsgZGF0YURpcmVjdG9yeSB9ID0gcGFyYW1zO1xuXG4gIGNvbnN0IGRpcmVjdG9yeSA9IGAke2RhdGFEaXJlY3Rvcnl9LyR7bWFwVGltZWZyYW1lVG9EaXJOYW1lKCcxRGF5Jyl9YDtcbiAgY29uc3QgdGVtcERpcmVjdG9yeSA9IGAke2RpcmVjdG9yeX0udGVtcGA7XG4gIGNvbnN0IG1lcmdlRGlyZWN0b3J5ID0gYCR7ZGlyZWN0b3J5fS5tZXJnZWA7XG5cbiAgLy8gSW4gY2FzZSBwcm9ncmFtIGRpZWQgdW5leHBlY3RlZGx5LCBydW4gY2xlYW51cC5cbiAgY2xlYW51cCh0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG5cbiAgY29uc3QgdHJhZGVhYmxlU3ltYm9scyA9IChhd2FpdCBnZXRUcmFkZWFibGVBc3NldHMoKSkubWFwKHggPT4ge1xuICAgIHJldHVybiB4LnN5bWJvbDtcbiAgfSk7XG5cbiAgLy8gQWRqdXN0IHRvIHRhc3RlIG9yIHNldCB0byBtYW55IHllYXJzIGFnbyBpZiBkb2luZyBhIGZ1bGwgc3luYy5cbiAgY29uc3QgZW5kID0gRGF0ZVRpbWUubm93KCk7XG4gIGxldCBzdGFydCA9IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgZGF5czogNSB9KTtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcmVjdG9yeSkpIHtcbiAgICBzdGFydCA9IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgeWVhcnM6IDYgfSk7XG4gIH1cblxuICBsb2dnZXIuaW5mbyhgRG93bmxvYWRpbmcgMURheSBiYXJzIHNpbmNlICR7c3RhcnQudG9SRkMyODIyKCl9KWApO1xuICBiMS5zdGFydCh0cmFkZWFibGVTeW1ib2xzLmxlbmd0aCwgMCk7XG5cbiAgLy8gV2hlbiBkb3dubG9hZGluZyBkYWlseSBiYXJzLCBmaXJzdCBybSB0aGUgZXhpc3RpbmcgZGF5cyBiYXJzICYgdGhlbiBvdmVyd3JpdGUgdGhlIGJhcnMuXG4gIGZvciAoY29uc3QgcyBvZiB0cmFkZWFibGVTeW1ib2xzKSB7XG4gICAgLy8gbG9nZ2VyLmluZm8oYERvd25sb2FkaW5nIGRhaWx5IGRhdGEgZm9yICR7c30gZnJvbSAke3N0YXJ0fSBvbndhcmRzLmApO1xuICAgIGF3YWl0IGRvd25sb2FkQWxsRGFpbHlCYXJzSW50b1RlbXBGaWxlcyhbc10sIHN0YXJ0LCBlbmQsIHRlbXBEaXJlY3RvcnkpO1xuICAgIC8vIEBUT0RPIHByb3ZpZGUgYSBjaGVja3N1bSB0aGF0IHNheXMgaWYgd2UgaGF2ZSByZXRyaWV2ZWQgYWxsIGJhcnMgaW5zdGVhZCBvZiBzaW1wbHkgcmVwb3J0aW5nIGl0J3MgdXAgdG8gZGF0ZS5cbiAgICAvLyBsb2dnZXIuaW5mbyhgU3ltYm9sICR7c30gaXMgdXAgdG8gZGF0ZS5gKTtcbiAgfVxuXG4gIGIxLnN0b3AoKTtcblxuICBsb2dnZXIuaW5mbyhgTWVyZ2luZyBhbHBhY2EgdGVtcCBmaWxlcyBpbnRvIG1haW4gZGF0YSBmb2xkZXIuLi5gKTtcbiAgbWVyZ2VUZW1wQW5kUmVndWxhcihkaXJlY3RvcnksIHRlbXBEaXJlY3RvcnksIG1lcmdlRGlyZWN0b3J5KTtcbiAgY2xlYW51cCh0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG4gIGxvZ2dlci5pbmZvKGBEb25lIWApO1xufTtcbiJdfQ==