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
    const barsIterator = (0, helpers_1.getAllBarsFromAlpaca)(symbols, start.toJSDate(), end.toJSDate(), (0, helpers_1.getTimeFrame)(1, 'day'));
    let symbol = undefined;
    try {
        for (var barsIterator_1 = __asyncValues(barsIterator), barsIterator_1_1; barsIterator_1_1 = yield barsIterator_1.next(), !barsIterator_1_1.done;) {
            const bar = barsIterator_1_1.value;
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
            if (!symbol || symbol != bar.Symbol) {
                symbol = bar.Symbol;
                b1.increment(1, {
                    symbol
                });
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
    // @TODO If user has a better subscription, they can get data up until last 15 minutes.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIjFkYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyx1REFBK0I7QUFDL0Isd0NBQTJHO0FBQzNHLDRDQUFvQjtBQUVwQixnRUFBdUM7QUFDdkMsOERBQWlDO0FBRWpDLE1BQU0sRUFBRSxHQUFHLElBQUksc0JBQVcsQ0FBQyxTQUFTLENBQUM7SUFDbkMsTUFBTSxFQUNKLHFCQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNwQiwwR0FBMEc7SUFDNUcsZUFBZSxFQUFFLFFBQVE7SUFDekIsaUJBQWlCLEVBQUUsUUFBUTtJQUMzQixVQUFVLEVBQUUsSUFBSTtDQUNqQixDQUFDLENBQUM7QUFFSCwrQkFBK0I7QUFDbEIsUUFBQSxlQUFlLEdBQUcsOENBQThDLENBQUM7QUFFOUUsMEJBQTBCO0FBQzFCLCtEQUErRDtBQUMvRCxtQkFBbUI7QUFFbkIsTUFBTSxpQ0FBaUMsR0FBRyxDQUN4QyxPQUFpQixFQUNqQixLQUFlLEVBQ2YsR0FBYSxFQUNiLGFBQXFCLEVBQ3JCLEVBQUU7O0lBQ0YsTUFBTSxZQUFZLEdBQUcsSUFBQSw4QkFBb0IsRUFBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFBLHNCQUFZLEVBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFN0csSUFBSSxNQUFNLEdBQXVCLFNBQVMsQ0FBQzs7UUFDM0MsS0FBd0IsSUFBQSxpQkFBQSxjQUFBLFlBQVksQ0FBQSxrQkFBQTtZQUF6QixNQUFNLEdBQUcseUJBQUEsQ0FBQTtZQUNsQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxNQUFNLElBQUksR0FBRyxHQUFHLGFBQWEs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QUN2QixDQUFDLENBQUEsQ0FBQztBQW5EVyxRQUFBLGFBQWEsaUJBbUR4QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSAnbHV4b24nO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgZ2V0QWxsQmFyc0Zyb21BbHBhY2EsIG1hcFRpbWVmcmFtZVRvRGlyTmFtZSwgZ2V0VHJhZGVhYmxlQXNzZXRzLCBnZXRUaW1lRnJhbWUgfSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGNsaVByb2dyZXNzIGZyb20gJ2NsaS1wcm9ncmVzcyc7XG5pbXBvcnQgY29sb3JzIGZyb20gJ2Fuc2ktY29sb3JzJztcblxuY29uc3QgYjEgPSBuZXcgY2xpUHJvZ3Jlc3MuU2luZ2xlQmFyKHtcbiAgZm9ybWF0OlxuICAgIGNvbG9ycy5jeWFuKCd7YmFyfScpICtcbiAgICAnIHwge3BlcmNlbnRhZ2V9JSB8IHtzeW1ib2x9IHt2YWx1ZX0ve3RvdGFsfSBTeW1ib2xzIHwgUnVudGltZToge2R1cmF0aW9uX2Zvcm1hdHRlZH0gRXRhOiB7ZXRhX2Zvcm1hdHRlZH0nLFxuICBiYXJDb21wbGV0ZUNoYXI6ICdcXHUyNTg4JyxcbiAgYmFySW5jb21wbGV0ZUNoYXI6ICdcXHUyNTkxJyxcbiAgaGlkZUN1cnNvcjogdHJ1ZVxufSk7XG5cbi8vIGRpdmlkZSBpbnRvIHRlbXAgJiBmaW5hbGl6ZWRcbmV4cG9ydCBjb25zdCBkYWlseUJhckhlYWRlcnMgPSBgc3ltYm9sLG9wZW4saGlnaCxsb3csY2xvc2Usdm9sdW1lX3dlaWdodGVkLG5gO1xuXG4vLyBEZWxldGUgdGhlIHRlbXAgZm9sZGVyLlxuLy8gRG93bmxvYWQgYWxsIHRoZSBkYWlseSBiYXJzIGludG8gZmlsZXMgaW50byB0aGF0IHRlbXAgZm9sZGVyXG4vLyBtZXJnZSB0aGUgZmlsZXMuXG5cbmNvbnN0IGRvd25sb2FkQWxsRGFpbHlCYXJzSW50b1RlbXBGaWxlcyA9IGFzeW5jIChcbiAgc3ltYm9sczogc3RyaW5nW10sXG4gIHN0YXJ0OiBEYXRlVGltZSxcbiAgZW5kOiBEYXRlVGltZSxcbiAgdGVtcERpcmVjdG9yeTogc3RyaW5nXG4pID0+IHtcbiAgY29uc3QgYmFyc0l0ZXJhdG9yID0gZ2V0QWxsQmFyc0Zyb21BbHBhY2Eoc3ltYm9scywgc3RhcnQudG9KU0RhdGUoKSwgZW5kLnRvSlNEYXRlKCksIGdldFRpbWVGcmFtZSgxLCAnZGF5JykpO1xuXG4gIGxldCBzeW1ib2w6IHVuZGVmaW5lZCB8IHN0cmluZyA9IHVuZGVmaW5lZDtcbiAgZm9yIGF3YWl0IChjb25zdCBiYXIgb2YgYmFyc0l0ZXJhdG9yKSB7XG4gICAgY29uc3QgZGF0ZSA9IGJhci5UaW1lc3RhbXAuc3BsaXQoJ1QnKVswXTtcbiAgICBjb25zdCBmaWxlID0gYCR7dGVtcERpcmVjdG9yeX0vJHtkYXRlfS5jc3ZgO1xuXG4gICAgZnMubWtkaXJTeW5jKHRlbXBEaXJlY3RvcnksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuXG4gICAgY29uc3QgYmFyRGF0YSA9IGAke2Jhci5TeW1ib2x9LCR7YmFyLk9wZW5QcmljZX0sJHtiYXIuSGlnaFByaWNlfSwke2Jhci5Mb3dQcmljZX0sJHtiYXIuQ2xvc2VQcmljZX0sJHtiYXIuVldBUH0sJHtiYXIuVHJhZGVDb3VudH1gO1xuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoZmlsZSkpIHtcbiAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKGZpbGUsIGJhckRhdGEgKyAnXFxuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJhckhlYWRlcnMgPSBgc3ltYm9sLG9wZW4saGlnaCxsb3csY2xvc2Usdm9sdW1lX3dlaWdodGVkLG5gO1xuICAgICAgY29uc3QgYmFyRmlsZUNvbnRlbnQgPSBbYmFySGVhZGVycywgYmFyRGF0YV0uam9pbignXFxuJyk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGUsIGJhckZpbGVDb250ZW50ICsgJ1xcbicpO1xuICAgIH1cblxuICAgIGlmICghc3ltYm9sIHx8IHN5bWJvbCAhPSBiYXIuU3ltYm9sKSB7XG4gICAgICBzeW1ib2wgPSBiYXIuU3ltYm9sO1xuICAgICAgYjEuaW5jcmVtZW50KDEsIHtcbiAgICAgICAgc3ltYm9sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBtZXJnZVRlbXBBbmRSZWd1bGFyID0gKGRpcmVjdG9yeTogc3RyaW5nLCB0ZW1wRGlyZWN0b3J5OiBzdHJpbmcsIG1lcmdlRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcmVjdG9yeSkpIHtcbiAgICBmcy5ta2RpclN5bmMoZGlyZWN0b3J5LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgfVxuXG4gIGZvciAoY29uc3QgZiBvZiBmcy5yZWFkZGlyU3luYyh0ZW1wRGlyZWN0b3J5KSkge1xuICAgIGNvbnN0IHRlbXBTdG9ja0ZpbGUgPSBgJHt0ZW1wRGlyZWN0b3J5fS8ke2Z9YDtcbiAgICBjb25zdCBzdG9ja0ZpbGUgPSBgJHtkaXJlY3Rvcnl9LyR7Zn1gO1xuICAgIGNvbnN0IG1lcmdlZFN0b2NrRmlsZSA9IGAke21lcmdlRGlyZWN0b3J5fS8ke2Z9YDtcblxuICAgIC8vIGxvZ2dlci5pbmZvKHN0b2NrRmlsZSk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc3RvY2tGaWxlKSkge1xuICAgICAgLy8gbG9nZ2VyLmluZm8oZik7XG5cbiAgICAgIC8vIHNsaWNlIHNraXBzIHRoZSBoZWFkZXIgcm93LlxuICAgICAgY29uc3QgcmVhZFN5bWJvbHNGcm9tRmlsZUludG9EaWN0ID0gKGZpbGVuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvY2tEYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCB7IGVuY29kaW5nOiAndXRmOCcgfSk7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gc3RvY2tEYXRhXG4gICAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAgIC5maWx0ZXIoeCA9PiB4ICE9ICcnKVxuICAgICAgICAgIC5zbGljZSgxKTtcbiAgICAgICAgY29uc3QgbGluZXNCeVN5bWJvbCA9IGxpbmVzLnJlZHVjZSgoZ3JvdXBpbmcsIGxpbmUpID0+IHtcbiAgICAgICAgICBjb25zdCBzeW1ib2wgPSBsaW5lLnNwbGl0KCcsJylbMF07XG4gICAgICAgICAgLy8gQ2hvb3NlIHRvIG92ZXJ3cml0ZSBleGlzdGluZyBkdXBsaWNhdGUgZGF0YSBpZiBpdCBleGlzdHMuXG4gICAgICAgICAgLy8gVGhlIGxhdGVzdCBzdG9jayBkYXRhIHdpbGwgYWx3YXlzIGJlIG5lYXIgdGhlIGVuZCBvZiB0aGUgZmlsZS5cbiAgICAgICAgICBncm91cGluZ1tzeW1ib2xdID0gbGluZTtcbiAgICAgICAgICByZXR1cm4gZ3JvdXBpbmc7XG4gICAgICAgIH0sIHt9IGFzIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0pO1xuICAgICAgICByZXR1cm4gbGluZXNCeVN5bWJvbDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHN0b2NrU3ltYm9scyA9IHJlYWRTeW1ib2xzRnJvbUZpbGVJbnRvRGljdChzdG9ja0ZpbGUpO1xuICAgICAgY29uc3QgdGVtcFN0b2NrU3ltYm9scyA9IHJlYWRTeW1ib2xzRnJvbUZpbGVJbnRvRGljdCh0ZW1wU3RvY2tGaWxlKTtcbiAgICAgIC8vIE1lcmdpbmcgZGljdGlvbmFyaWVzIGxpa2UgdGhpcyBicmluZ3MgaW4gYWxsIHRoZSBzeW1ib2xzIGZyb20gc3RvY2tTeW1ib2xcbiAgICAgIC8vIEFuZCB0aGVuIG92ZXJ3cml0ZXMgdGhlbSB3aXRoIHRlbXBTdG9ja1N5bWJvbHNcbiAgICAgIGNvbnN0IG1lcmdlZCA9IHsgLi4uc3RvY2tTeW1ib2xzLCAuLi50ZW1wU3RvY2tTeW1ib2xzIH07XG4gICAgICBjb25zdCBtZXJnZWRGaWxlQ29udGVudCA9IE9iamVjdC52YWx1ZXMobWVyZ2VkKS5zb3J0KCk7XG5cbiAgICAgIC8vIEBUT0RPIHRoaXMgaXMgcHJvYmFibHkgbm90IGVmZmljaWVudC5cbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhtZXJnZURpcmVjdG9yeSkpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKG1lcmdlRGlyZWN0b3J5LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIH1cblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhtZXJnZWRTdG9ja0ZpbGUsIFtkYWlseUJhckhlYWRlcnMsIC4uLm1lcmdlZEZpbGVDb250ZW50XS5qb2luKCdcXG4nKSk7XG4gICAgICBmcy5jb3B5RmlsZVN5bmMobWVyZ2VkU3RvY2tGaWxlLCBzdG9ja0ZpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBsb2dnZXIuaW5mbyhgQ29weWluZyAke3RlbXBTdG9ja0ZpbGV9IHRvICR7c3RvY2tGaWxlfWApO1xuICAgICAgZnMuY29weUZpbGVTeW5jKHRlbXBTdG9ja0ZpbGUsIHN0b2NrRmlsZSk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgY29uc3QgY2xlYW51cCA9ICh0ZW1wRGlyZWN0b3J5OiBzdHJpbmcsIG1lcmdlRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgZnMucm1TeW5jKHRlbXBEaXJlY3RvcnksIHsgZm9yY2U6IHRydWUsIHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgZnMucm1TeW5jKG1lcmdlRGlyZWN0b3J5LCB7IGZvcmNlOiB0cnVlLCByZWN1cnNpdmU6IHRydWUgfSk7XG59O1xuXG4vLyBJdCdzIHByb2JhYmx5IGJldHRlciB0byB3cml0ZSB0byBhIG5ldyBmaWxlIGFuZCByZXNvbHZlIHRoZSBmaWxlcyBsaW5lIGJ5IGxpbmUuXG5cbmV4cG9ydCBjb25zdCBzeW5jRGFpbHlCYXJzID0gYXN5bmMgKHBhcmFtczogeyBkYXRhRGlyOiBzdHJpbmc7IHN0YXJ0Pzogc3RyaW5nOyBlbmQ/OiBzdHJpbmc7IHN5bWJvbHM/OiBzdHJpbmdbXSB9KSA9PiB7XG4gIGNvbnN0IHsgZGF0YURpciB9ID0gcGFyYW1zO1xuXG4gIGNvbnN0IGRpcmVjdG9yeSA9IGAke2RhdGFEaXJ9LyR7bWFwVGltZWZyYW1lVG9EaXJOYW1lKCcxRGF5Jyl9YDtcbiAgY29uc3QgdGVtcERpcmVjdG9yeSA9IGAke2RpcmVjdG9yeX0udGVtcGA7XG4gIGNvbnN0IG1lcmdlRGlyZWN0b3J5ID0gYCR7ZGlyZWN0b3J5fS5tZXJnZWA7XG5cbiAgLy8gSW4gY2FzZSBwcm9ncmFtIGRpZWQgdW5leHBlY3RlZGx5LCBydW4gY2xlYW51cC5cbiAgY2xlYW51cCh0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG5cbiAgbGV0IHRyYWRlYWJsZVN5bWJvbHM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gcGFyYW1zLnN5bWJvbHM7XG4gIGlmICghdHJhZGVhYmxlU3ltYm9scykge1xuICAgIHRyYWRlYWJsZVN5bWJvbHMgPSAoYXdhaXQgZ2V0VHJhZGVhYmxlQXNzZXRzKCkpLm1hcCh4ID0+IHtcbiAgICAgIHJldHVybiB4LnN5bWJvbDtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEFkanVzdCB0byB0YXN0ZSBvciBzZXQgdG8gbWFueSB5ZWFycyBhZ28gaWYgZG9pbmcgYSBmdWxsIHN5bmMuXG4gIGxldCBlbmQgPSBEYXRlVGltZS5ub3coKTtcbiAgaWYgKHBhcmFtcy5lbmQpIHtcbiAgICBlbmQgPSBEYXRlVGltZS5mcm9tRm9ybWF0KHBhcmFtcy5lbmQsICd5eXl5LU1NLWRkJyk7XG4gIH1cblxuICAvLyBAVE9ETyBJZiB1c2VyIGhhcyBhIGJldHRlciBzdWJzY3JpcHRpb24sIHRoZXkgY2FuIGdldCBkYXRhIHVwIHVudGlsIGxhc3QgMTUgbWludXRlcy5cbiAgaWYgKE1hdGguYWJzKGVuZC5kaWZmTm93KCdkYXlzJykuZ2V0KCdkYXlzJykpIDwgMSkge1xuICAgIGVuZCA9IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgZGF5czogMSB9KTtcbiAgfVxuXG4gIGxldCBzdGFydCA9IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgZGF5czogNSB9KTtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcmVjdG9yeSkpIHtcbiAgICBzdGFydCA9IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgeWVhcnM6IDYgfSk7XG4gIH1cbiAgaWYgKHBhcmFtcy5zdGFydCkge1xuICAgIHN0YXJ0ID0gRGF0ZVRpbWUuZnJvbUZvcm1hdChwYXJhbXMuc3RhcnQsICd5eXl5LU1NLWRkJyk7XG4gIH1cblxuICBsb2dnZXIuaW5mbyhgRG93bmxvYWRpbmcgMURheSBiYXJzIHNpbmNlICR7c3RhcnQudG9SRkMyODIyKCl9IHRvICR7ZW5kLnRvUkZDMjgyMigpfWApO1xuICBiMS5zdGFydCh0cmFkZWFibGVTeW1ib2xzLmxlbmd0aCwgMCk7XG5cbiAgLy8gV2hlbiBkb3dubG9hZGluZyBkYWlseSBiYXJzLCBmaXJzdCBybSB0aGUgZXhpc3RpbmcgZGF5cyBiYXJzICYgdGhlbiBvdmVyd3JpdGUgdGhlIGJhcnMuXG4gIC8vIGxvZ2dlci5pbmZvKGBEb3dubG9hZGluZyBkYWlseSBkYXRhIGZvciAke3N9IGZyb20gJHtzdGFydH0gb253YXJkcy5gKTtcbiAgYXdhaXQgZG93bmxvYWRBbGxEYWlseUJhcnNJbnRvVGVtcEZpbGVzKHRyYWRlYWJsZVN5bWJvbHMsIHN0YXJ0LCBlbmQsIHRlbXBEaXJlY3RvcnkpO1xuICAvLyBAVE9ETyBwcm92aWRlIGEgY2hlY2tzdW0gdGhhdCBzYXlzIGlmIHdlIGhhdmUgcmV0cmlldmVkIGFsbCBiYXJzIGluc3RlYWQgb2Ygc2ltcGx5IHJlcG9ydGluZyBpdCdzIHVwIHRvIGRhdGUuXG4gIC8vIGxvZ2dlci5pbmZvKGBTeW1ib2wgJHtzfSBpcyB1cCB0byBkYXRlLmApO1xuXG4gIGIxLnN0b3AoKTtcblxuICBsb2dnZXIuaW5mbyhgTWVyZ2luZyBhbHBhY2EgdGVtcCBmaWxlcyBpbnRvIG1haW4gZGF0YSBmb2xkZXIuLi5gKTtcbiAgbWVyZ2VUZW1wQW5kUmVndWxhcihkaXJlY3RvcnksIHRlbXBEaXJlY3RvcnksIG1lcmdlRGlyZWN0b3J5KTtcbiAgY2xlYW51cCh0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG4gIGxvZ2dlci5pbmZvKGBEb25lIWApO1xufTtcbiJdfQ==