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
    const barsIterator = (0, helpers_1.getAllBarsFromAlpaca)(symbols, start.toJSDate(), end.toJSDate(), (0, helpers_1.getTimeFrame)(1, 'day'));
    try {
        for (var barsIterator_1 = __asyncValues(barsIterator), barsIterator_1_1; barsIterator_1_1 = yield barsIterator_1.next(), !barsIterator_1_1.done;) {
            const bar = barsIterator_1_1.value;
            // @TODO check timestamp format.
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
    // @TODO If user has a better subscription, they can get data up until current date.
    if (Math.abs(end.diffNow('days').get('days')) < 1) {
        end = luxon_1.DateTime.now().minus({ days: 1 });
    }
    let start = luxon_1.DateTime.now().minus({ days: 5 });
    if (!fs_1.default.existsSync(directory)) {
        start = luxon_1.DateTime.now().minus({ years: 6 });
    }
    if (params.start) {
        start = luxon_1.DateTime.fromFormat(params.start, 'yyyy-MM-dd');
    }
    logger_1.default.info(`Downloading 1Day bars since ${start.toRFC2822()} to ${end.toRFC2822()}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIjFkYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyx1REFBK0I7QUFDL0Isd0NBQTJHO0FBQzNHLDRDQUFvQjtBQUVwQixnRUFBdUM7QUFDdkMsOERBQWlDO0FBRWpDLE1BQU0sRUFBRSxHQUFHLElBQUksc0JBQVcsQ0FBQyxTQUFTLENBQUM7SUFDbkMsTUFBTSxFQUNKLHFCQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNwQiwwR0FBMEc7SUFDNUcsZUFBZSxFQUFFLFFBQVE7SUFDekIsaUJBQWlCLEVBQUUsUUFBUTtJQUMzQixVQUFVLEVBQUUsSUFBSTtDQUNqQixDQUFDLENBQUM7QUFFSCwrQkFBK0I7QUFDbEIsUUFBQSxlQUFlLEdBQUcsOENBQThDLENBQUM7QUFFOUUsMEJBQTBCO0FBQzFCLCtEQUErRDtBQUMvRCxtQkFBbUI7QUFFbkIsTUFBTSxpQ0FBaUMsR0FBRyxDQUN4QyxPQUFpQixFQUNqQixLQUFlLEVBQ2YsR0FBYSxFQUNiLGFBQXFCLEVBQ3JCLEVBQUU7SUFDRiwwRUFBMEU7O0lBRTFFLE1BQU0sWUFBWSxHQUFHLElBQUEsOEJBQW9CLEVBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBQSxzQkFBWSxFQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDOztRQUU3RyxLQUF3QixJQUFBLGlCQUFBLGNBQUEsWUFBWSxDQUFBLGtCQUFBO1lBQXpCLE1BQU0sR0FBRyx5QkFBQSxDQUFBO1lBQ2xCLGdDQUFnQztZQUNoQyxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxNQUFNLElBQUksR0FBRyxHQUFHLGFBQWEsSUFBSSxJ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QUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLElBQUksQ0FBQyxZQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQzdCLEtBQUssR0FBRyxnQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzVDO0lBQ0QsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1FBQ2hCLEtBQUssR0FBRyxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQ3pEO0lBRUQsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsK0JBQStCLEtBQUssQ0FBQyxTQUFTLEVBQUUsT0FBTyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3RGLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXJDLDBGQUEwRjtJQUMxRix5RUFBeUU7SUFDekUsTUFBTSxpQ0FBaUMsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3JGLGdIQUFnSDtJQUNoSCw2Q0FBNkM7SUFFN0MsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0lBRVYsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsQ0FBQztJQUNsRSxJQUFBLDJCQUFtQixFQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDOUQsSUFBQSxlQUFPLEVBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZDLGdCQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZCLENBQUMsQ0FBQSxDQUFDO0FBbkRXLFFBQUEsYUFBYSxpQkFtRHhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tICdsdXhvbic7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBnZXRBbGxCYXJzRnJvbUFscGFjYSwgbWFwVGltZWZyYW1lVG9EaXJOYW1lLCBnZXRUcmFkZWFibGVBc3NldHMsIGdldFRpbWVGcmFtZSB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgY2xpUHJvZ3Jlc3MgZnJvbSAnY2xpLXByb2dyZXNzJztcbmltcG9ydCBjb2xvcnMgZnJvbSAnYW5zaS1jb2xvcnMnO1xuXG5jb25zdCBiMSA9IG5ldyBjbGlQcm9ncmVzcy5TaW5nbGVCYXIoe1xuICBmb3JtYXQ6XG4gICAgY29sb3JzLmN5YW4oJ3tiYXJ9JykgK1xuICAgICcgfCB7cGVyY2VudGFnZX0lIHwge3N5bWJvbH0ge3ZhbHVlfS97dG90YWx9IFN5bWJvbHMgfCBSdW50aW1lOiB7ZHVyYXRpb25fZm9ybWF0dGVkfSBFdGE6IHtldGFfZm9ybWF0dGVkfScsXG4gIGJhckNvbXBsZXRlQ2hhcjogJ1xcdTI1ODgnLFxuICBiYXJJbmNvbXBsZXRlQ2hhcjogJ1xcdTI1OTEnLFxuICBoaWRlQ3Vyc29yOiB0cnVlXG59KTtcblxuLy8gZGl2aWRlIGludG8gdGVtcCAmIGZpbmFsaXplZFxuZXhwb3J0IGNvbnN0IGRhaWx5QmFySGVhZGVycyA9IGBzeW1ib2wsb3BlbixoaWdoLGxvdyxjbG9zZSx2b2x1bWVfd2VpZ2h0ZWQsbmA7XG5cbi8vIERlbGV0ZSB0aGUgdGVtcCBmb2xkZXIuXG4vLyBEb3dubG9hZCBhbGwgdGhlIGRhaWx5IGJhcnMgaW50byBmaWxlcyBpbnRvIHRoYXQgdGVtcCBmb2xkZXJcbi8vIG1lcmdlIHRoZSBmaWxlcy5cblxuY29uc3QgZG93bmxvYWRBbGxEYWlseUJhcnNJbnRvVGVtcEZpbGVzID0gYXN5bmMgKFxuICBzeW1ib2xzOiBzdHJpbmdbXSxcbiAgc3RhcnQ6IERhdGVUaW1lLFxuICBlbmQ6IERhdGVUaW1lLFxuICB0ZW1wRGlyZWN0b3J5OiBzdHJpbmdcbikgPT4ge1xuICAvLyBsb2dnZXIuaW5mbyhgR2V0dGluZyBhbGwgZGFpbHkgYmFycyBmcm9tIGFscGFjYSBmb3Igc3ltYm9sICR7c3ltYm9sfWApO1xuXG4gIGNvbnN0IGJhcnNJdGVyYXRvciA9IGdldEFsbEJhcnNGcm9tQWxwYWNhKHN5bWJvbHMsIHN0YXJ0LnRvSlNEYXRlKCksIGVuZC50b0pTRGF0ZSgpLCBnZXRUaW1lRnJhbWUoMSwgJ2RheScpKTtcblxuICBmb3IgYXdhaXQgKGNvbnN0IGJhciBvZiBiYXJzSXRlcmF0b3IpIHtcbiAgICAvLyBAVE9ETyBjaGVjayB0aW1lc3RhbXAgZm9ybWF0LlxuICAgIGNvbnN0IGRhdGUgPSBiYXIuVGltZXN0YW1wLnNwbGl0KCdUJylbMF07XG4gICAgY29uc3QgZmlsZSA9IGAke3RlbXBEaXJlY3Rvcnl9LyR7ZGF0ZX0uY3N2YDtcblxuICAgIGZzLm1rZGlyU3luYyh0ZW1wRGlyZWN0b3J5LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAgIGNvbnN0IGJhckRhdGEgPSBgJHtiYXIuU3ltYm9sfSwke2Jhci5PcGVuUHJpY2V9LCR7YmFyLkhpZ2hQcmljZX0sJHtiYXIuTG93UHJpY2V9LCR7YmFyLkNsb3NlUHJpY2V9LCR7YmFyLlZXQVB9LCR7YmFyLlRyYWRlQ291bnR9YDtcblxuICAgIGlmIChmcy5leGlzdHNTeW5jKGZpbGUpKSB7XG4gICAgICBmcy5hcHBlbmRGaWxlU3luYyhmaWxlLCBiYXJEYXRhICsgJ1xcbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBiYXJIZWFkZXJzID0gYHN5bWJvbCxvcGVuLGhpZ2gsbG93LGNsb3NlLHZvbHVtZV93ZWlnaHRlZCxuYDtcbiAgICAgIGNvbnN0IGJhckZpbGVDb250ZW50ID0gW2JhckhlYWRlcnMsIGJhckRhdGFdLmpvaW4oJ1xcbicpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlLCBiYXJGaWxlQ29udGVudCArICdcXG4nKTtcbiAgICB9XG4gIH1cblxuICAvLyBiMS5pbmNyZW1lbnQoMSwge1xuICAvLyAgIGJhcnN5bWJvbFxuICAvLyB9KTtcblxuICAvLyBsb2dnZXIuaW5mbyhgRG93bmxvYWRlZCAke2JhcnMubGVuZ3RofSAke3RpbWVmcmFtZX0gYmFycyBmb3IgJHtzeW1ib2x9YCk7XG59O1xuXG5leHBvcnQgY29uc3QgbWVyZ2VUZW1wQW5kUmVndWxhciA9IChkaXJlY3Rvcnk6IHN0cmluZywgdGVtcERpcmVjdG9yeTogc3RyaW5nLCBtZXJnZURpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gIGlmICghZnMuZXhpc3RzU3luYyhkaXJlY3RvcnkpKSB7XG4gICAgZnMubWtkaXJTeW5jKGRpcmVjdG9yeSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IGYgb2YgZnMucmVhZGRpclN5bmModGVtcERpcmVjdG9yeSkpIHtcbiAgICBjb25zdCB0ZW1wU3RvY2tGaWxlID0gYCR7dGVtcERpcmVjdG9yeX0vJHtmfWA7XG4gICAgY29uc3Qgc3RvY2tGaWxlID0gYCR7ZGlyZWN0b3J5fS8ke2Z9YDtcbiAgICBjb25zdCBtZXJnZWRTdG9ja0ZpbGUgPSBgJHttZXJnZURpcmVjdG9yeX0vJHtmfWA7XG5cbiAgICAvLyBsb2dnZXIuaW5mbyhzdG9ja0ZpbGUpO1xuICAgIGlmIChmcy5leGlzdHNTeW5jKHN0b2NrRmlsZSkpIHtcbiAgICAgIC8vIGxvZ2dlci5pbmZvKGYpO1xuXG4gICAgICAvLyBzbGljZSBza2lwcyB0aGUgaGVhZGVyIHJvdy5cbiAgICAgIGNvbnN0IHJlYWRTeW1ib2xzRnJvbUZpbGVJbnRvRGljdCA9IChmaWxlbmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b2NrRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pO1xuICAgICAgICBjb25zdCBsaW5lcyA9IHN0b2NrRGF0YVxuICAgICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgICAuZmlsdGVyKHggPT4geCAhPSAnJylcbiAgICAgICAgICAuc2xpY2UoMSk7XG4gICAgICAgIGNvbnN0IGxpbmVzQnlTeW1ib2wgPSBsaW5lcy5yZWR1Y2UoKGdyb3VwaW5nLCBsaW5lKSA9PiB7XG4gICAgICAgICAgY29uc3Qgc3ltYm9sID0gbGluZS5zcGxpdCgnLCcpWzBdO1xuICAgICAgICAgIC8vIENob29zZSB0byBvdmVyd3JpdGUgZXhpc3RpbmcgZHVwbGljYXRlIGRhdGEgaWYgaXQgZXhpc3RzLlxuICAgICAgICAgIC8vIFRoZSBsYXRlc3Qgc3RvY2sgZGF0YSB3aWxsIGFsd2F5cyBiZSBuZWFyIHRoZSBlbmQgb2YgdGhlIGZpbGUuXG4gICAgICAgICAgZ3JvdXBpbmdbc3ltYm9sXSA9IGxpbmU7XG4gICAgICAgICAgcmV0dXJuIGdyb3VwaW5nO1xuICAgICAgICB9LCB7fSBhcyB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9KTtcbiAgICAgICAgcmV0dXJuIGxpbmVzQnlTeW1ib2w7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBzdG9ja1N5bWJvbHMgPSByZWFkU3ltYm9sc0Zyb21GaWxlSW50b0RpY3Qoc3RvY2tGaWxlKTtcbiAgICAgIGNvbnN0IHRlbXBTdG9ja1N5bWJvbHMgPSByZWFkU3ltYm9sc0Zyb21GaWxlSW50b0RpY3QodGVtcFN0b2NrRmlsZSk7XG4gICAgICAvLyBNZXJnaW5nIGRpY3Rpb25hcmllcyBsaWtlIHRoaXMgYnJpbmdzIGluIGFsbCB0aGUgc3ltYm9scyBmcm9tIHN0b2NrU3ltYm9sXG4gICAgICAvLyBBbmQgdGhlbiBvdmVyd3JpdGVzIHRoZW0gd2l0aCB0ZW1wU3RvY2tTeW1ib2xzXG4gICAgICBjb25zdCBtZXJnZWQgPSB7IC4uLnN0b2NrU3ltYm9scywgLi4udGVtcFN0b2NrU3ltYm9scyB9O1xuICAgICAgY29uc3QgbWVyZ2VkRmlsZUNvbnRlbnQgPSBPYmplY3QudmFsdWVzKG1lcmdlZCkuc29ydCgpO1xuXG4gICAgICAvLyBAVE9ETyB0aGlzIGlzIHByb2JhYmx5IG5vdCBlZmZpY2llbnQuXG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMobWVyZ2VEaXJlY3RvcnkpKSB7XG4gICAgICAgIGZzLm1rZGlyU3luYyhtZXJnZURpcmVjdG9yeSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICB9XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMobWVyZ2VkU3RvY2tGaWxlLCBbZGFpbHlCYXJIZWFkZXJzLCAuLi5tZXJnZWRGaWxlQ29udGVudF0uam9pbignXFxuJykpO1xuICAgICAgZnMuY29weUZpbGVTeW5jKG1lcmdlZFN0b2NrRmlsZSwgc3RvY2tGaWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbG9nZ2VyLmluZm8oYENvcHlpbmcgJHt0ZW1wU3RvY2tGaWxlfSB0byAke3N0b2NrRmlsZX1gKTtcbiAgICAgIGZzLmNvcHlGaWxlU3luYyh0ZW1wU3RvY2tGaWxlLCBzdG9ja0ZpbGUpO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGNsZWFudXAgPSAodGVtcERpcmVjdG9yeTogc3RyaW5nLCBtZXJnZURpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gIGZzLnJtU3luYyh0ZW1wRGlyZWN0b3J5LCB7IGZvcmNlOiB0cnVlLCByZWN1cnNpdmU6IHRydWUgfSk7XG4gIGZzLnJtU3luYyhtZXJnZURpcmVjdG9yeSwgeyBmb3JjZTogdHJ1ZSwgcmVjdXJzaXZlOiB0cnVlIH0pO1xufTtcblxuLy8gSXQncyBwcm9iYWJseSBiZXR0ZXIgdG8gd3JpdGUgdG8gYSBuZXcgZmlsZSBhbmQgcmVzb2x2ZSB0aGUgZmlsZXMgbGluZSBieSBsaW5lLlxuXG5leHBvcnQgY29uc3Qgc3luY0RhaWx5QmFycyA9IGFzeW5jIChwYXJhbXM6IHsgZGF0YURpcjogc3RyaW5nOyBzdGFydD86IHN0cmluZzsgZW5kPzogc3RyaW5nOyBzeW1ib2xzPzogc3RyaW5nW10gfSkgPT4ge1xuICBjb25zdCB7IGRhdGFEaXIgfSA9IHBhcmFtcztcblxuICBjb25zdCBkaXJlY3RvcnkgPSBgJHtkYXRhRGlyfS8ke21hcFRpbWVmcmFtZVRvRGlyTmFtZSgnMURheScpfWA7XG4gIGNvbnN0IHRlbXBEaXJlY3RvcnkgPSBgJHtkaXJlY3Rvcnl9LnRlbXBgO1xuICBjb25zdCBtZXJnZURpcmVjdG9yeSA9IGAke2RpcmVjdG9yeX0ubWVyZ2VgO1xuXG4gIC8vIEluIGNhc2UgcHJvZ3JhbSBkaWVkIHVuZXhwZWN0ZWRseSwgcnVuIGNsZWFudXAuXG4gIGNsZWFudXAodGVtcERpcmVjdG9yeSwgbWVyZ2VEaXJlY3RvcnkpO1xuXG4gIGxldCB0cmFkZWFibGVTeW1ib2xzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHBhcmFtcy5zeW1ib2xzO1xuICBpZiAoIXRyYWRlYWJsZVN5bWJvbHMpIHtcbiAgICB0cmFkZWFibGVTeW1ib2xzID0gKGF3YWl0IGdldFRyYWRlYWJsZUFzc2V0cygpKS5tYXAoeCA9PiB7XG4gICAgICByZXR1cm4geC5zeW1ib2w7XG4gICAgfSk7XG4gIH1cblxuICAvLyBBZGp1c3QgdG8gdGFzdGUgb3Igc2V0IHRvIG1hbnkgeWVhcnMgYWdvIGlmIGRvaW5nIGEgZnVsbCBzeW5jLlxuICBsZXQgZW5kID0gRGF0ZVRpbWUubm93KCk7XG4gIGlmIChwYXJhbXMuZW5kKSB7XG4gICAgZW5kID0gRGF0ZVRpbWUuZnJvbUZvcm1hdChwYXJhbXMuZW5kLCAneXl5eS1NTS1kZCcpO1xuICB9XG5cbiAgLy8gQFRPRE8gSWYgdXNlciBoYXMgYSBiZXR0ZXIgc3Vic2NyaXB0aW9uLCB0aGV5IGNhbiBnZXQgZGF0YSB1cCB1bnRpbCBjdXJyZW50IGRhdGUuXG4gIGlmIChNYXRoLmFicyhlbmQuZGlmZk5vdygnZGF5cycpLmdldCgnZGF5cycpKSA8IDEpIHtcbiAgICBlbmQgPSBEYXRlVGltZS5ub3coKS5taW51cyh7IGRheXM6IDEgfSk7XG4gIH1cblxuICBsZXQgc3RhcnQgPSBEYXRlVGltZS5ub3coKS5taW51cyh7IGRheXM6IDUgfSk7XG4gIGlmICghZnMuZXhpc3RzU3luYyhkaXJlY3RvcnkpKSB7XG4gICAgc3RhcnQgPSBEYXRlVGltZS5ub3coKS5taW51cyh7IHllYXJzOiA2IH0pO1xuICB9XG4gIGlmIChwYXJhbXMuc3RhcnQpIHtcbiAgICBzdGFydCA9IERhdGVUaW1lLmZyb21Gb3JtYXQocGFyYW1zLnN0YXJ0LCAneXl5eS1NTS1kZCcpO1xuICB9XG5cbiAgbG9nZ2VyLmluZm8oYERvd25sb2FkaW5nIDFEYXkgYmFycyBzaW5jZSAke3N0YXJ0LnRvUkZDMjgyMigpfSB0byAke2VuZC50b1JGQzI4MjIoKX1gKTtcbiAgYjEuc3RhcnQodHJhZGVhYmxlU3ltYm9scy5sZW5ndGgsIDApO1xuXG4gIC8vIFdoZW4gZG93bmxvYWRpbmcgZGFpbHkgYmFycywgZmlyc3Qgcm0gdGhlIGV4aXN0aW5nIGRheXMgYmFycyAmIHRoZW4gb3ZlcndyaXRlIHRoZSBiYXJzLlxuICAvLyBsb2dnZXIuaW5mbyhgRG93bmxvYWRpbmcgZGFpbHkgZGF0YSBmb3IgJHtzfSBmcm9tICR7c3RhcnR9IG9ud2FyZHMuYCk7XG4gIGF3YWl0IGRvd25sb2FkQWxsRGFpbHlCYXJzSW50b1RlbXBGaWxlcyh0cmFkZWFibGVTeW1ib2xzLCBzdGFydCwgZW5kLCB0ZW1wRGlyZWN0b3J5KTtcbiAgLy8gQFRPRE8gcHJvdmlkZSBhIGNoZWNrc3VtIHRoYXQgc2F5cyBpZiB3ZSBoYXZlIHJldHJpZXZlZCBhbGwgYmFycyBpbnN0ZWFkIG9mIHNpbXBseSByZXBvcnRpbmcgaXQncyB1cCB0byBkYXRlLlxuICAvLyBsb2dnZXIuaW5mbyhgU3ltYm9sICR7c30gaXMgdXAgdG8gZGF0ZS5gKTtcblxuICBiMS5zdG9wKCk7XG5cbiAgbG9nZ2VyLmluZm8oYE1lcmdpbmcgYWxwYWNhIHRlbXAgZmlsZXMgaW50byBtYWluIGRhdGEgZm9sZGVyLi4uYCk7XG4gIG1lcmdlVGVtcEFuZFJlZ3VsYXIoZGlyZWN0b3J5LCB0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG4gIGNsZWFudXAodGVtcERpcmVjdG9yeSwgbWVyZ2VEaXJlY3RvcnkpO1xuICBsb2dnZXIuaW5mbyhgRG9uZSFgKTtcbn07XG4iXX0=