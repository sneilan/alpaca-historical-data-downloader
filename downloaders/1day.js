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
    format: ansi_colors_1.default.cyan('{bar}') + '| {percentage}% | {symbol} {value}/{total} Symbols || Speed: {speed}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});
// divide into temp & finalized
exports.dailyBarHeaders = `symbol,open,high,low,close,volume_weighted,n`;
// Delete the temp folder.
// Download all the daily bars into files into that temp folder
// merge the files.
const downloadAllDailyBarsIntoTempFiles = (symbol, start, end, tempDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    // logger.info(`Getting all daily bars from alpaca for symbol ${symbol}`);
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
    b1.increment(1, {
        symbol
    });
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
const syncDailyBars = (dataDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    const directory = `${dataDirectory}/${(0, helpers_1.mapTimeframeToDirName)('1Day')}`;
    const tempDirectory = `${directory}.temp`;
    const mergeDirectory = `${directory}.merge`;
    // In case program died unexpectedly, run cleanup.
    (0, exports.cleanup)(tempDirectory, mergeDirectory);
    const tradeableSymbols = (yield (0, helpers_1.getTradeableAssets)()).map(x => {
        return x.symbol;
    });
    b1.start(tradeableSymbols.length, 0, {
        speed: "N/A"
    });
    // Adjust to taste or set to many years ago if doing a full sync.
    const end = luxon_1.DateTime.now();
    let start = luxon_1.DateTime.now().minus({ months: 1 });
    if (!fs_1.default.existsSync(directory)) {
        start = luxon_1.DateTime.now().minus({ years: 6 });
    }
    // When downloading daily bars, first rm the existing days bars & then overwrite the bars.
    for (const s of tradeableSymbols) {
        // logger.info(`Downloading daily data for ${s} from ${start} onwards.`);
        yield downloadAllDailyBarsIntoTempFiles(s, start, end, tempDirectory);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIjFkYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHVEQUErQjtBQUMvQix3Q0FBNkY7QUFDN0YsNENBQW9CO0FBRXBCLGdFQUF1QztBQUN2Qyw4REFBaUM7QUFFakMsTUFBTSxFQUFFLEdBQUcsSUFBSSxzQkFBVyxDQUFDLFNBQVMsQ0FBQztJQUNuQyxNQUFNLEVBQUUscUJBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsc0VBQXNFO0lBQ3JHLGVBQWUsRUFBRSxRQUFRO0lBQ3pCLGlCQUFpQixFQUFFLFFBQVE7SUFDM0IsVUFBVSxFQUFFLElBQUk7Q0FDakIsQ0FBQyxDQUFDO0FBRUgsK0JBQStCO0FBQ2xCLFFBQUEsZUFBZSxHQUFHLDhDQUE4QyxDQUFDO0FBRTlFLDBCQUEwQjtBQUMxQiwrREFBK0Q7QUFDL0QsbUJBQW1CO0FBRW5CLE1BQU0saUNBQWlDLEdBQUcsQ0FBTyxNQUFjLEVBQUUsS0FBZSxFQUFFLEdBQWEsRUFBRSxhQUFxQixFQUFFLEVBQUU7SUFDeEgsMEVBQTBFO0lBQzFFLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQztJQUV6QixNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsOEJBQW9CLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFFaEgsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7UUFDdEIsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0MsTUFBTSxJQUFJLEdBQUcsR0FBRyxhQUFhLElB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O0lBRUQsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0lBRVYsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsQ0FBQTtJQUNqRSxJQUFBLDJCQUFtQixFQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDOUQsSUFBQSxlQUFPLEVBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZDLGdCQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3RCLENBQUMsQ0FBQSxDQUFBO0FBdENZLFFBQUEsYUFBYSxpQkFzQ3pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tICdsdXhvbic7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBnZXRBbGxCYXJzRnJvbUFscGFjYSwgbWFwVGltZWZyYW1lVG9EaXJOYW1lLCBnZXRUcmFkZWFibGVBc3NldHMgfSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGNsaVByb2dyZXNzIGZyb20gJ2NsaS1wcm9ncmVzcyc7XG5pbXBvcnQgY29sb3JzIGZyb20gJ2Fuc2ktY29sb3JzJztcblxuY29uc3QgYjEgPSBuZXcgY2xpUHJvZ3Jlc3MuU2luZ2xlQmFyKHtcbiAgZm9ybWF0OiBjb2xvcnMuY3lhbigne2Jhcn0nKSArICd8IHtwZXJjZW50YWdlfSUgfCB7c3ltYm9sfSB7dmFsdWV9L3t0b3RhbH0gU3ltYm9scyB8fCBTcGVlZDoge3NwZWVkfScsXG4gIGJhckNvbXBsZXRlQ2hhcjogJ1xcdTI1ODgnLFxuICBiYXJJbmNvbXBsZXRlQ2hhcjogJ1xcdTI1OTEnLFxuICBoaWRlQ3Vyc29yOiB0cnVlXG59KTtcblxuLy8gZGl2aWRlIGludG8gdGVtcCAmIGZpbmFsaXplZFxuZXhwb3J0IGNvbnN0IGRhaWx5QmFySGVhZGVycyA9IGBzeW1ib2wsb3BlbixoaWdoLGxvdyxjbG9zZSx2b2x1bWVfd2VpZ2h0ZWQsbmA7XG5cbi8vIERlbGV0ZSB0aGUgdGVtcCBmb2xkZXIuXG4vLyBEb3dubG9hZCBhbGwgdGhlIGRhaWx5IGJhcnMgaW50byBmaWxlcyBpbnRvIHRoYXQgdGVtcCBmb2xkZXJcbi8vIG1lcmdlIHRoZSBmaWxlcy5cblxuY29uc3QgZG93bmxvYWRBbGxEYWlseUJhcnNJbnRvVGVtcEZpbGVzID0gYXN5bmMgKHN5bWJvbDogc3RyaW5nLCBzdGFydDogRGF0ZVRpbWUsIGVuZDogRGF0ZVRpbWUsIHRlbXBEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICAvLyBsb2dnZXIuaW5mbyhgR2V0dGluZyBhbGwgZGFpbHkgYmFycyBmcm9tIGFscGFjYSBmb3Igc3ltYm9sICR7c3ltYm9sfWApO1xuICBjb25zdCB0aW1lZnJhbWUgPSAnMURheSc7XG5cbiAgY29uc3QgYmFycyA9IGF3YWl0IGdldEFsbEJhcnNGcm9tQWxwYWNhKHN5bWJvbCwgdGltZWZyYW1lLCBzdGFydC50b0pTRGF0ZSgpLCBlbmQubWludXMoeyBkYXlzOiAxIH0pLnRvSlNEYXRlKCkpO1xuXG4gIGZvciAoY29uc3QgYmFyIG9mIGJhcnMpIHtcbiAgICBjb25zdCBkYXRlID0gYmFyLnQudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdO1xuICAgIGNvbnN0IGZpbGUgPSBgJHt0ZW1wRGlyZWN0b3J5fS8ke2RhdGV9LmNzdmA7XG5cbiAgICBmcy5ta2RpclN5bmModGVtcERpcmVjdG9yeSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cbiAgICBjb25zdCBiYXJEYXRhID0gYCR7c3ltYm9sfSwke2Jhci5vfSwke2Jhci5ofSwke2Jhci5sfSwke2Jhci5jfSwkeyhiYXIgYXMgYW55KS52d30sJHsoYmFyIGFzIGFueSkubn1gO1xuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoZmlsZSkpIHtcbiAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKGZpbGUsIGJhckRhdGEgKyAnXFxuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJhckhlYWRlcnMgPSBgc3ltYm9sLG9wZW4saGlnaCxsb3csY2xvc2Usdm9sdW1lX3dlaWdodGVkLG5gO1xuICAgICAgY29uc3QgYmFyRmlsZUNvbnRlbnQgPSBbYmFySGVhZGVycywgYmFyRGF0YV0uam9pbignXFxuJyk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGUsIGJhckZpbGVDb250ZW50ICsgJ1xcbicpO1xuICAgIH1cbiAgfVxuXG4gIGIxLmluY3JlbWVudCgxLCB7XG4gICAgc3ltYm9sXG4gIH0pO1xuXG4gIC8vIGxvZ2dlci5pbmZvKGBEb3dubG9hZGVkICR7YmFycy5sZW5ndGh9ICR7dGltZWZyYW1lfSBiYXJzIGZvciAke3N5bWJvbH1gKTtcbn1cblxuZXhwb3J0IGNvbnN0IG1lcmdlVGVtcEFuZFJlZ3VsYXIgPSAoZGlyZWN0b3J5OiBzdHJpbmcsIHRlbXBEaXJlY3Rvcnk6IHN0cmluZywgbWVyZ2VEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyZWN0b3J5KSkge1xuICAgIGZzLm1rZGlyU3luYyhkaXJlY3RvcnksIHtyZWN1cnNpdmU6IHRydWV9KTtcbiAgfVxuXG4gIGZvciAoY29uc3QgZiBvZiBmcy5yZWFkZGlyU3luYyh0ZW1wRGlyZWN0b3J5KSkge1xuICAgIGNvbnN0IHRlbXBTdG9ja0ZpbGUgPSBgJHt0ZW1wRGlyZWN0b3J5fS8ke2Z9YDtcbiAgICBjb25zdCBzdG9ja0ZpbGUgPSBgJHtkaXJlY3Rvcnl9LyR7Zn1gO1xuICAgIGNvbnN0IG1lcmdlZFN0b2NrRmlsZSA9IGAke21lcmdlRGlyZWN0b3J5fS8ke2Z9YFxuXG4gICAgLy8gbG9nZ2VyLmluZm8oc3RvY2tGaWxlKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhzdG9ja0ZpbGUpKSB7XG4gICAgICAvLyBsb2dnZXIuaW5mbyhmKTtcblxuICAgICAgLy8gc2xpY2Ugc2tpcHMgdGhlIGhlYWRlciByb3cuXG4gICAgICBjb25zdCByZWFkU3ltYm9sc0Zyb21GaWxlSW50b0RpY3QgPSAoZmlsZW5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBzdG9ja0RhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcbiAgICAgICAgY29uc3QgbGluZXMgPSBzdG9ja0RhdGEuc3BsaXQoJ1xcbicpLmZpbHRlcih4ID0+IHggIT0gJycpLnNsaWNlKDEpO1xuICAgICAgICBjb25zdCBsaW5lc0J5U3ltYm9sID0gbGluZXMucmVkdWNlKChncm91cGluZywgbGluZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHN5bWJvbCA9IGxpbmUuc3BsaXQoJywnKVswXVxuICAgICAgICAgIC8vIENob29zZSB0byBvdmVyd3JpdGUgZXhpc3RpbmcgZHVwbGljYXRlIGRhdGEgaWYgaXQgZXhpc3RzLlxuICAgICAgICAgIC8vIFRoZSBsYXRlc3Qgc3RvY2sgZGF0YSB3aWxsIGFsd2F5cyBiZSBuZWFyIHRoZSBlbmQgb2YgdGhlIGZpbGUuXG4gICAgICAgICAgZ3JvdXBpbmdbc3ltYm9sXSA9IGxpbmU7XG4gICAgICAgICAgcmV0dXJuIGdyb3VwaW5nO1xuICAgICAgICB9LCB7fSBhcyB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9KVxuICAgICAgICByZXR1cm4gbGluZXNCeVN5bWJvbDtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3RvY2tTeW1ib2xzID0gcmVhZFN5bWJvbHNGcm9tRmlsZUludG9EaWN0KHN0b2NrRmlsZSk7XG4gICAgICBjb25zdCB0ZW1wU3RvY2tTeW1ib2xzID0gcmVhZFN5bWJvbHNGcm9tRmlsZUludG9EaWN0KHRlbXBTdG9ja0ZpbGUpO1xuICAgICAgLy8gTWVyZ2luZyBkaWN0aW9uYXJpZXMgbGlrZSB0aGlzIGJyaW5ncyBpbiBhbGwgdGhlIHN5bWJvbHMgZnJvbSBzdG9ja1N5bWJvbFxuICAgICAgLy8gQW5kIHRoZW4gb3ZlcndyaXRlcyB0aGVtIHdpdGggdGVtcFN0b2NrU3ltYm9sc1xuICAgICAgY29uc3QgbWVyZ2VkID0geyAuLi5zdG9ja1N5bWJvbHMsIC4uLnRlbXBTdG9ja1N5bWJvbHMgfTtcbiAgICAgIGNvbnN0IG1lcmdlZEZpbGVDb250ZW50ID0gT2JqZWN0LnZhbHVlcyhtZXJnZWQpLnNvcnQoKTtcblxuICAgICAgLy8gQFRPRE8gdGhpcyBpcyBwcm9iYWJseSBub3QgZWZmaWNpZW50LlxuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKG1lcmdlRGlyZWN0b3J5KSkge1xuICAgICAgICBmcy5ta2RpclN5bmMobWVyZ2VEaXJlY3RvcnksIHtyZWN1cnNpdmU6IHRydWV9KTtcbiAgICAgIH1cblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhtZXJnZWRTdG9ja0ZpbGUsIFtkYWlseUJhckhlYWRlcnMsIC4uLm1lcmdlZEZpbGVDb250ZW50XS5qb2luKCdcXG4nKSk7XG4gICAgICBmcy5jb3B5RmlsZVN5bmMobWVyZ2VkU3RvY2tGaWxlLCBzdG9ja0ZpbGUpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGxvZ2dlci5pbmZvKGBDb3B5aW5nICR7dGVtcFN0b2NrRmlsZX0gdG8gJHtzdG9ja0ZpbGV9YCk7XG4gICAgICBmcy5jb3B5RmlsZVN5bmModGVtcFN0b2NrRmlsZSwgc3RvY2tGaWxlKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNsZWFudXAgPSAodGVtcERpcmVjdG9yeTogc3RyaW5nLCBtZXJnZURpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gIGZzLnJtU3luYyh0ZW1wRGlyZWN0b3J5LCB7IGZvcmNlOiB0cnVlLCByZWN1cnNpdmU6IHRydWUgfSk7XG4gIGZzLnJtU3luYyhtZXJnZURpcmVjdG9yeSwgeyBmb3JjZTogdHJ1ZSwgcmVjdXJzaXZlOiB0cnVlIH0pO1xufVxuXG4vLyBJdCdzIHByb2JhYmx5IGJldHRlciB0byB3cml0ZSB0byBhIG5ldyBmaWxlIGFuZCByZXNvbHZlIHRoZSBmaWxlcyBsaW5lIGJ5IGxpbmUuXG5cbmV4cG9ydCBjb25zdCBzeW5jRGFpbHlCYXJzID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuXG4gIGNvbnN0IGRpcmVjdG9yeSA9IGAke2RhdGFEaXJlY3Rvcnl9LyR7bWFwVGltZWZyYW1lVG9EaXJOYW1lKCcxRGF5Jyl9YDtcbiAgY29uc3QgdGVtcERpcmVjdG9yeSA9IGAke2RpcmVjdG9yeX0udGVtcGA7XG4gIGNvbnN0IG1lcmdlRGlyZWN0b3J5ID0gYCR7ZGlyZWN0b3J5fS5tZXJnZWA7XG5cbiAgLy8gSW4gY2FzZSBwcm9ncmFtIGRpZWQgdW5leHBlY3RlZGx5LCBydW4gY2xlYW51cC5cbiAgY2xlYW51cCh0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG5cbiAgY29uc3QgdHJhZGVhYmxlU3ltYm9scyA9IChhd2FpdCBnZXRUcmFkZWFibGVBc3NldHMoKSkubWFwKHggPT4ge1xuICAgIHJldHVybiB4LnN5bWJvbDtcbiAgfSk7XG5cbiAgYjEuc3RhcnQodHJhZGVhYmxlU3ltYm9scy5sZW5ndGgsIDAsIHtcbiAgICBzcGVlZDogXCJOL0FcIlxuICB9KTtcblxuICAvLyBBZGp1c3QgdG8gdGFzdGUgb3Igc2V0IHRvIG1hbnkgeWVhcnMgYWdvIGlmIGRvaW5nIGEgZnVsbCBzeW5jLlxuICBjb25zdCBlbmQgPSBEYXRlVGltZS5ub3coKTtcbiAgbGV0IHN0YXJ0ID0gRGF0ZVRpbWUubm93KCkubWludXMoeyBtb250aHM6IDEgfSk7XG4gIGlmICghZnMuZXhpc3RzU3luYyhkaXJlY3RvcnkpKSB7XG4gICAgc3RhcnQgPSBEYXRlVGltZS5ub3coKS5taW51cyh7IHllYXJzOiA2IH0pO1xuICB9XG5cbiAgLy8gV2hlbiBkb3dubG9hZGluZyBkYWlseSBiYXJzLCBmaXJzdCBybSB0aGUgZXhpc3RpbmcgZGF5cyBiYXJzICYgdGhlbiBvdmVyd3JpdGUgdGhlIGJhcnMuXG4gIGZvciAoY29uc3QgcyBvZiB0cmFkZWFibGVTeW1ib2xzKSB7XG4gICAgLy8gbG9nZ2VyLmluZm8oYERvd25sb2FkaW5nIGRhaWx5IGRhdGEgZm9yICR7c30gZnJvbSAke3N0YXJ0fSBvbndhcmRzLmApO1xuICAgIGF3YWl0IGRvd25sb2FkQWxsRGFpbHlCYXJzSW50b1RlbXBGaWxlcyhzLCBzdGFydCwgZW5kLCB0ZW1wRGlyZWN0b3J5KTtcbiAgICAvLyBAVE9ETyBwcm92aWRlIGEgY2hlY2tzdW0gdGhhdCBzYXlzIGlmIHdlIGhhdmUgcmV0cmlldmVkIGFsbCBiYXJzIGluc3RlYWQgb2Ygc2ltcGx5IHJlcG9ydGluZyBpdCdzIHVwIHRvIGRhdGUuXG4gICAgLy8gbG9nZ2VyLmluZm8oYFN5bWJvbCAke3N9IGlzIHVwIHRvIGRhdGUuYCk7XG4gIH1cblxuICBiMS5zdG9wKCk7XG5cbiAgbG9nZ2VyLmluZm8oYE1lcmdpbmcgYWxwYWNhIHRlbXAgZmlsZXMgaW50byBtYWluIGRhdGEgZm9sZGVyLi4uYClcbiAgbWVyZ2VUZW1wQW5kUmVndWxhcihkaXJlY3RvcnksIHRlbXBEaXJlY3RvcnksIG1lcmdlRGlyZWN0b3J5KTtcbiAgY2xlYW51cCh0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG4gIGxvZ2dlci5pbmZvKGBEb25lIWApXG59XG4iXX0=