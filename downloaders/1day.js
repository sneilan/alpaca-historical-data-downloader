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
exports.syncDailyBars = exports.cleanup = exports.mergeTempAndRegular = void 0;
const luxon_1 = require("luxon");
const logger_1 = __importDefault(require("../logger"));
const environment_1 = require("../environment");
const helpers_1 = require("../helpers");
const fs_1 = __importDefault(require("fs"));
// Delete the temp folder.
// Download all the daily bars into files into that temp folder
// merge the files.
const directory = `${environment_1.dataDirectory}/${(0, helpers_1.mapTimeframeToDirName)('1Day')}`;
const tempDirectory = `${directory}.temp`;
const mergeDirectory = `${directory}.merge`;
const downloadAllDailyBarsIntoTempFiles = (symbol, start, end) => __awaiter(void 0, void 0, void 0, function* () {
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
const mergeTempAndRegular = () => {
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
                fs_1.default.mkdirSync(mergeDirectory);
            }
            fs_1.default.writeFileSync(mergedStockFile, [environment_1.dailyBarHeaders, ...mergedFileContent].join('\n'));
            fs_1.default.copyFileSync(mergedStockFile, stockFile);
        }
        else {
            logger_1.default.info(`Copying ${tempStockFile} to ${stockFile}`);
            fs_1.default.copyFileSync(tempStockFile, stockFile);
        }
    }
};
exports.mergeTempAndRegular = mergeTempAndRegular;
const cleanup = () => {
    fs_1.default.rmSync(tempDirectory, { force: true, recursive: true });
    fs_1.default.rmSync(mergeDirectory, { force: true, recursive: true });
};
exports.cleanup = cleanup;
// It's probably better to write to a new file and resolve the files line by line.
const syncDailyBars = () => __awaiter(void 0, void 0, void 0, function* () {
    // In case program died unexpectedly, run cleanup.
    (0, exports.cleanup)();
    const tradeableSymbols = (yield (0, helpers_1.getTradeableAssets)()).map(x => {
        return x.symbol;
    });
    // Adjust to taste or set to many years ago if doing a full sync.
    const end = luxon_1.DateTime.now();
    let start = luxon_1.DateTime.now().minus({ months: 1 });
    if (!fs_1.default.existsSync(directory)) {
        start = luxon_1.DateTime.now().minus({ years: 6 });
    }
    // When downloading daily bars, first rm the existing days bars & then overwrite the bars.
    for (const s of tradeableSymbols) {
        logger_1.default.info(`Downloading daily data for ${s} from ${start} onwards.`);
        yield downloadAllDailyBarsIntoTempFiles(s, start, end);
        // @TODO provide a checksum that says if we have retrieved all bars instead of simply reporting it's up to date.
        // logger.info(`Symbol ${s} is up to date.`);
    }
    (0, exports.mergeTempAndRegular)();
    (0, exports.cleanup)();
});
exports.syncDailyBars = syncDailyBars;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIjFkYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHVEQUErQjtBQUMvQixnREFBZ0U7QUFDaEUsd0NBQTZGO0FBQzdGLDRDQUFvQjtBQUlwQiwwQkFBMEI7QUFDMUIsK0RBQStEO0FBQy9ELG1CQUFtQjtBQUVuQixNQUFNLFNBQVMsR0FBRyxHQUFHLDJCQUFhLElBQUksSUFBQSwrQkFBcUIsRUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQ3RFLE1BQU0sYUFBYSxHQUFHLEdBQUcsU0FBUyxPQUFPLENBQUM7QUFDMUMsTUFBTSxjQUFjLEdBQUcsR0FBRyxTQUFTLFFBQVEsQ0FBQztBQUU1QyxNQUFNLGlDQUFpQyxHQUFHLENBQU8sTUFBYyxFQUFFLEtBQWUsRUFBRSxHQUFhLEVBQUUsRUFBRTtJQUNqRyxnQkFBTSxDQUFDLElBQUksQ0FBQyxpREFBaUQsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN2RSxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUM7SUFFekIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLDhCQUFvQixFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRWhILEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO1FBQ3RCLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sSUFBSSxHQUFHLEdBQUcsYUFBYSxJQUFJLElBQUksTUFBTSxDQUFDO1FBRTVDLFlBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLEVBQUUs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QyxDQUFDO0lBRUgsaUVBQWlFO0lBQ2pFLE1BQU0sR0FBRyxHQUFHLGdCQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDM0IsSUFBSSxLQUFLLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoRCxJQUFJLENBQUMsWUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUM3QixLQUFLLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUM1QztJQUVELDBGQUEwRjtJQUMxRixLQUFLLE1BQU0sQ0FBQyxJQUFJLGdCQUFnQixFQUFFO1FBQ2hDLGdCQUFNLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQztRQUN0RSxNQUFNLGlDQUFpQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkQsZ0hBQWdIO1FBQ2hILDZDQUE2QztLQUM5QztJQUVELElBQUEsMkJBQW1CLEdBQUUsQ0FBQztJQUN0QixJQUFBLGVBQU8sR0FBRSxDQUFDO0FBQ1osQ0FBQyxDQUFBLENBQUE7QUF6QlksUUFBQSxhQUFhLGlCQXlCekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gJ2x1eG9uJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IGRhaWx5QmFySGVhZGVycywgZGF0YURpcmVjdG9yeSB9IGZyb20gJy4uL2Vudmlyb25tZW50JztcbmltcG9ydCB7IGdldEFsbEJhcnNGcm9tQWxwYWNhLCBtYXBUaW1lZnJhbWVUb0Rpck5hbWUsIGdldFRyYWRlYWJsZUFzc2V0cyB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cblxuLy8gRGVsZXRlIHRoZSB0ZW1wIGZvbGRlci5cbi8vIERvd25sb2FkIGFsbCB0aGUgZGFpbHkgYmFycyBpbnRvIGZpbGVzIGludG8gdGhhdCB0ZW1wIGZvbGRlclxuLy8gbWVyZ2UgdGhlIGZpbGVzLlxuXG5jb25zdCBkaXJlY3RvcnkgPSBgJHtkYXRhRGlyZWN0b3J5fS8ke21hcFRpbWVmcmFtZVRvRGlyTmFtZSgnMURheScpfWA7XG5jb25zdCB0ZW1wRGlyZWN0b3J5ID0gYCR7ZGlyZWN0b3J5fS50ZW1wYDtcbmNvbnN0IG1lcmdlRGlyZWN0b3J5ID0gYCR7ZGlyZWN0b3J5fS5tZXJnZWA7XG5cbmNvbnN0IGRvd25sb2FkQWxsRGFpbHlCYXJzSW50b1RlbXBGaWxlcyA9IGFzeW5jIChzeW1ib2w6IHN0cmluZywgc3RhcnQ6IERhdGVUaW1lLCBlbmQ6IERhdGVUaW1lKSA9PiB7XG4gIGxvZ2dlci5pbmZvKGBHZXR0aW5nIGFsbCBkYWlseSBiYXJzIGZyb20gYWxwYWNhIGZvciBzeW1ib2wgJHtzeW1ib2x9YCk7XG4gIGNvbnN0IHRpbWVmcmFtZSA9ICcxRGF5JztcblxuICBjb25zdCBiYXJzID0gYXdhaXQgZ2V0QWxsQmFyc0Zyb21BbHBhY2Eoc3ltYm9sLCB0aW1lZnJhbWUsIHN0YXJ0LnRvSlNEYXRlKCksIGVuZC5taW51cyh7IGRheXM6IDEgfSkudG9KU0RhdGUoKSk7XG5cbiAgZm9yIChjb25zdCBiYXIgb2YgYmFycykge1xuICAgIGNvbnN0IGRhdGUgPSBiYXIudC50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG4gICAgY29uc3QgZmlsZSA9IGAke3RlbXBEaXJlY3Rvcnl9LyR7ZGF0ZX0uY3N2YDtcblxuICAgIGZzLm1rZGlyU3luYyh0ZW1wRGlyZWN0b3J5LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAgICAgY29uc3QgYmFyRGF0YSA9IGAke3N5bWJvbH0sJHtiYXIub30sJHtiYXIuaH0sJHtiYXIubH0sJHtiYXIuY30sJHsoYmFyIGFzIGFueSkudnd9LCR7KGJhciBhcyBhbnkpLm59YDtcblxuICAgIGlmIChmcy5leGlzdHNTeW5jKGZpbGUpKSB7XG4gICAgICBmcy5hcHBlbmRGaWxlU3luYyhmaWxlLCBiYXJEYXRhICsgJ1xcbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBiYXJIZWFkZXJzID0gYHN5bWJvbCxvcGVuLGhpZ2gsbG93LGNsb3NlLHZvbHVtZV93ZWlnaHRlZCxuYDtcbiAgICAgIGNvbnN0IGJhckZpbGVDb250ZW50ID0gW2JhckhlYWRlcnMsIGJhckRhdGFdLmpvaW4oJ1xcbicpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlLCBiYXJGaWxlQ29udGVudCArICdcXG4nKTtcbiAgICB9XG4gIH1cblxuICBsb2dnZXIuaW5mbyhgRG93bmxvYWRlZCAke2JhcnMubGVuZ3RofSAke3RpbWVmcmFtZX0gYmFycyBmb3IgJHtzeW1ib2x9YCk7XG59XG5cbmV4cG9ydCBjb25zdCBtZXJnZVRlbXBBbmRSZWd1bGFyID0gKCkgPT4ge1xuICBmb3IgKGNvbnN0IGYgb2YgZnMucmVhZGRpclN5bmModGVtcERpcmVjdG9yeSkpIHtcbiAgICBjb25zdCB0ZW1wU3RvY2tGaWxlID0gYCR7dGVtcERpcmVjdG9yeX0vJHtmfWA7XG4gICAgY29uc3Qgc3RvY2tGaWxlID0gYCR7ZGlyZWN0b3J5fS8ke2Z9YDtcbiAgICBjb25zdCBtZXJnZWRTdG9ja0ZpbGUgPSBgJHttZXJnZURpcmVjdG9yeX0vJHtmfWBcblxuICAgIGxvZ2dlci5pbmZvKHN0b2NrRmlsZSk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc3RvY2tGaWxlKSkge1xuICAgICAgbG9nZ2VyLmluZm8oZik7XG5cbiAgICAgIC8vIHNsaWNlIHNraXBzIHRoZSBoZWFkZXIgcm93LlxuICAgICAgY29uc3QgcmVhZFN5bWJvbHNGcm9tRmlsZUludG9EaWN0ID0gKGZpbGVuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvY2tEYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCB7IGVuY29kaW5nOiAndXRmOCcgfSk7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gc3RvY2tEYXRhLnNwbGl0KCdcXG4nKS5maWx0ZXIoeCA9PiB4ICE9ICcnKS5zbGljZSgxKTtcbiAgICAgICAgY29uc3QgbGluZXNCeVN5bWJvbCA9IGxpbmVzLnJlZHVjZSgoZ3JvdXBpbmcsIGxpbmUpID0+IHtcbiAgICAgICAgICBjb25zdCBzeW1ib2wgPSBsaW5lLnNwbGl0KCcsJylbMF1cbiAgICAgICAgICAvLyBDaG9vc2UgdG8gb3ZlcndyaXRlIGV4aXN0aW5nIGR1cGxpY2F0ZSBkYXRhIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgICAvLyBUaGUgbGF0ZXN0IHN0b2NrIGRhdGEgd2lsbCBhbHdheXMgYmUgbmVhciB0aGUgZW5kIG9mIHRoZSBmaWxlLlxuICAgICAgICAgIGdyb3VwaW5nW3N5bWJvbF0gPSBsaW5lO1xuICAgICAgICAgIHJldHVybiBncm91cGluZztcbiAgICAgICAgfSwge30gYXMgeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSlcbiAgICAgICAgcmV0dXJuIGxpbmVzQnlTeW1ib2w7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN0b2NrU3ltYm9scyA9IHJlYWRTeW1ib2xzRnJvbUZpbGVJbnRvRGljdChzdG9ja0ZpbGUpO1xuICAgICAgY29uc3QgdGVtcFN0b2NrU3ltYm9scyA9IHJlYWRTeW1ib2xzRnJvbUZpbGVJbnRvRGljdCh0ZW1wU3RvY2tGaWxlKTtcbiAgICAgIC8vIE1lcmdpbmcgZGljdGlvbmFyaWVzIGxpa2UgdGhpcyBicmluZ3MgaW4gYWxsIHRoZSBzeW1ib2xzIGZyb20gc3RvY2tTeW1ib2xcbiAgICAgIC8vIEFuZCB0aGVuIG92ZXJ3cml0ZXMgdGhlbSB3aXRoIHRlbXBTdG9ja1N5bWJvbHNcbiAgICAgIGNvbnN0IG1lcmdlZCA9IHsgLi4uc3RvY2tTeW1ib2xzLCAuLi50ZW1wU3RvY2tTeW1ib2xzIH07XG4gICAgICBjb25zdCBtZXJnZWRGaWxlQ29udGVudCA9IE9iamVjdC52YWx1ZXMobWVyZ2VkKS5zb3J0KCk7XG5cbiAgICAgIC8vIEBUT0RPIHRoaXMgaXMgcHJvYmFibHkgbm90IGVmZmljaWVudC5cbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhtZXJnZURpcmVjdG9yeSkpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKG1lcmdlRGlyZWN0b3J5KTtcbiAgICAgIH1cblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhtZXJnZWRTdG9ja0ZpbGUsIFtkYWlseUJhckhlYWRlcnMsIC4uLm1lcmdlZEZpbGVDb250ZW50XS5qb2luKCdcXG4nKSk7XG4gICAgICBmcy5jb3B5RmlsZVN5bmMobWVyZ2VkU3RvY2tGaWxlLCBzdG9ja0ZpbGUpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5pbmZvKGBDb3B5aW5nICR7dGVtcFN0b2NrRmlsZX0gdG8gJHtzdG9ja0ZpbGV9YCk7XG4gICAgICBmcy5jb3B5RmlsZVN5bmModGVtcFN0b2NrRmlsZSwgc3RvY2tGaWxlKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7XG4gIGZzLnJtU3luYyh0ZW1wRGlyZWN0b3J5LCB7IGZvcmNlOiB0cnVlLCByZWN1cnNpdmU6IHRydWUgfSk7XG4gIGZzLnJtU3luYyhtZXJnZURpcmVjdG9yeSwgeyBmb3JjZTogdHJ1ZSwgcmVjdXJzaXZlOiB0cnVlIH0pO1xufVxuXG4vLyBJdCdzIHByb2JhYmx5IGJldHRlciB0byB3cml0ZSB0byBhIG5ldyBmaWxlIGFuZCByZXNvbHZlIHRoZSBmaWxlcyBsaW5lIGJ5IGxpbmUuXG5cbmV4cG9ydCBjb25zdCBzeW5jRGFpbHlCYXJzID0gYXN5bmMgKCkgPT4ge1xuICAvLyBJbiBjYXNlIHByb2dyYW0gZGllZCB1bmV4cGVjdGVkbHksIHJ1biBjbGVhbnVwLlxuICBjbGVhbnVwKCk7XG5cbiAgY29uc3QgdHJhZGVhYmxlU3ltYm9scyA9IChhd2FpdCBnZXRUcmFkZWFibGVBc3NldHMoKSkubWFwKHggPT4ge1xuICAgIHJldHVybiB4LnN5bWJvbDtcbiAgfSk7XG5cbiAgLy8gQWRqdXN0IHRvIHRhc3RlIG9yIHNldCB0byBtYW55IHllYXJzIGFnbyBpZiBkb2luZyBhIGZ1bGwgc3luYy5cbiAgY29uc3QgZW5kID0gRGF0ZVRpbWUubm93KCk7XG4gIGxldCBzdGFydCA9IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgbW9udGhzOiAxIH0pO1xuICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyZWN0b3J5KSkge1xuICAgIHN0YXJ0ID0gRGF0ZVRpbWUubm93KCkubWludXMoeyB5ZWFyczogNiB9KTtcbiAgfVxuXG4gIC8vIFdoZW4gZG93bmxvYWRpbmcgZGFpbHkgYmFycywgZmlyc3Qgcm0gdGhlIGV4aXN0aW5nIGRheXMgYmFycyAmIHRoZW4gb3ZlcndyaXRlIHRoZSBiYXJzLlxuICBmb3IgKGNvbnN0IHMgb2YgdHJhZGVhYmxlU3ltYm9scykge1xuICAgIGxvZ2dlci5pbmZvKGBEb3dubG9hZGluZyBkYWlseSBkYXRhIGZvciAke3N9IGZyb20gJHtzdGFydH0gb253YXJkcy5gKTtcbiAgICBhd2FpdCBkb3dubG9hZEFsbERhaWx5QmFyc0ludG9UZW1wRmlsZXMocywgc3RhcnQsIGVuZCk7XG4gICAgLy8gQFRPRE8gcHJvdmlkZSBhIGNoZWNrc3VtIHRoYXQgc2F5cyBpZiB3ZSBoYXZlIHJldHJpZXZlZCBhbGwgYmFycyBpbnN0ZWFkIG9mIHNpbXBseSByZXBvcnRpbmcgaXQncyB1cCB0byBkYXRlLlxuICAgIC8vIGxvZ2dlci5pbmZvKGBTeW1ib2wgJHtzfSBpcyB1cCB0byBkYXRlLmApO1xuICB9XG5cbiAgbWVyZ2VUZW1wQW5kUmVndWxhcigpO1xuICBjbGVhbnVwKCk7XG59XG4iXX0=