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
    var e_1, _a;
    // logger.info(`Getting all daily bars from alpaca for symbol ${symbol}`);
    const timeframe = '1Day';
    // If user has a better subscription, they can get data up until current date.
    const barsIterator = (0, helpers_1.getAllBarsFromAlpaca)(symbols, start.toJSDate(), end.minus({ days: 1 }).toJSDate());
    try {
        for (var barsIterator_1 = __asyncValues(barsIterator), barsIterator_1_1; barsIterator_1_1 = yield barsIterator_1.next(), !barsIterator_1_1.done;) {
            const bar = barsIterator_1_1.value;
            // @TODO check timestamp format.
            console.log(bar.Timestamp);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIjFkYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyx1REFBK0I7QUFDL0Isd0NBQTZGO0FBQzdGLDRDQUFvQjtBQUVwQixnRUFBdUM7QUFDdkMsOERBQWlDO0FBRWpDLE1BQU0sRUFBRSxHQUFHLElBQUksc0JBQVcsQ0FBQyxTQUFTLENBQUM7SUFDbkMsTUFBTSxFQUNKLHFCQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNwQiwwR0FBMEc7SUFDNUcsZUFBZSxFQUFFLFFBQVE7SUFDekIsaUJBQWlCLEVBQUUsUUFBUTtJQUMzQixVQUFVLEVBQUUsSUFBSTtDQUNqQixDQUFDLENBQUM7QUFFSCwrQkFBK0I7QUFDbEIsUUFBQSxlQUFlLEdBQUcsOENBQThDLENBQUM7QUFFOUUsMEJBQTBCO0FBQzFCLCtEQUErRDtBQUMvRCxtQkFBbUI7QUFFbkIsTUFBTSxpQ0FBaUMsR0FBRyxDQUN4QyxPQUFpQixFQUNqQixLQUFlLEVBQ2YsR0FBYSxFQUNiLGFBQXFCLEVBQ3JCLEVBQUU7O0lBQ0YsMEVBQTBFO0lBQzFFLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQztJQUV6Qiw4RUFBOEU7SUFDOUUsTUFBTSxZQUFZLEdBQUcsSUFBQSw4QkFBb0IsRUFBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDOztRQUV4RyxLQUF3QixJQUFBLGlCQUFBLGNBQUEsWUFBWSxDQUFBLGtCQUFBO1lBQXpCLE1BQU0sR0FBRyx5QkFBQSxDQUFBO1lBQ2xCLGdDQUFnQztZQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQixNQUFNLElBQUksR0FB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QyxDQUFDLENBQUM7SUFFckMsMEZBQTBGO0lBQzFGLEtBQUssTUFBTSxDQUFDLElBQUksZ0JBQWdCLEVBQUU7UUFDaEMseUVBQXlFO1FBQ3pFLE1BQU0saUNBQWlDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3hFLGdIQUFnSDtRQUNoSCw2Q0FBNkM7S0FDOUM7SUFFRCxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFVixnQkFBTSxDQUFDLElBQUksQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO0lBQ2xFLElBQUEsMkJBQW1CLEVBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUM5RCxJQUFBLGVBQU8sRUFBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDdkMsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkIsQ0FBQyxDQUFBLENBQUM7QUF0Q1csUUFBQSxhQUFhLGlCQXNDeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gJ2x1eG9uJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IGdldEFsbEJhcnNGcm9tQWxwYWNhLCBtYXBUaW1lZnJhbWVUb0Rpck5hbWUsIGdldFRyYWRlYWJsZUFzc2V0cyB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgY2xpUHJvZ3Jlc3MgZnJvbSAnY2xpLXByb2dyZXNzJztcbmltcG9ydCBjb2xvcnMgZnJvbSAnYW5zaS1jb2xvcnMnO1xuXG5jb25zdCBiMSA9IG5ldyBjbGlQcm9ncmVzcy5TaW5nbGVCYXIoe1xuICBmb3JtYXQ6XG4gICAgY29sb3JzLmN5YW4oJ3tiYXJ9JykgK1xuICAgICcgfCB7cGVyY2VudGFnZX0lIHwge3N5bWJvbH0ge3ZhbHVlfS97dG90YWx9IFN5bWJvbHMgfCBSdW50aW1lOiB7ZHVyYXRpb25fZm9ybWF0dGVkfSBFdGE6IHtldGFfZm9ybWF0dGVkfScsXG4gIGJhckNvbXBsZXRlQ2hhcjogJ1xcdTI1ODgnLFxuICBiYXJJbmNvbXBsZXRlQ2hhcjogJ1xcdTI1OTEnLFxuICBoaWRlQ3Vyc29yOiB0cnVlXG59KTtcblxuLy8gZGl2aWRlIGludG8gdGVtcCAmIGZpbmFsaXplZFxuZXhwb3J0IGNvbnN0IGRhaWx5QmFySGVhZGVycyA9IGBzeW1ib2wsb3BlbixoaWdoLGxvdyxjbG9zZSx2b2x1bWVfd2VpZ2h0ZWQsbmA7XG5cbi8vIERlbGV0ZSB0aGUgdGVtcCBmb2xkZXIuXG4vLyBEb3dubG9hZCBhbGwgdGhlIGRhaWx5IGJhcnMgaW50byBmaWxlcyBpbnRvIHRoYXQgdGVtcCBmb2xkZXJcbi8vIG1lcmdlIHRoZSBmaWxlcy5cblxuY29uc3QgZG93bmxvYWRBbGxEYWlseUJhcnNJbnRvVGVtcEZpbGVzID0gYXN5bmMgKFxuICBzeW1ib2xzOiBzdHJpbmdbXSxcbiAgc3RhcnQ6IERhdGVUaW1lLFxuICBlbmQ6IERhdGVUaW1lLFxuICB0ZW1wRGlyZWN0b3J5OiBzdHJpbmdcbikgPT4ge1xuICAvLyBsb2dnZXIuaW5mbyhgR2V0dGluZyBhbGwgZGFpbHkgYmFycyBmcm9tIGFscGFjYSBmb3Igc3ltYm9sICR7c3ltYm9sfWApO1xuICBjb25zdCB0aW1lZnJhbWUgPSAnMURheSc7XG5cbiAgLy8gSWYgdXNlciBoYXMgYSBiZXR0ZXIgc3Vic2NyaXB0aW9uLCB0aGV5IGNhbiBnZXQgZGF0YSB1cCB1bnRpbCBjdXJyZW50IGRhdGUuXG4gIGNvbnN0IGJhcnNJdGVyYXRvciA9IGdldEFsbEJhcnNGcm9tQWxwYWNhKHN5bWJvbHMsIHN0YXJ0LnRvSlNEYXRlKCksIGVuZC5taW51cyh7IGRheXM6IDEgfSkudG9KU0RhdGUoKSk7XG5cbiAgZm9yIGF3YWl0IChjb25zdCBiYXIgb2YgYmFyc0l0ZXJhdG9yKSB7XG4gICAgLy8gQFRPRE8gY2hlY2sgdGltZXN0YW1wIGZvcm1hdC5cbiAgICBjb25zb2xlLmxvZyhiYXIuVGltZXN0YW1wKTtcbiAgICBjb25zdCBkYXRlID0gYmFyLlRpbWVzdGFtcC5zcGxpdCgnVCcpWzBdO1xuICAgIGNvbnN0IGZpbGUgPSBgJHt0ZW1wRGlyZWN0b3J5fS8ke2RhdGV9LmNzdmA7XG5cbiAgICBmcy5ta2RpclN5bmModGVtcERpcmVjdG9yeSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cbiAgICBjb25zdCBiYXJEYXRhID0gYCR7YmFyLlN5bWJvbH0sJHtiYXIuT3BlblByaWNlfSwke2Jhci5IaWdoUHJpY2V9LCR7YmFyLkxvd1ByaWNlfSwke2Jhci5DbG9zZVByaWNlfSwke2Jhci5WV0FQfSwke2Jhci5UcmFkZUNvdW50fWA7XG5cbiAgICBpZiAoZnMuZXhpc3RzU3luYyhmaWxlKSkge1xuICAgICAgZnMuYXBwZW5kRmlsZVN5bmMoZmlsZSwgYmFyRGF0YSArICdcXG4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYmFySGVhZGVycyA9IGBzeW1ib2wsb3BlbixoaWdoLGxvdyxjbG9zZSx2b2x1bWVfd2VpZ2h0ZWQsbmA7XG4gICAgICBjb25zdCBiYXJGaWxlQ29udGVudCA9IFtiYXJIZWFkZXJzLCBiYXJEYXRhXS5qb2luKCdcXG4nKTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZSwgYmFyRmlsZUNvbnRlbnQgKyAnXFxuJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gYjEuaW5jcmVtZW50KDEsIHtcbiAgLy8gICBiYXJzeW1ib2xcbiAgLy8gfSk7XG5cbiAgLy8gbG9nZ2VyLmluZm8oYERvd25sb2FkZWQgJHtiYXJzLmxlbmd0aH0gJHt0aW1lZnJhbWV9IGJhcnMgZm9yICR7c3ltYm9sfWApO1xufTtcblxuZXhwb3J0IGNvbnN0IG1lcmdlVGVtcEFuZFJlZ3VsYXIgPSAoZGlyZWN0b3J5OiBzdHJpbmcsIHRlbXBEaXJlY3Rvcnk6IHN0cmluZywgbWVyZ2VEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyZWN0b3J5KSkge1xuICAgIGZzLm1rZGlyU3luYyhkaXJlY3RvcnksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICB9XG5cbiAgZm9yIChjb25zdCBmIG9mIGZzLnJlYWRkaXJTeW5jKHRlbXBEaXJlY3RvcnkpKSB7XG4gICAgY29uc3QgdGVtcFN0b2NrRmlsZSA9IGAke3RlbXBEaXJlY3Rvcnl9LyR7Zn1gO1xuICAgIGNvbnN0IHN0b2NrRmlsZSA9IGAke2RpcmVjdG9yeX0vJHtmfWA7XG4gICAgY29uc3QgbWVyZ2VkU3RvY2tGaWxlID0gYCR7bWVyZ2VEaXJlY3Rvcnl9LyR7Zn1gO1xuXG4gICAgLy8gbG9nZ2VyLmluZm8oc3RvY2tGaWxlKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhzdG9ja0ZpbGUpKSB7XG4gICAgICAvLyBsb2dnZXIuaW5mbyhmKTtcblxuICAgICAgLy8gc2xpY2Ugc2tpcHMgdGhlIGhlYWRlciByb3cuXG4gICAgICBjb25zdCByZWFkU3ltYm9sc0Zyb21GaWxlSW50b0RpY3QgPSAoZmlsZW5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBzdG9ja0RhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcbiAgICAgICAgY29uc3QgbGluZXMgPSBzdG9ja0RhdGFcbiAgICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgLmZpbHRlcih4ID0+IHggIT0gJycpXG4gICAgICAgICAgLnNsaWNlKDEpO1xuICAgICAgICBjb25zdCBsaW5lc0J5U3ltYm9sID0gbGluZXMucmVkdWNlKChncm91cGluZywgbGluZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHN5bWJvbCA9IGxpbmUuc3BsaXQoJywnKVswXTtcbiAgICAgICAgICAvLyBDaG9vc2UgdG8gb3ZlcndyaXRlIGV4aXN0aW5nIGR1cGxpY2F0ZSBkYXRhIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgICAvLyBUaGUgbGF0ZXN0IHN0b2NrIGRhdGEgd2lsbCBhbHdheXMgYmUgbmVhciB0aGUgZW5kIG9mIHRoZSBmaWxlLlxuICAgICAgICAgIGdyb3VwaW5nW3N5bWJvbF0gPSBsaW5lO1xuICAgICAgICAgIHJldHVybiBncm91cGluZztcbiAgICAgICAgfSwge30gYXMgeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSk7XG4gICAgICAgIHJldHVybiBsaW5lc0J5U3ltYm9sO1xuICAgICAgfTtcblxuICAgICAgY29uc3Qgc3RvY2tTeW1ib2xzID0gcmVhZFN5bWJvbHNGcm9tRmlsZUludG9EaWN0KHN0b2NrRmlsZSk7XG4gICAgICBjb25zdCB0ZW1wU3RvY2tTeW1ib2xzID0gcmVhZFN5bWJvbHNGcm9tRmlsZUludG9EaWN0KHRlbXBTdG9ja0ZpbGUpO1xuICAgICAgLy8gTWVyZ2luZyBkaWN0aW9uYXJpZXMgbGlrZSB0aGlzIGJyaW5ncyBpbiBhbGwgdGhlIHN5bWJvbHMgZnJvbSBzdG9ja1N5bWJvbFxuICAgICAgLy8gQW5kIHRoZW4gb3ZlcndyaXRlcyB0aGVtIHdpdGggdGVtcFN0b2NrU3ltYm9sc1xuICAgICAgY29uc3QgbWVyZ2VkID0geyAuLi5zdG9ja1N5bWJvbHMsIC4uLnRlbXBTdG9ja1N5bWJvbHMgfTtcbiAgICAgIGNvbnN0IG1lcmdlZEZpbGVDb250ZW50ID0gT2JqZWN0LnZhbHVlcyhtZXJnZWQpLnNvcnQoKTtcblxuICAgICAgLy8gQFRPRE8gdGhpcyBpcyBwcm9iYWJseSBub3QgZWZmaWNpZW50LlxuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKG1lcmdlRGlyZWN0b3J5KSkge1xuICAgICAgICBmcy5ta2RpclN5bmMobWVyZ2VEaXJlY3RvcnksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfVxuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKG1lcmdlZFN0b2NrRmlsZSwgW2RhaWx5QmFySGVhZGVycywgLi4ubWVyZ2VkRmlsZUNvbnRlbnRdLmpvaW4oJ1xcbicpKTtcbiAgICAgIGZzLmNvcHlGaWxlU3luYyhtZXJnZWRTdG9ja0ZpbGUsIHN0b2NrRmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGxvZ2dlci5pbmZvKGBDb3B5aW5nICR7dGVtcFN0b2NrRmlsZX0gdG8gJHtzdG9ja0ZpbGV9YCk7XG4gICAgICBmcy5jb3B5RmlsZVN5bmModGVtcFN0b2NrRmlsZSwgc3RvY2tGaWxlKTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjbGVhbnVwID0gKHRlbXBEaXJlY3Rvcnk6IHN0cmluZywgbWVyZ2VEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBmcy5ybVN5bmModGVtcERpcmVjdG9yeSwgeyBmb3JjZTogdHJ1ZSwgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICBmcy5ybVN5bmMobWVyZ2VEaXJlY3RvcnksIHsgZm9yY2U6IHRydWUsIHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbn07XG5cbi8vIEl0J3MgcHJvYmFibHkgYmV0dGVyIHRvIHdyaXRlIHRvIGEgbmV3IGZpbGUgYW5kIHJlc29sdmUgdGhlIGZpbGVzIGxpbmUgYnkgbGluZS5cblxuZXhwb3J0IGNvbnN0IHN5bmNEYWlseUJhcnMgPSBhc3luYyAocGFyYW1zOiB7IGRhdGFEaXI6IHN0cmluZyB9KSA9PiB7XG4gIGNvbnN0IHsgZGF0YURpciB9ID0gcGFyYW1zO1xuXG4gIGNvbnN0IGRpcmVjdG9yeSA9IGAke2RhdGFEaXJ9LyR7bWFwVGltZWZyYW1lVG9EaXJOYW1lKCcxRGF5Jyl9YDtcbiAgY29uc3QgdGVtcERpcmVjdG9yeSA9IGAke2RpcmVjdG9yeX0udGVtcGA7XG4gIGNvbnN0IG1lcmdlRGlyZWN0b3J5ID0gYCR7ZGlyZWN0b3J5fS5tZXJnZWA7XG5cbiAgLy8gSW4gY2FzZSBwcm9ncmFtIGRpZWQgdW5leHBlY3RlZGx5LCBydW4gY2xlYW51cC5cbiAgY2xlYW51cCh0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG5cbiAgY29uc3QgdHJhZGVhYmxlU3ltYm9scyA9IChhd2FpdCBnZXRUcmFkZWFibGVBc3NldHMoKSkubWFwKHggPT4ge1xuICAgIHJldHVybiB4LnN5bWJvbDtcbiAgfSk7XG5cbiAgLy8gQWRqdXN0IHRvIHRhc3RlIG9yIHNldCB0byBtYW55IHllYXJzIGFnbyBpZiBkb2luZyBhIGZ1bGwgc3luYy5cbiAgY29uc3QgZW5kID0gRGF0ZVRpbWUubm93KCk7XG4gIGxldCBzdGFydCA9IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgZGF5czogNSB9KTtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcmVjdG9yeSkpIHtcbiAgICBzdGFydCA9IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgeWVhcnM6IDYgfSk7XG4gIH1cblxuICBsb2dnZXIuaW5mbyhgRG93bmxvYWRpbmcgMURheSBiYXJzIHNpbmNlICR7c3RhcnQudG9SRkMyODIyKCl9KWApO1xuICBiMS5zdGFydCh0cmFkZWFibGVTeW1ib2xzLmxlbmd0aCwgMCk7XG5cbiAgLy8gV2hlbiBkb3dubG9hZGluZyBkYWlseSBiYXJzLCBmaXJzdCBybSB0aGUgZXhpc3RpbmcgZGF5cyBiYXJzICYgdGhlbiBvdmVyd3JpdGUgdGhlIGJhcnMuXG4gIGZvciAoY29uc3QgcyBvZiB0cmFkZWFibGVTeW1ib2xzKSB7XG4gICAgLy8gbG9nZ2VyLmluZm8oYERvd25sb2FkaW5nIGRhaWx5IGRhdGEgZm9yICR7c30gZnJvbSAke3N0YXJ0fSBvbndhcmRzLmApO1xuICAgIGF3YWl0IGRvd25sb2FkQWxsRGFpbHlCYXJzSW50b1RlbXBGaWxlcyhbc10sIHN0YXJ0LCBlbmQsIHRlbXBEaXJlY3RvcnkpO1xuICAgIC8vIEBUT0RPIHByb3ZpZGUgYSBjaGVja3N1bSB0aGF0IHNheXMgaWYgd2UgaGF2ZSByZXRyaWV2ZWQgYWxsIGJhcnMgaW5zdGVhZCBvZiBzaW1wbHkgcmVwb3J0aW5nIGl0J3MgdXAgdG8gZGF0ZS5cbiAgICAvLyBsb2dnZXIuaW5mbyhgU3ltYm9sICR7c30gaXMgdXAgdG8gZGF0ZS5gKTtcbiAgfVxuXG4gIGIxLnN0b3AoKTtcblxuICBsb2dnZXIuaW5mbyhgTWVyZ2luZyBhbHBhY2EgdGVtcCBmaWxlcyBpbnRvIG1haW4gZGF0YSBmb2xkZXIuLi5gKTtcbiAgbWVyZ2VUZW1wQW5kUmVndWxhcihkaXJlY3RvcnksIHRlbXBEaXJlY3RvcnksIG1lcmdlRGlyZWN0b3J5KTtcbiAgY2xlYW51cCh0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG4gIGxvZ2dlci5pbmZvKGBEb25lIWApO1xufTtcbiJdfQ==