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
    // In case program died unexpectedly, run cleanup.
    (0, exports.cleanup)(tempDirectory, mergeDirectory);
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
        yield downloadAllDailyBarsIntoTempFiles(s, start, end, tempDirectory);
        // @TODO provide a checksum that says if we have retrieved all bars instead of simply reporting it's up to date.
        // logger.info(`Symbol ${s} is up to date.`);
    }
    (0, exports.mergeTempAndRegular)(directory, tempDirectory, mergeDirectory);
    (0, exports.cleanup)(tempDirectory, mergeDirectory);
});
exports.syncDailyBars = syncDailyBars;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIjFkYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHVEQUErQjtBQUMvQix3Q0FBNkY7QUFDN0YsNENBQW9CO0FBR3BCLCtCQUErQjtBQUNsQixRQUFBLGVBQWUsR0FBRyw4Q0FBOEMsQ0FBQztBQUU5RSwwQkFBMEI7QUFDMUIsK0RBQStEO0FBQy9ELG1CQUFtQjtBQUVuQixNQUFNLGlDQUFpQyxHQUFHLENBQU8sTUFBYyxFQUFFLEtBQWUsRUFBRSxHQUFhLEVBQUUsYUFBcUIsRUFBRSxFQUFFO0lBQ3hILGdCQUFNLENBQUMsSUFBSSxDQUFDLGlEQUFpRCxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQztJQUV6QixNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsOEJBQW9CLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFFaEgsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7UUFDdEIsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0MsTUFBTSxJQUFJLEdBQUcsR0FBRyxhQUFhLElBQUksSUFBSSxNQUFNLENBQUM7UUFFNUMsWUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUUvQyxNQUFNLE9BQU8sR0FBRyxHQUFHLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxD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LENBQUM7QUFDekMsQ0FBQyxDQUFBLENBQUE7QUE3QlksUUFBQSxhQUFhLGlCQTZCekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gJ2x1eG9uJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IGdldEFsbEJhcnNGcm9tQWxwYWNhLCBtYXBUaW1lZnJhbWVUb0Rpck5hbWUsIGdldFRyYWRlYWJsZUFzc2V0cyB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbi8vIGRpdmlkZSBpbnRvIHRlbXAgJiBmaW5hbGl6ZWRcbmV4cG9ydCBjb25zdCBkYWlseUJhckhlYWRlcnMgPSBgc3ltYm9sLG9wZW4saGlnaCxsb3csY2xvc2Usdm9sdW1lX3dlaWdodGVkLG5gO1xuXG4vLyBEZWxldGUgdGhlIHRlbXAgZm9sZGVyLlxuLy8gRG93bmxvYWQgYWxsIHRoZSBkYWlseSBiYXJzIGludG8gZmlsZXMgaW50byB0aGF0IHRlbXAgZm9sZGVyXG4vLyBtZXJnZSB0aGUgZmlsZXMuXG5cbmNvbnN0IGRvd25sb2FkQWxsRGFpbHlCYXJzSW50b1RlbXBGaWxlcyA9IGFzeW5jIChzeW1ib2w6IHN0cmluZywgc3RhcnQ6IERhdGVUaW1lLCBlbmQ6IERhdGVUaW1lLCB0ZW1wRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgbG9nZ2VyLmluZm8oYEdldHRpbmcgYWxsIGRhaWx5IGJhcnMgZnJvbSBhbHBhY2EgZm9yIHN5bWJvbCAke3N5bWJvbH1gKTtcbiAgY29uc3QgdGltZWZyYW1lID0gJzFEYXknO1xuXG4gIGNvbnN0IGJhcnMgPSBhd2FpdCBnZXRBbGxCYXJzRnJvbUFscGFjYShzeW1ib2wsIHRpbWVmcmFtZSwgc3RhcnQudG9KU0RhdGUoKSwgZW5kLm1pbnVzKHsgZGF5czogMSB9KS50b0pTRGF0ZSgpKTtcblxuICBmb3IgKGNvbnN0IGJhciBvZiBiYXJzKSB7XG4gICAgY29uc3QgZGF0ZSA9IGJhci50LnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXTtcbiAgICBjb25zdCBmaWxlID0gYCR7dGVtcERpcmVjdG9yeX0vJHtkYXRlfS5jc3ZgO1xuXG4gICAgZnMubWtkaXJTeW5jKHRlbXBEaXJlY3RvcnksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuXG4gICAgICBjb25zdCBiYXJEYXRhID0gYCR7c3ltYm9sfSwke2Jhci5vfSwke2Jhci5ofSwke2Jhci5sfSwke2Jhci5jfSwkeyhiYXIgYXMgYW55KS52d30sJHsoYmFyIGFzIGFueSkubn1gO1xuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoZmlsZSkpIHtcbiAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKGZpbGUsIGJhckRhdGEgKyAnXFxuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJhckhlYWRlcnMgPSBgc3ltYm9sLG9wZW4saGlnaCxsb3csY2xvc2Usdm9sdW1lX3dlaWdodGVkLG5gO1xuICAgICAgY29uc3QgYmFyRmlsZUNvbnRlbnQgPSBbYmFySGVhZGVycywgYmFyRGF0YV0uam9pbignXFxuJyk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGUsIGJhckZpbGVDb250ZW50ICsgJ1xcbicpO1xuICAgIH1cbiAgfVxuXG4gIGxvZ2dlci5pbmZvKGBEb3dubG9hZGVkICR7YmFycy5sZW5ndGh9ICR7dGltZWZyYW1lfSBiYXJzIGZvciAke3N5bWJvbH1gKTtcbn1cblxuZXhwb3J0IGNvbnN0IG1lcmdlVGVtcEFuZFJlZ3VsYXIgPSAoZGlyZWN0b3J5OiBzdHJpbmcsIHRlbXBEaXJlY3Rvcnk6IHN0cmluZywgbWVyZ2VEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyZWN0b3J5KSkge1xuICAgIGZzLm1rZGlyU3luYyhkaXJlY3RvcnksIHtyZWN1cnNpdmU6IHRydWV9KTtcbiAgfVxuXG4gIGZvciAoY29uc3QgZiBvZiBmcy5yZWFkZGlyU3luYyh0ZW1wRGlyZWN0b3J5KSkge1xuICAgIGNvbnN0IHRlbXBTdG9ja0ZpbGUgPSBgJHt0ZW1wRGlyZWN0b3J5fS8ke2Z9YDtcbiAgICBjb25zdCBzdG9ja0ZpbGUgPSBgJHtkaXJlY3Rvcnl9LyR7Zn1gO1xuICAgIGNvbnN0IG1lcmdlZFN0b2NrRmlsZSA9IGAke21lcmdlRGlyZWN0b3J5fS8ke2Z9YFxuXG4gICAgbG9nZ2VyLmluZm8oc3RvY2tGaWxlKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhzdG9ja0ZpbGUpKSB7XG4gICAgICBsb2dnZXIuaW5mbyhmKTtcblxuICAgICAgLy8gc2xpY2Ugc2tpcHMgdGhlIGhlYWRlciByb3cuXG4gICAgICBjb25zdCByZWFkU3ltYm9sc0Zyb21GaWxlSW50b0RpY3QgPSAoZmlsZW5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBzdG9ja0RhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcbiAgICAgICAgY29uc3QgbGluZXMgPSBzdG9ja0RhdGEuc3BsaXQoJ1xcbicpLmZpbHRlcih4ID0+IHggIT0gJycpLnNsaWNlKDEpO1xuICAgICAgICBjb25zdCBsaW5lc0J5U3ltYm9sID0gbGluZXMucmVkdWNlKChncm91cGluZywgbGluZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHN5bWJvbCA9IGxpbmUuc3BsaXQoJywnKVswXVxuICAgICAgICAgIC8vIENob29zZSB0byBvdmVyd3JpdGUgZXhpc3RpbmcgZHVwbGljYXRlIGRhdGEgaWYgaXQgZXhpc3RzLlxuICAgICAgICAgIC8vIFRoZSBsYXRlc3Qgc3RvY2sgZGF0YSB3aWxsIGFsd2F5cyBiZSBuZWFyIHRoZSBlbmQgb2YgdGhlIGZpbGUuXG4gICAgICAgICAgZ3JvdXBpbmdbc3ltYm9sXSA9IGxpbmU7XG4gICAgICAgICAgcmV0dXJuIGdyb3VwaW5nO1xuICAgICAgICB9LCB7fSBhcyB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9KVxuICAgICAgICByZXR1cm4gbGluZXNCeVN5bWJvbDtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3RvY2tTeW1ib2xzID0gcmVhZFN5bWJvbHNGcm9tRmlsZUludG9EaWN0KHN0b2NrRmlsZSk7XG4gICAgICBjb25zdCB0ZW1wU3RvY2tTeW1ib2xzID0gcmVhZFN5bWJvbHNGcm9tRmlsZUludG9EaWN0KHRlbXBTdG9ja0ZpbGUpO1xuICAgICAgLy8gTWVyZ2luZyBkaWN0aW9uYXJpZXMgbGlrZSB0aGlzIGJyaW5ncyBpbiBhbGwgdGhlIHN5bWJvbHMgZnJvbSBzdG9ja1N5bWJvbFxuICAgICAgLy8gQW5kIHRoZW4gb3ZlcndyaXRlcyB0aGVtIHdpdGggdGVtcFN0b2NrU3ltYm9sc1xuICAgICAgY29uc3QgbWVyZ2VkID0geyAuLi5zdG9ja1N5bWJvbHMsIC4uLnRlbXBTdG9ja1N5bWJvbHMgfTtcbiAgICAgIGNvbnN0IG1lcmdlZEZpbGVDb250ZW50ID0gT2JqZWN0LnZhbHVlcyhtZXJnZWQpLnNvcnQoKTtcblxuICAgICAgLy8gQFRPRE8gdGhpcyBpcyBwcm9iYWJseSBub3QgZWZmaWNpZW50LlxuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKG1lcmdlRGlyZWN0b3J5KSkge1xuICAgICAgICBmcy5ta2RpclN5bmMobWVyZ2VEaXJlY3RvcnksIHtyZWN1cnNpdmU6IHRydWV9KTtcbiAgICAgIH1cblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhtZXJnZWRTdG9ja0ZpbGUsIFtkYWlseUJhckhlYWRlcnMsIC4uLm1lcmdlZEZpbGVDb250ZW50XS5qb2luKCdcXG4nKSk7XG4gICAgICBmcy5jb3B5RmlsZVN5bmMobWVyZ2VkU3RvY2tGaWxlLCBzdG9ja0ZpbGUpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5pbmZvKGBDb3B5aW5nICR7dGVtcFN0b2NrRmlsZX0gdG8gJHtzdG9ja0ZpbGV9YCk7XG4gICAgICBmcy5jb3B5RmlsZVN5bmModGVtcFN0b2NrRmlsZSwgc3RvY2tGaWxlKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNsZWFudXAgPSAodGVtcERpcmVjdG9yeTogc3RyaW5nLCBtZXJnZURpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gIGZzLnJtU3luYyh0ZW1wRGlyZWN0b3J5LCB7IGZvcmNlOiB0cnVlLCByZWN1cnNpdmU6IHRydWUgfSk7XG4gIGZzLnJtU3luYyhtZXJnZURpcmVjdG9yeSwgeyBmb3JjZTogdHJ1ZSwgcmVjdXJzaXZlOiB0cnVlIH0pO1xufVxuXG4vLyBJdCdzIHByb2JhYmx5IGJldHRlciB0byB3cml0ZSB0byBhIG5ldyBmaWxlIGFuZCByZXNvbHZlIHRoZSBmaWxlcyBsaW5lIGJ5IGxpbmUuXG5cbmV4cG9ydCBjb25zdCBzeW5jRGFpbHlCYXJzID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBjb25zdCBkaXJlY3RvcnkgPSBgJHtkYXRhRGlyZWN0b3J5fS8ke21hcFRpbWVmcmFtZVRvRGlyTmFtZSgnMURheScpfWA7XG4gIGNvbnN0IHRlbXBEaXJlY3RvcnkgPSBgJHtkaXJlY3Rvcnl9LnRlbXBgO1xuICBjb25zdCBtZXJnZURpcmVjdG9yeSA9IGAke2RpcmVjdG9yeX0ubWVyZ2VgO1xuXG4gIC8vIEluIGNhc2UgcHJvZ3JhbSBkaWVkIHVuZXhwZWN0ZWRseSwgcnVuIGNsZWFudXAuXG4gIGNsZWFudXAodGVtcERpcmVjdG9yeSwgbWVyZ2VEaXJlY3RvcnkpO1xuXG4gIGNvbnN0IHRyYWRlYWJsZVN5bWJvbHMgPSAoYXdhaXQgZ2V0VHJhZGVhYmxlQXNzZXRzKCkpLm1hcCh4ID0+IHtcbiAgICByZXR1cm4geC5zeW1ib2w7XG4gIH0pO1xuXG4gIC8vIEFkanVzdCB0byB0YXN0ZSBvciBzZXQgdG8gbWFueSB5ZWFycyBhZ28gaWYgZG9pbmcgYSBmdWxsIHN5bmMuXG4gIGNvbnN0IGVuZCA9IERhdGVUaW1lLm5vdygpO1xuICBsZXQgc3RhcnQgPSBEYXRlVGltZS5ub3coKS5taW51cyh7IG1vbnRoczogMSB9KTtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcmVjdG9yeSkpIHtcbiAgICBzdGFydCA9IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgeWVhcnM6IDYgfSk7XG4gIH1cblxuICAvLyBXaGVuIGRvd25sb2FkaW5nIGRhaWx5IGJhcnMsIGZpcnN0IHJtIHRoZSBleGlzdGluZyBkYXlzIGJhcnMgJiB0aGVuIG92ZXJ3cml0ZSB0aGUgYmFycy5cbiAgZm9yIChjb25zdCBzIG9mIHRyYWRlYWJsZVN5bWJvbHMpIHtcbiAgICBsb2dnZXIuaW5mbyhgRG93bmxvYWRpbmcgZGFpbHkgZGF0YSBmb3IgJHtzfSBmcm9tICR7c3RhcnR9IG9ud2FyZHMuYCk7XG4gICAgYXdhaXQgZG93bmxvYWRBbGxEYWlseUJhcnNJbnRvVGVtcEZpbGVzKHMsIHN0YXJ0LCBlbmQsIHRlbXBEaXJlY3RvcnkpO1xuICAgIC8vIEBUT0RPIHByb3ZpZGUgYSBjaGVja3N1bSB0aGF0IHNheXMgaWYgd2UgaGF2ZSByZXRyaWV2ZWQgYWxsIGJhcnMgaW5zdGVhZCBvZiBzaW1wbHkgcmVwb3J0aW5nIGl0J3MgdXAgdG8gZGF0ZS5cbiAgICAvLyBsb2dnZXIuaW5mbyhgU3ltYm9sICR7c30gaXMgdXAgdG8gZGF0ZS5gKTtcbiAgfVxuXG4gIG1lcmdlVGVtcEFuZFJlZ3VsYXIoZGlyZWN0b3J5LCB0ZW1wRGlyZWN0b3J5LCBtZXJnZURpcmVjdG9yeSk7XG4gIGNsZWFudXAodGVtcERpcmVjdG9yeSwgbWVyZ2VEaXJlY3RvcnkpO1xufVxuIl19