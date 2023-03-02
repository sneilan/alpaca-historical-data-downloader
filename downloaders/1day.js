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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
    var e_1, _a;
    // @TODO If user has a better subscription, they can get data up until current date.
    if (end.diffNow().days < 1) {
        end = luxon_1.DateTime.now().minus({ days: 1 });
    }
    end = luxon_1.DateTime.now();
    const barsIterator = (0, helpers_1.getAllBarsFromAlpaca)(symbols, start.toJSDate(), end.toJSDate(), (0, helpers_1.getTimeFrame)(1, 'day'));
    try {
        for (var barsIterator_1 = __asyncValues(barsIterator), barsIterator_1_1; barsIterator_1_1 = yield barsIterator_1.next(), !barsIterator_1_1.done;) {
            const bar = barsIterator_1_1.value;
            // @TODO check timestamp format.
            // console.log(bar.Timestamp);
            const date = bar.Timestamp.split('T')[0];
            const file = `${tempDirectory}/${date}.csv`;
            fs_1.default.mkdirSync(tempDirectory, { recursive: true });
            const barData = `${bar.Symbol},${bar.OpenPrice},${bar.HighPrice},${bar.LowPrice},${bar.ClosePrice},${bar.VWAP},${bar.TradeCount}`;
            if (fs_1.default.existsSync(file)) {
                fs_1.default.appendFileSync(file, barData + '\n');
            }
            else {
                const barHeaders = `symbol,open,high,low,close,volume_weighted,n`;
                const barFileContent = [barHeaders, barData].join('\n');
                fs_1.default.writeFileSync(file, barFileContent + '\n');
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (barsIterator_1_1 && !barsIterator_1_1.done && (_a = barsIterator_1.return)) yield _a.call(barsIterator_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    // b1.increment(1, {
    //   barsymbol
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
    const { dataDir } = params;
    const directory = `${dataDir}/${(0, helpers_1.mapTimeframeToDirName)('1Day')}`;
    const tempDirectory = `${directory}.temp`;
    const mergeDirectory = `${directory}.merge`;
    // In case program died unexpectedly, run cleanup.
    (0, exports.cleanup)(tempDirectory, mergeDirectory);
    let tradeableSymbols = params.symbols;
    if (!tradeableSymbols) {
        tradeableSymbols = (yield (0, helpers_1.getTradeableAssets)()).map(x => {
            return x.symbol;
        });
    }
    // Adjust to taste or set to many years ago if doing a full sync.
    let end = luxon_1.DateTime.now();
    if (params.end) {
        end = luxon_1.DateTime.fromFormat(params.end, 'yyyy-MM-dd');
    }
    let start = luxon_1.DateTime.now().minus({ days: 5 });
    if (!fs_1.default.existsSync(directory)) {
        start = luxon_1.DateTime.now().minus({ years: 6 });
    }
    if (params.start) {
        start = luxon_1.DateTime.fromFormat(params.start, 'yyyy-MM-dd');
    }
    logger_1.default.info(`Downloading 1Day bars since ${start.toRFC2822()})`);
    b1.start(tradeableSymbols.length, 0);
    // When downloading daily bars, first rm the existing days bars & then overwrite the bars.
    // logger.info(`Downloading daily data for ${s} from ${start} onwards.`);
    yield downloadAllDailyBarsIntoTempFiles(tradeableSymbols, start, end, tempDirectory);
    // @TODO provide a checksum that says if we have retrieved all bars instead of simply reporting it's up to date.
    // logger.info(`Symbol ${s} is up to date.`);
    b1.stop();
    logger_1.default.info(`Merging alpaca temp files into main data folder...`);
    (0, exports.mergeTempAndRegular)(directory, tempDirectory, mergeDirectory);
    (0, exports.cleanup)(tempDirectory, mergeDirectory);
    logger_1.default.info(`Done!`);
});
exports.syncDailyBars = syncDailyBars;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIjFkYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyx1REFBK0I7QUFDL0Isd0NBQTJHO0FBQzNHLDRDQUFvQjtBQUVwQixnRUFBdUM7QUFDdkMsOERBQWlDO0FBRWpDLE1BQU0sRUFBRSxHQUFHLElBQUksc0JBQVcsQ0FBQyxTQUFTLENBQUM7SUFDbkMsTUFBTSxFQUNKLHFCQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNwQiwwR0FBMEc7SUFDNUcsZUFBZSxFQUFFLFFBQVE7SUFDekIsaUJBQWlCLEVBQUUsUUFBUTtJQUMzQixVQUFVLEVBQUUsSUFBSTtDQUNqQixDQUFDLENBQUM7QUFFSCwrQkFBK0I7QUFDbEIsUUFBQSxlQUFlLEdBQUcsOENBQThDLENBQUM7QUFFOUUsMEJBQTBCO0FBQzFCLCtEQUErRDtBQUMvRCxtQkFBbUI7QUFFbkIsTUFBTSxpQ0FBaUMsR0FBRyxDQUN4QyxPQUFpQixFQUNqQixLQUFlLEVBQ2YsR0FBYSxFQUNiLGFBQXFCLEVBQ3JCLEVBQUU7SUFDRiwwRUFBMEU7O0lBRTFFLG9GQUFvRjtJQUNwRixJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO1FBQzFCLEdBQUcsR0FBRyxnQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ3ZDO0lBQ0QsR0FBRyxHQUFHLGdCQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDckIsTUFBTSxZQUFZLEdBQUcsSUFBQSw4QkFBb0IsRUFDdkMsT0FBTyxFQUNQLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFDaEIsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUNkLElBQUEsc0JBQVksRUFBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQ3ZCLENB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RUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QyxJQUFJLENBQUMsWUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUM3QixLQUFLLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUM1QztJQUNELElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtRQUNoQixLQUFLLEdBQUcsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQTtLQUN4RDtJQUVELGdCQUFNLENBQUMsSUFBSSxDQUFDLCtCQUErQixLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pFLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXJDLDBGQUEwRjtJQUN4Rix5RUFBeUU7SUFDekUsTUFBTSxpQ0FBaUMsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3JGLGdIQUFnSDtJQUNoSCw2Q0FBNkM7SUFFL0MsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0lBRVYsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsQ0FBQztJQUNsRSxJQUFBLDJCQUFtQixFQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDOUQsSUFBQSxlQUFPLEVBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZDLGdCQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZCLENBQUMsQ0FBQSxDQUFDO0FBN0NXLFFBQUEsYUFBYSxpQkE2Q3hCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tICdsdXhvbic7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBnZXRBbGxCYXJzRnJvbUFscGFjYSwgbWFwVGltZWZyYW1lVG9EaXJOYW1lLCBnZXRUcmFkZWFibGVBc3NldHMsIGdldFRpbWVGcmFtZSB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgY2xpUHJvZ3Jlc3MgZnJvbSAnY2xpLXByb2dyZXNzJztcbmltcG9ydCBjb2xvcnMgZnJvbSAnYW5zaS1jb2xvcnMnO1xuXG5jb25zdCBiMSA9IG5ldyBjbGlQcm9ncmVzcy5TaW5nbGVCYXIoe1xuICBmb3JtYXQ6XG4gICAgY29sb3JzLmN5YW4oJ3tiYXJ9JykgK1xuICAgICcgfCB7cGVyY2VudGFnZX0lIHwge3N5bWJvbH0ge3ZhbHVlfS97dG90YWx9IFN5bWJvbHMgfCBSdW50aW1lOiB7ZHVyYXRpb25fZm9ybWF0dGVkfSBFdGE6IHtldGFfZm9ybWF0dGVkfScsXG4gIGJhckNvbXBsZXRlQ2hhcjogJ1xcdTI1ODgnLFxuICBiYXJJbmNvbXBsZXRlQ2hhcjogJ1xcdTI1OTEnLFxuICBoaWRlQ3Vyc29yOiB0cnVlXG59KTtcblxuLy8gZGl2aWRlIGludG8gdGVtcCAmIGZpbmFsaXplZFxuZXhwb3J0IGNvbnN0IGRhaWx5QmFySGVhZGVycyA9IGBzeW1ib2wsb3BlbixoaWdoLGxvdyxjbG9zZSx2b2x1bWVfd2VpZ2h0ZWQsbmA7XG5cbi8vIERlbGV0ZSB0aGUgdGVtcCBmb2xkZXIuXG4vLyBEb3dubG9hZCBhbGwgdGhlIGRhaWx5IGJhcnMgaW50byBmaWxlcyBpbnRvIHRoYXQgdGVtcCBmb2xkZXJcbi8vIG1lcmdlIHRoZSBmaWxlcy5cblxuY29uc3QgZG93bmxvYWRBbGxEYWlseUJhcnNJbnRvVGVtcEZpbGVzID0gYXN5bmMgKFxuICBzeW1ib2xzOiBzdHJpbmdbXSxcbiAgc3RhcnQ6IERhdGVUaW1lLFxuICBlbmQ6IERhdGVUaW1lLFxuICB0ZW1wRGlyZWN0b3J5OiBzdHJpbmdcbikgPT4ge1xuICAvLyBsb2dnZXIuaW5mbyhgR2V0dGluZyBhbGwgZGFpbHkgYmFycyBmcm9tIGFscGFjYSBmb3Igc3ltYm9sICR7c3ltYm9sfWApO1xuXG4gIC8vIEBUT0RPIElmIHVzZXIgaGFzIGEgYmV0dGVyIHN1YnNjcmlwdGlvbiwgdGhleSBjYW4gZ2V0IGRhdGEgdXAgdW50aWwgY3VycmVudCBkYXRlLlxuICBpZiAoZW5kLmRpZmZOb3coKS5kYXlzIDwgMSkge1xuICAgIGVuZCA9IERhdGVUaW1lLm5vdygpLm1pbnVzKHtkYXlzOiAxfSk7XG4gIH1cbiAgZW5kID0gRGF0ZVRpbWUubm93KCk7IFxuICBjb25zdCBiYXJzSXRlcmF0b3IgPSBnZXRBbGxCYXJzRnJvbUFscGFjYShcbiAgICBzeW1ib2xzLFxuICAgIHN0YXJ0LnRvSlNEYXRlKCksXG4gICAgZW5kLnRvSlNEYXRlKCksXG4gICAgZ2V0VGltZUZyYW1lKDEsICdkYXknKVxuICApO1xuXG4gIGZvciBhd2FpdCAoY29uc3QgYmFyIG9mIGJhcnNJdGVyYXRvcikge1xuICAgIC8vIEBUT0RPIGNoZWNrIHRpbWVzdGFtcCBmb3JtYXQuXG4gICAgLy8gY29uc29sZS5sb2coYmFyLlRpbWVzdGFtcCk7XG4gICAgY29uc3QgZGF0ZSA9IGJhci5UaW1lc3RhbXAuc3BsaXQoJ1QnKVswXTtcbiAgICBjb25zdCBmaWxlID0gYCR7dGVtcERpcmVjdG9yeX0vJHtkYXRlfS5jc3ZgO1xuXG4gICAgZnMubWtkaXJTeW5jKHRlbXBEaXJlY3RvcnksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuXG4gICAgY29uc3QgYmFyRGF0YSA9IGAke2Jhci5TeW1ib2x9LCR7YmFyLk9wZW5QcmljZX0sJHtiYXIuSGlnaFByaWNlfSwke2Jhci5Mb3dQcmljZX0sJHtiYXIuQ2xvc2VQcmljZX0sJHtiYXIuVldBUH0sJHtiYXIuVHJhZGVDb3VudH1gO1xuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoZmlsZSkpIHtcbiAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKGZpbGUsIGJhckRhdGEgKyAnXFxuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJhckhlYWRlcnMgPSBgc3ltYm9sLG9wZW4saGlnaCxsb3csY2xvc2Usdm9sdW1lX3dlaWdodGVkLG5gO1xuICAgICAgY29uc3QgYmFyRmlsZUNvbnRlbnQgPSBbYmFySGVhZGVycywgYmFyRGF0YV0uam9pbignXFxuJyk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGUsIGJhckZpbGVDb250ZW50ICsgJ1xcbicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGIxLmluY3JlbWVudCgxLCB7XG4gIC8vICAgYmFyc3ltYm9sXG4gIC8vIH0pO1xuXG4gIC8vIGxvZ2dlci5pbmZvKGBEb3dubG9hZGVkICR7YmFycy5sZW5ndGh9ICR7dGltZWZyYW1lfSBiYXJzIGZvciAke3N5bWJvbH1gKTtcbn07XG5cbmV4cG9ydCBjb25zdCBtZXJnZVRlbXBBbmRSZWd1bGFyID0gKGRpcmVjdG9yeTogc3RyaW5nLCB0ZW1wRGlyZWN0b3J5OiBzdHJpbmcsIG1lcmdlRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcmVjdG9yeSkpIHtcbiAgICBmcy5ta2RpclN5bmMoZGlyZWN0b3J5LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgfVxuXG4gIGZvciAoY29uc3QgZiBvZiBmcy5yZWFkZGlyU3luYyh0ZW1wRGlyZWN0b3J5KSkge1xuICAgIGNvbnN0IHRlbXBTdG9ja0ZpbGUgPSBgJHt0ZW1wRGlyZWN0b3J5fS8ke2Z9YDtcbiAgICBjb25zdCBzdG9ja0ZpbGUgPSBgJHtkaXJlY3Rvcnl9LyR7Zn1gO1xuICAgIGNvbnN0IG1lcmdlZFN0b2NrRmlsZSA9IGAke21lcmdlRGlyZWN0b3J5fS8ke2Z9YDtcblxuICAgIC8vIGxvZ2dlci5pbmZvKHN0b2NrRmlsZSk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc3RvY2tGaWxlKSkge1xuICAgICAgLy8gbG9nZ2VyLmluZm8oZik7XG5cbiAgICAgIC8vIHNsaWNlIHNraXBzIHRoZSBoZWFkZXIgcm93LlxuICAgICAgY29uc3QgcmVhZFN5bWJvbHNGcm9tRmlsZUludG9EaWN0ID0gKGZpbGVuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvY2tEYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCB7IGVuY29kaW5nOiAndXRmOCcgfSk7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gc3RvY2tEYXRhXG4gICAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAgIC5maWx0ZXIoeCA9PiB4ICE9ICcnKVxuICAgICAgICAgIC5zbGljZSgxKTtcbiAgICAgICAgY29uc3QgbGluZXNCeVN5bWJvbCA9IGxpbmVzLnJlZHVjZSgoZ3JvdXBpbmcsIGxpbmUpID0+IHtcbiAgICAgICAgICBjb25zdCBzeW1ib2wgPSBsaW5lLnNwbGl0KCcsJylbMF07XG4gICAgICAgICAgLy8gQ2hvb3NlIHRvIG92ZXJ3cml0ZSBleGlzdGluZyBkdXBsaWNhdGUgZGF0YSBpZiBpdCBleGlzdHMuXG4gICAgICAgICAgLy8gVGhlIGxhdGVzdCBzdG9jayBkYXRhIHdpbGwgYWx3YXlzIGJlIG5lYXIgdGhlIGVuZCBvZiB0aGUgZmlsZS5cbiAgICAgICAgICBncm91cGluZ1tzeW1ib2xdID0gbGluZTtcbiAgICAgICAgICByZXR1cm4gZ3JvdXBpbmc7XG4gICAgICAgIH0sIHt9IGFzIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0pO1xuICAgICAgICByZXR1cm4gbGluZXNCeVN5bWJvbDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHN0b2NrU3ltYm9scyA9IHJlYWRTeW1ib2xzRnJvbUZpbGVJbnRvRGljdChzdG9ja0ZpbGUpO1xuICAgICAgY29uc3QgdGVtcFN0b2NrU3ltYm9scyA9IHJlYWRTeW1ib2xzRnJvbUZpbGVJbnRvRGljdCh0ZW1wU3RvY2tGaWxlKTtcbiAgICAgIC8vIE1lcmdpbmcgZGljdGlvbmFyaWVzIGxpa2UgdGhpcyBicmluZ3MgaW4gYWxsIHRoZSBzeW1ib2xzIGZyb20gc3RvY2tTeW1ib2xcbiAgICAgIC8vIEFuZCB0aGVuIG92ZXJ3cml0ZXMgdGhlbSB3aXRoIHRlbXBTdG9ja1N5bWJvbHNcbiAgICAgIGNvbnN0IG1lcmdlZCA9IHsgLi4uc3RvY2tTeW1ib2xzLCAuLi50ZW1wU3RvY2tTeW1ib2xzIH07XG4gICAgICBjb25zdCBtZXJnZWRGaWxlQ29udGVudCA9IE9iamVjdC52YWx1ZXMobWVyZ2VkKS5zb3J0KCk7XG5cbiAgICAgIC8vIEBUT0RPIHRoaXMgaXMgcHJvYmFibHkgbm90IGVmZmljaWVudC5cbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhtZXJnZURpcmVjdG9yeSkpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKG1lcmdlRGlyZWN0b3J5LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIH1cblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhtZXJnZWRTdG9ja0ZpbGUsIFtkYWlseUJhckhlYWRlcnMsIC4uLm1lcmdlZEZpbGVDb250ZW50XS5qb2luKCdcXG4nKSk7XG4gICAgICBmcy5jb3B5RmlsZVN5bmMobWVyZ2VkU3RvY2tGaWxlLCBzdG9ja0ZpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBsb2dnZXIuaW5mbyhgQ29weWluZyAke3RlbXBTdG9ja0ZpbGV9IHRvICR7c3RvY2tGaWxlfWApO1xuICAgICAgZnMuY29weUZpbGVTeW5jKHRlbXBTdG9ja0ZpbGUsIHN0b2NrRmlsZSk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgY29uc3QgY2xlYW51cCA9ICh0ZW1wRGlyZWN0b3J5OiBzdHJpbmcsIG1lcmdlRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgZnMucm1TeW5jKHRlbXBEaXJlY3RvcnksIHsgZm9yY2U6IHRydWUsIHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgZnMucm1TeW5jKG1lcmdlRGlyZWN0b3J5LCB7IGZvcmNlOiB0cnVlLCByZWN1cnNpdmU6IHRydWUgfSk7XG59O1xuXG4vLyBJdCdzIHByb2JhYmx5IGJldHRlciB0byB3cml0ZSB0byBhIG5ldyBmaWxlIGFuZCByZXNvbHZlIHRoZSBmaWxlcyBsaW5lIGJ5IGxpbmUuXG5cbmV4cG9ydCBjb25zdCBzeW5jRGFpbHlCYXJzID0gYXN5bmMgKHBhcmFtczogeyBkYXRhRGlyOiBzdHJpbmcsIHN0YXJ0Pzogc3RyaW5nLCBlbmQ/OiBzdHJpbmcsIHN5bWJvbHM/OiBzdHJpbmdbXSB9KSA9PiB7XG4gIGNvbnN0IHsgZGF0YURpciB9ID0gcGFyYW1zO1xuXG4gIGNvbnN0IGRpcmVjdG9yeSA9IGAke2RhdGFEaXJ9LyR7bWFwVGltZWZyYW1lVG9EaXJOYW1lKCcxRGF5Jyl9YDtcbiAgY29uc3QgdGVtcERpcmVjdG9yeSA9IGAke2RpcmVjdG9yeX0udGVtcGA7XG4gIGNvbnN0IG1lcmdlRGlyZWN0b3J5ID0gYCR7ZGlyZWN0b3J5fS5tZXJnZWA7XG5cbiAgLy8gSW4gY2FzZSBwcm9ncmFtIGRpZWQgdW5leHBlY3RlZGx5LCBydW4gY2xlYW51cC5cbiAgY2xlYW51cCh0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG5cbiAgbGV0IHRyYWRlYWJsZVN5bWJvbHM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gcGFyYW1zLnN5bWJvbHM7XG4gIGlmICghdHJhZGVhYmxlU3ltYm9scykge1xuICAgIHRyYWRlYWJsZVN5bWJvbHMgPSAoYXdhaXQgZ2V0VHJhZGVhYmxlQXNzZXRzKCkpLm1hcCh4ID0+IHtcbiAgICAgIHJldHVybiB4LnN5bWJvbDtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEFkanVzdCB0byB0YXN0ZSBvciBzZXQgdG8gbWFueSB5ZWFycyBhZ28gaWYgZG9pbmcgYSBmdWxsIHN5bmMuXG4gIGxldCBlbmQgPSBEYXRlVGltZS5ub3coKTtcbiAgaWYgKHBhcmFtcy5lbmQpIHtcbiAgICBlbmQgPSBEYXRlVGltZS5mcm9tRm9ybWF0KHBhcmFtcy5lbmQsICd5eXl5LU1NLWRkJylcbiAgfVxuICBsZXQgc3RhcnQgPSBEYXRlVGltZS5ub3coKS5taW51cyh7IGRheXM6IDUgfSk7XG4gIGlmICghZnMuZXhpc3RzU3luYyhkaXJlY3RvcnkpKSB7XG4gICAgc3RhcnQgPSBEYXRlVGltZS5ub3coKS5taW51cyh7IHllYXJzOiA2IH0pO1xuICB9XG4gIGlmIChwYXJhbXMuc3RhcnQpIHtcbiAgICBzdGFydCA9IERhdGVUaW1lLmZyb21Gb3JtYXQocGFyYW1zLnN0YXJ0LCAneXl5eS1NTS1kZCcpXG4gIH1cblxuICBsb2dnZXIuaW5mbyhgRG93bmxvYWRpbmcgMURheSBiYXJzIHNpbmNlICR7c3RhcnQudG9SRkMyODIyKCl9KWApO1xuICBiMS5zdGFydCh0cmFkZWFibGVTeW1ib2xzLmxlbmd0aCwgMCk7XG5cbiAgLy8gV2hlbiBkb3dubG9hZGluZyBkYWlseSBiYXJzLCBmaXJzdCBybSB0aGUgZXhpc3RpbmcgZGF5cyBiYXJzICYgdGhlbiBvdmVyd3JpdGUgdGhlIGJhcnMuXG4gICAgLy8gbG9nZ2VyLmluZm8oYERvd25sb2FkaW5nIGRhaWx5IGRhdGEgZm9yICR7c30gZnJvbSAke3N0YXJ0fSBvbndhcmRzLmApO1xuICAgIGF3YWl0IGRvd25sb2FkQWxsRGFpbHlCYXJzSW50b1RlbXBGaWxlcyh0cmFkZWFibGVTeW1ib2xzLCBzdGFydCwgZW5kLCB0ZW1wRGlyZWN0b3J5KTtcbiAgICAvLyBAVE9ETyBwcm92aWRlIGEgY2hlY2tzdW0gdGhhdCBzYXlzIGlmIHdlIGhhdmUgcmV0cmlldmVkIGFsbCBiYXJzIGluc3RlYWQgb2Ygc2ltcGx5IHJlcG9ydGluZyBpdCdzIHVwIHRvIGRhdGUuXG4gICAgLy8gbG9nZ2VyLmluZm8oYFN5bWJvbCAke3N9IGlzIHVwIHRvIGRhdGUuYCk7XG5cbiAgYjEuc3RvcCgpO1xuXG4gIGxvZ2dlci5pbmZvKGBNZXJnaW5nIGFscGFjYSB0ZW1wIGZpbGVzIGludG8gbWFpbiBkYXRhIGZvbGRlci4uLmApO1xuICBtZXJnZVRlbXBBbmRSZWd1bGFyKGRpcmVjdG9yeSwgdGVtcERpcmVjdG9yeSwgbWVyZ2VEaXJlY3RvcnkpO1xuICBjbGVhbnVwKHRlbXBEaXJlY3RvcnksIG1lcmdlRGlyZWN0b3J5KTtcbiAgbG9nZ2VyLmluZm8oYERvbmUhYCk7XG59O1xuIl19