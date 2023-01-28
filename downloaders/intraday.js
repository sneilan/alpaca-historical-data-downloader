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
exports.syncLatestIntradayBars = void 0;
const lodash_1 = __importDefault(require("lodash"));
const luxon_1 = require("luxon");
const glob_1 = __importDefault(require("glob"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../logger");
const helpers_1 = require("../helpers");
const environment_1 = require("../environment");
const downloadAllIntradayBars = (dataDirectory, symbol, start, end, timeframe) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info(`Getting all ${timeframe} bars from alpaca for symbol ${symbol}`);
    const bars = yield (0, helpers_1.getAllBarsFromAlpaca)(symbol, timeframe, start.toJSDate(), end.toJSDate());
    const barsGroupedByDate = lodash_1.default.groupBy(bars, (x) => {
        return x.t.toISOString().substring(0, 10);
    });
    for (const date in barsGroupedByDate) {
        const bars = lodash_1.default.sortBy(barsGroupedByDate[date], (x) => { return x.t.valueOf(); });
        const directory = `${dataDirectory}/${(0, helpers_1.mapTimeframeToDirName)(timeframe)}/${date}/`;
        const file = `${directory}/${symbol}.csv`;
        fs_1.default.mkdirSync(directory, { recursive: true });
        const barData = lodash_1.default.map(bars, (bar) => {
            const time = bar.t.valueOf();
            return `${bar.o},${bar.h},${bar.l},${bar.c},${bar.vw},${bar.n},${time}`;
        }).join('\n');
        const barHeaders = `open,high,low,close,volume_weighted,n,unix_time`;
        const barFileContent = [barHeaders, barData].join('\n');
        try {
            fs_1.default.writeFileSync(file, barFileContent);
        }
        catch (err) {
            throw Error(`Unable to write csv ${file} - ${err}`);
        }
    }
    logger_1.logger.info(`Downloaded ${bars.length} ${timeframe} bars for ${symbol}`);
});
const syncLatestIntradayBars = (dataDirectory, timeframe) => __awaiter(void 0, void 0, void 0, function* () {
    const tradeableSymbols = (yield (0, helpers_1.getTradeableAssets)()).map(x => {
        return x.symbol;
    });
    // Adjust to taste or set to many years ago if doing a full sync.
    const calendar = yield environment_1.alpaca.getCalendar({
        start: luxon_1.DateTime.now().minus({ months: 2 }).toJSDate(),
        end: luxon_1.DateTime.now().minus({ days: 1 }).toJSDate()
    });
    for (const s of tradeableSymbols) {
        logger_1.logger.info(`Checking ${s} if it's up to date`);
        for (const c of calendar.reverse()) {
            const downloaded = glob_1.default.sync(`${dataDirectory}/${(0, helpers_1.mapTimeframeToDirName)(timeframe)}/${c.date}/${s}.csv`).length === 1;
            if (!downloaded) {
                logger_1.logger.info(`Downloading ${timeframe} bars for ${s} from ${c.date} onwards.`);
                yield downloadAllIntradayBars(dataDirectory, s, luxon_1.DateTime.fromISO(c.date), luxon_1.DateTime.now().minus({ minutes: 15 }), timeframe);
                break;
            }
        }
        logger_1.logger.info(`Symbol ${s} is up to date.`);
    }
});
exports.syncLatestIntradayBars = syncLatestIntradayBars;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50cmFkYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnRyYWRheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBdUI7QUFFdkIsaUNBQWlDO0FBQ2pDLGdEQUF3QjtBQUN4Qiw0Q0FBb0I7QUFDcEIsc0NBQW1DO0FBQ25DLHdDQUE2RjtBQUM3RixnREFBd0M7QUFFeEMsTUFBTSx1QkFBdUIsR0FBRyxDQUFPLGFBQXFCLEVBQUUsTUFBYyxFQUFFLEtBQWUsRUFBRSxHQUFhLEVBQUUsU0FBMEIsRUFBRSxFQUFFO0lBQzFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxTQUFTLGdDQUFnQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQzlFLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSw4QkFBb0IsRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUU3RixNQUFNLGlCQUFpQixHQUFHLGdCQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQzlDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxNQUFNLElBQUksSUFBSSxpQkFBaUIsRUFBRTtRQUNwQyxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEYsTUFBTSxTQUFTLEdBQUcsR0FBRyxhQUFhLElBQUksSUFBQSwrQkFBcUIsRUFBQyxTQUFTLENBQUMs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QUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFBO2dCQUMzSCxNQUFNO2FBQ1A7U0FDRjtRQUVELGVBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDM0M7QUFDSCxDQUFDLENBQUEsQ0FBQTtBQXhCWSxRQUFBLHNCQUFzQiwwQkF3QmxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEJhcnNWMVRpbWVmcmFtZSB9IGZyb20gJ0BtYXN0ZXItY2hpZWYvYWxwYWNhJztcbmltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSAnbHV4b24nO1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYic7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IGdldEFsbEJhcnNGcm9tQWxwYWNhLCBnZXRUcmFkZWFibGVBc3NldHMsIG1hcFRpbWVmcmFtZVRvRGlyTmFtZSB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IHsgYWxwYWNhIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQnO1xuXG5jb25zdCBkb3dubG9hZEFsbEludHJhZGF5QmFycyA9IGFzeW5jIChkYXRhRGlyZWN0b3J5OiBzdHJpbmcsIHN5bWJvbDogc3RyaW5nLCBzdGFydDogRGF0ZVRpbWUsIGVuZDogRGF0ZVRpbWUsIHRpbWVmcmFtZTogQmFyc1YxVGltZWZyYW1lKSA9PiB7XG4gIGxvZ2dlci5pbmZvKGBHZXR0aW5nIGFsbCAke3RpbWVmcmFtZX0gYmFycyBmcm9tIGFscGFjYSBmb3Igc3ltYm9sICR7c3ltYm9sfWApO1xuICBjb25zdCBiYXJzID0gYXdhaXQgZ2V0QWxsQmFyc0Zyb21BbHBhY2Eoc3ltYm9sLCB0aW1lZnJhbWUsIHN0YXJ0LnRvSlNEYXRlKCksIGVuZC50b0pTRGF0ZSgpKTtcblxuICBjb25zdCBiYXJzR3JvdXBlZEJ5RGF0ZSA9IF8uZ3JvdXBCeShiYXJzLCAoeCkgPT4ge1xuICAgIHJldHVybiB4LnQudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApO1xuICB9KTtcblxuICBmb3IgKGNvbnN0IGRhdGUgaW4gYmFyc0dyb3VwZWRCeURhdGUpIHtcbiAgICBjb25zdCBiYXJzID0gXy5zb3J0QnkoYmFyc0dyb3VwZWRCeURhdGVbZGF0ZV0sICh4KSA9PiB7IHJldHVybiB4LnQudmFsdWVPZigpIH0pO1xuXG4gICAgY29uc3QgZGlyZWN0b3J5ID0gYCR7ZGF0YURpcmVjdG9yeX0vJHttYXBUaW1lZnJhbWVUb0Rpck5hbWUodGltZWZyYW1lKX0vJHtkYXRlfS9gO1xuICAgIGNvbnN0IGZpbGUgPSBgJHtkaXJlY3Rvcnl9LyR7c3ltYm9sfS5jc3ZgO1xuXG4gICAgZnMubWtkaXJTeW5jKGRpcmVjdG9yeSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cbiAgICBjb25zdCBiYXJEYXRhID0gXy5tYXAoYmFycywgKGJhcikgPT4ge1xuICAgICAgY29uc3QgdGltZSA9IGJhci50LnZhbHVlT2YoKTtcblxuICAgICAgcmV0dXJuIGAke2Jhci5vfSwke2Jhci5ofSwke2Jhci5sfSwke2Jhci5jfSwkeyhiYXIgYXMgYW55KS52d30sJHsoYmFyIGFzIGFueSkubn0sJHt0aW1lfWA7XG4gICAgfSkuam9pbignXFxuJyk7XG5cbiAgICBjb25zdCBiYXJIZWFkZXJzID0gYG9wZW4saGlnaCxsb3csY2xvc2Usdm9sdW1lX3dlaWdodGVkLG4sdW5peF90aW1lYDtcbiAgICBjb25zdCBiYXJGaWxlQ29udGVudCA9IFtiYXJIZWFkZXJzLCBiYXJEYXRhXS5qb2luKCdcXG4nKTtcblxuICAgIHRyeSB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGUsIGJhckZpbGVDb250ZW50KTtcbiAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgIHRocm93IEVycm9yKGBVbmFibGUgdG8gd3JpdGUgY3N2ICR7ZmlsZX0gLSAke2Vycn1gKTtcbiAgICB9XG4gIH1cblxuICBsb2dnZXIuaW5mbyhgRG93bmxvYWRlZCAke2JhcnMubGVuZ3RofSAke3RpbWVmcmFtZX0gYmFycyBmb3IgJHtzeW1ib2x9YCk7XG59XG5cblxuZXhwb3J0IGNvbnN0IHN5bmNMYXRlc3RJbnRyYWRheUJhcnMgPSBhc3luYyAoZGF0YURpcmVjdG9yeTogc3RyaW5nLCB0aW1lZnJhbWU6IEJhcnNWMVRpbWVmcmFtZSkgPT4ge1xuICBjb25zdCB0cmFkZWFibGVTeW1ib2xzID0gKGF3YWl0IGdldFRyYWRlYWJsZUFzc2V0cygpKS5tYXAoeCA9PiB7XG4gICAgcmV0dXJuIHguc3ltYm9sO1xuICB9KTtcblxuICAvLyBBZGp1c3QgdG8gdGFzdGUgb3Igc2V0IHRvIG1hbnkgeWVhcnMgYWdvIGlmIGRvaW5nIGEgZnVsbCBzeW5jLlxuICBjb25zdCBjYWxlbmRhciA9IGF3YWl0IGFscGFjYS5nZXRDYWxlbmRhcih7XG4gICAgc3RhcnQ6IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgbW9udGhzOiAyIH0pLnRvSlNEYXRlKCksXG4gICAgZW5kOiBEYXRlVGltZS5ub3coKS5taW51cyh7IGRheXM6IDEgfSkudG9KU0RhdGUoKVxuICB9KTtcblxuICBmb3IgKGNvbnN0IHMgb2YgdHJhZGVhYmxlU3ltYm9scykge1xuICAgIGxvZ2dlci5pbmZvKGBDaGVja2luZyAke3N9IGlmIGl0J3MgdXAgdG8gZGF0ZWApO1xuICAgIGZvciAoY29uc3QgYyBvZiBjYWxlbmRhci5yZXZlcnNlKCkpIHtcbiAgICAgIGNvbnN0IGRvd25sb2FkZWQgPSBnbG9iLnN5bmMoYCR7ZGF0YURpcmVjdG9yeX0vJHttYXBUaW1lZnJhbWVUb0Rpck5hbWUodGltZWZyYW1lKX0vJHtjLmRhdGV9LyR7c30uY3N2YCkubGVuZ3RoID09PSAxO1xuICAgICAgaWYgKCFkb3dubG9hZGVkKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBEb3dubG9hZGluZyAke3RpbWVmcmFtZX0gYmFycyBmb3IgJHtzfSBmcm9tICR7Yy5kYXRlfSBvbndhcmRzLmApO1xuICAgICAgICBhd2FpdCBkb3dubG9hZEFsbEludHJhZGF5QmFycyhkYXRhRGlyZWN0b3J5LCBzLCBEYXRlVGltZS5mcm9tSVNPKGMuZGF0ZSksIERhdGVUaW1lLm5vdygpLm1pbnVzKHsgbWludXRlczogMTUgfSksIHRpbWVmcmFtZSlcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbG9nZ2VyLmluZm8oYFN5bWJvbCAke3N9IGlzIHVwIHRvIGRhdGUuYCk7XG4gIH1cbn1cbiJdfQ==