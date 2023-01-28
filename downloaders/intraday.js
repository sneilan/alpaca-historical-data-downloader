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
    const calendar = yield environment_1.alpaca.getCalendar({
        start: luxon_1.DateTime.now().minus({ years: 6 }).toJSDate(),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50cmFkYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnRyYWRheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBdUI7QUFFdkIsaUNBQWlDO0FBQ2pDLGdEQUF3QjtBQUN4Qiw0Q0FBb0I7QUFDcEIsc0NBQW1DO0FBQ25DLHdDQUE2RjtBQUM3RixnREFBd0M7QUFFeEMsTUFBTSx1QkFBdUIsR0FBRyxDQUFPLGFBQXFCLEVBQUUsTUFBYyxFQUFFLEtBQWUsRUFBRSxHQUFhLEVBQUUsU0FBMEIsRUFBRSxFQUFFO0lBQzFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxTQUFTLGdDQUFnQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQzlFLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSw4QkFBb0IsRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUU3RixNQUFNLGlCQUFpQixHQUFHLGdCQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQzlDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxNQUFNLElBQUksSUFBSSxpQkFBaUIsRUFBRTtRQUNwQyxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEYsTUFBTSxTQUFTLEdBQUcsR0FBRyxhQUFhLElBQUksSUFBQSwrQkFBcUIsRUFBQyxTQUFTLENBQUMs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LEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUE7Z0JBQzNILE1BQU07YUFDUDtTQUNGO1FBRUQsZUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUMzQztBQUNILENBQUMsQ0FBQSxDQUFBO0FBdkJZLFFBQUEsc0JBQXNCLDBCQXVCbEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgQmFyc1YxVGltZWZyYW1lIH0gZnJvbSAnQG1hc3Rlci1jaGllZi9hbHBhY2EnO1xuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tICdsdXhvbic7XG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgZ2V0QWxsQmFyc0Zyb21BbHBhY2EsIGdldFRyYWRlYWJsZUFzc2V0cywgbWFwVGltZWZyYW1lVG9EaXJOYW1lIH0gZnJvbSAnLi4vaGVscGVycyc7XG5pbXBvcnQgeyBhbHBhY2EgfSBmcm9tICcuLi9lbnZpcm9ubWVudCc7XG5cbmNvbnN0IGRvd25sb2FkQWxsSW50cmFkYXlCYXJzID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZywgc3ltYm9sOiBzdHJpbmcsIHN0YXJ0OiBEYXRlVGltZSwgZW5kOiBEYXRlVGltZSwgdGltZWZyYW1lOiBCYXJzVjFUaW1lZnJhbWUpID0+IHtcbiAgbG9nZ2VyLmluZm8oYEdldHRpbmcgYWxsICR7dGltZWZyYW1lfSBiYXJzIGZyb20gYWxwYWNhIGZvciBzeW1ib2wgJHtzeW1ib2x9YCk7XG4gIGNvbnN0IGJhcnMgPSBhd2FpdCBnZXRBbGxCYXJzRnJvbUFscGFjYShzeW1ib2wsIHRpbWVmcmFtZSwgc3RhcnQudG9KU0RhdGUoKSwgZW5kLnRvSlNEYXRlKCkpO1xuXG4gIGNvbnN0IGJhcnNHcm91cGVkQnlEYXRlID0gXy5ncm91cEJ5KGJhcnMsICh4KSA9PiB7XG4gICAgcmV0dXJuIHgudC50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCk7XG4gIH0pO1xuXG4gIGZvciAoY29uc3QgZGF0ZSBpbiBiYXJzR3JvdXBlZEJ5RGF0ZSkge1xuICAgIGNvbnN0IGJhcnMgPSBfLnNvcnRCeShiYXJzR3JvdXBlZEJ5RGF0ZVtkYXRlXSwgKHgpID0+IHsgcmV0dXJuIHgudC52YWx1ZU9mKCkgfSk7XG5cbiAgICBjb25zdCBkaXJlY3RvcnkgPSBgJHtkYXRhRGlyZWN0b3J5fS8ke21hcFRpbWVmcmFtZVRvRGlyTmFtZSh0aW1lZnJhbWUpfS8ke2RhdGV9L2A7XG4gICAgY29uc3QgZmlsZSA9IGAke2RpcmVjdG9yeX0vJHtzeW1ib2x9LmNzdmA7XG5cbiAgICBmcy5ta2RpclN5bmMoZGlyZWN0b3J5LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAgIGNvbnN0IGJhckRhdGEgPSBfLm1hcChiYXJzLCAoYmFyKSA9PiB7XG4gICAgICBjb25zdCB0aW1lID0gYmFyLnQudmFsdWVPZigpO1xuXG4gICAgICByZXR1cm4gYCR7YmFyLm99LCR7YmFyLmh9LCR7YmFyLmx9LCR7YmFyLmN9LCR7KGJhciBhcyBhbnkpLnZ3fSwkeyhiYXIgYXMgYW55KS5ufSwke3RpbWV9YDtcbiAgICB9KS5qb2luKCdcXG4nKTtcblxuICAgIGNvbnN0IGJhckhlYWRlcnMgPSBgb3BlbixoaWdoLGxvdyxjbG9zZSx2b2x1bWVfd2VpZ2h0ZWQsbix1bml4X3RpbWVgO1xuICAgIGNvbnN0IGJhckZpbGVDb250ZW50ID0gW2JhckhlYWRlcnMsIGJhckRhdGFdLmpvaW4oJ1xcbicpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZSwgYmFyRmlsZUNvbnRlbnQpO1xuICAgIH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuICAgICAgdGhyb3cgRXJyb3IoYFVuYWJsZSB0byB3cml0ZSBjc3YgJHtmaWxlfSAtICR7ZXJyfWApO1xuICAgIH1cbiAgfVxuXG4gIGxvZ2dlci5pbmZvKGBEb3dubG9hZGVkICR7YmFycy5sZW5ndGh9ICR7dGltZWZyYW1lfSBiYXJzIGZvciAke3N5bWJvbH1gKTtcbn1cblxuXG5leHBvcnQgY29uc3Qgc3luY0xhdGVzdEludHJhZGF5QmFycyA9IGFzeW5jIChkYXRhRGlyZWN0b3J5OiBzdHJpbmcsIHRpbWVmcmFtZTogQmFyc1YxVGltZWZyYW1lKSA9PiB7XG4gIGNvbnN0IHRyYWRlYWJsZVN5bWJvbHMgPSAoYXdhaXQgZ2V0VHJhZGVhYmxlQXNzZXRzKCkpLm1hcCh4ID0+IHtcbiAgICByZXR1cm4geC5zeW1ib2w7XG4gIH0pO1xuXG4gIGNvbnN0IGNhbGVuZGFyID0gYXdhaXQgYWxwYWNhLmdldENhbGVuZGFyKHtcbiAgICBzdGFydDogRGF0ZVRpbWUubm93KCkubWludXMoeyB5ZWFyczogNiB9KS50b0pTRGF0ZSgpLFxuICAgIGVuZDogRGF0ZVRpbWUubm93KCkubWludXMoeyBkYXlzOiAxIH0pLnRvSlNEYXRlKClcbiAgfSk7XG5cbiAgZm9yIChjb25zdCBzIG9mIHRyYWRlYWJsZVN5bWJvbHMpIHtcbiAgICBsb2dnZXIuaW5mbyhgQ2hlY2tpbmcgJHtzfSBpZiBpdCdzIHVwIHRvIGRhdGVgKTtcbiAgICBmb3IgKGNvbnN0IGMgb2YgY2FsZW5kYXIucmV2ZXJzZSgpKSB7XG4gICAgICBjb25zdCBkb3dubG9hZGVkID0gZ2xvYi5zeW5jKGAke2RhdGFEaXJlY3Rvcnl9LyR7bWFwVGltZWZyYW1lVG9EaXJOYW1lKHRpbWVmcmFtZSl9LyR7Yy5kYXRlfS8ke3N9LmNzdmApLmxlbmd0aCA9PT0gMTtcbiAgICAgIGlmICghZG93bmxvYWRlZCkge1xuICAgICAgICBsb2dnZXIuaW5mbyhgRG93bmxvYWRpbmcgJHt0aW1lZnJhbWV9IGJhcnMgZm9yICR7c30gZnJvbSAke2MuZGF0ZX0gb253YXJkcy5gKTtcbiAgICAgICAgYXdhaXQgZG93bmxvYWRBbGxJbnRyYWRheUJhcnMoZGF0YURpcmVjdG9yeSwgcywgRGF0ZVRpbWUuZnJvbUlTTyhjLmRhdGUpLCBEYXRlVGltZS5ub3coKS5taW51cyh7IG1pbnV0ZXM6IDE1IH0pLCB0aW1lZnJhbWUpXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxvZ2dlci5pbmZvKGBTeW1ib2wgJHtzfSBpcyB1cCB0byBkYXRlLmApO1xuICB9XG59XG4iXX0=