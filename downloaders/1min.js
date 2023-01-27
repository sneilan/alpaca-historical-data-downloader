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
const downloadAllIntradayBars = (symbol, start, end, timeframe) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info(`Getting all 1min bars from alpaca for symbol ${symbol}`);
    const bars = yield (0, helpers_1.getAllBarsFromAlpaca)(symbol, timeframe, start.toJSDate(), end.toJSDate());
    const barsGroupedByDate = lodash_1.default.groupBy(bars, (x) => {
        return x.t.toISOString().substring(0, 10);
    });
    for (const date in barsGroupedByDate) {
        const bars = lodash_1.default.sortBy(barsGroupedByDate[date], (x) => { return x.t.valueOf(); });
        const directory = `${environment_1.dataDirectory}/${(0, helpers_1.mapTimeframeToDirName)(timeframe)}/${date}/`;
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
const syncLatestIntradayBars = (timeframe) => __awaiter(void 0, void 0, void 0, function* () {
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
            const downloaded = glob_1.default.sync(`${environment_1.dataDirectory}/${(0, helpers_1.mapTimeframeToDirName)(timeframe)}/${c.date}/${s}.csv`).length === 1;
            if (!downloaded) {
                logger_1.logger.info(`Downloading ${timeframe} bars for ${s} from ${c.date} onwards.`);
                yield downloadAllIntradayBars(s, luxon_1.DateTime.fromISO(c.date), luxon_1.DateTime.now().minus({ minutes: 15 }), timeframe);
                break;
            }
        }
        logger_1.logger.info(`Symbol ${s} is up to date.`);
    }
});
exports.syncLatestIntradayBars = syncLatestIntradayBars;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMW1pbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIjFtaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQXVCO0FBRXZCLGlDQUFpQztBQUNqQyxnREFBd0I7QUFDeEIsNENBQW9CO0FBQ3BCLHNDQUFtQztBQUNuQyx3Q0FBNkY7QUFDN0YsZ0RBQXVEO0FBR3ZELE1BQU0sdUJBQXVCLEdBQUcsQ0FBTyxNQUFjLEVBQUUsS0FBZSxFQUFFLEdBQWEsRUFBRSxTQUEwQixFQUFFLEVBQUU7SUFDbkgsZUFBTSxDQUFDLElBQUksQ0FBQyxnREFBZ0QsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN0RSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsOEJBQW9CLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFFN0YsTUFBTSxpQkFBaUIsR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUM5QyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssTUFBTSxJQUFJLElBQUksaUJBQWlCLEVBQUU7UUFDcEMsTUFBTSxJQUFJLEdBQUcsZ0JBQUMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWhGLE1BQU0sU0FBUyxHQUFHLEdBQUcsMkJBQWEsSUFBSSxJQUFBLCtCQUFxQixFQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDO1FBQ2xGLE1B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LFNBQVMsQ0FBQyxDQUFBO2dCQUM1RyxNQUFNO2FBQ1A7U0FDRjtRQUVELGVBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDM0M7QUFDSCxDQUFDLENBQUEsQ0FBQTtBQXhCWSxRQUFBLHNCQUFzQiwwQkF3QmxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEJhcnNWMVRpbWVmcmFtZSB9IGZyb20gJ0BtYXN0ZXItY2hpZWYvYWxwYWNhJztcbmltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSAnbHV4b24nO1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYic7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IGdldEFsbEJhcnNGcm9tQWxwYWNhLCBnZXRUcmFkZWFibGVBc3NldHMsIG1hcFRpbWVmcmFtZVRvRGlyTmFtZSB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IHsgYWxwYWNhLCBkYXRhRGlyZWN0b3J5IH0gZnJvbSAnLi4vZW52aXJvbm1lbnQnO1xuXG5cbmNvbnN0IGRvd25sb2FkQWxsSW50cmFkYXlCYXJzID0gYXN5bmMgKHN5bWJvbDogc3RyaW5nLCBzdGFydDogRGF0ZVRpbWUsIGVuZDogRGF0ZVRpbWUsIHRpbWVmcmFtZTogQmFyc1YxVGltZWZyYW1lKSA9PiB7XG4gIGxvZ2dlci5pbmZvKGBHZXR0aW5nIGFsbCAxbWluIGJhcnMgZnJvbSBhbHBhY2EgZm9yIHN5bWJvbCAke3N5bWJvbH1gKTtcbiAgY29uc3QgYmFycyA9IGF3YWl0IGdldEFsbEJhcnNGcm9tQWxwYWNhKHN5bWJvbCwgdGltZWZyYW1lLCBzdGFydC50b0pTRGF0ZSgpLCBlbmQudG9KU0RhdGUoKSk7XG5cbiAgY29uc3QgYmFyc0dyb3VwZWRCeURhdGUgPSBfLmdyb3VwQnkoYmFycywgKHgpID0+IHtcbiAgICByZXR1cm4geC50LnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKTtcbiAgfSk7XG5cbiAgZm9yIChjb25zdCBkYXRlIGluIGJhcnNHcm91cGVkQnlEYXRlKSB7XG4gICAgY29uc3QgYmFycyA9IF8uc29ydEJ5KGJhcnNHcm91cGVkQnlEYXRlW2RhdGVdLCAoeCkgPT4geyByZXR1cm4geC50LnZhbHVlT2YoKSB9KTtcblxuICAgIGNvbnN0IGRpcmVjdG9yeSA9IGAke2RhdGFEaXJlY3Rvcnl9LyR7bWFwVGltZWZyYW1lVG9EaXJOYW1lKHRpbWVmcmFtZSl9LyR7ZGF0ZX0vYDtcbiAgICBjb25zdCBmaWxlID0gYCR7ZGlyZWN0b3J5fS8ke3N5bWJvbH0uY3N2YDtcblxuICAgIGZzLm1rZGlyU3luYyhkaXJlY3RvcnksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuXG4gICAgY29uc3QgYmFyRGF0YSA9IF8ubWFwKGJhcnMsIChiYXIpID0+IHtcbiAgICAgIGNvbnN0IHRpbWUgPSBiYXIudC52YWx1ZU9mKCk7XG5cbiAgICAgIHJldHVybiBgJHtiYXIub30sJHtiYXIuaH0sJHtiYXIubH0sJHtiYXIuY30sJHsoYmFyIGFzIGFueSkudnd9LCR7KGJhciBhcyBhbnkpLm59LCR7dGltZX1gO1xuICAgIH0pLmpvaW4oJ1xcbicpO1xuXG4gICAgY29uc3QgYmFySGVhZGVycyA9IGBvcGVuLGhpZ2gsbG93LGNsb3NlLHZvbHVtZV93ZWlnaHRlZCxuLHVuaXhfdGltZWA7XG4gICAgY29uc3QgYmFyRmlsZUNvbnRlbnQgPSBbYmFySGVhZGVycywgYmFyRGF0YV0uam9pbignXFxuJyk7XG5cbiAgICB0cnkge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlLCBiYXJGaWxlQ29udGVudCk7XG4gICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICB0aHJvdyBFcnJvcihgVW5hYmxlIHRvIHdyaXRlIGNzdiAke2ZpbGV9IC0gJHtlcnJ9YCk7XG4gICAgfVxuICB9XG5cbiAgbG9nZ2VyLmluZm8oYERvd25sb2FkZWQgJHtiYXJzLmxlbmd0aH0gJHt0aW1lZnJhbWV9IGJhcnMgZm9yICR7c3ltYm9sfWApO1xufVxuXG5cbmV4cG9ydCBjb25zdCBzeW5jTGF0ZXN0SW50cmFkYXlCYXJzID0gYXN5bmMgKHRpbWVmcmFtZTogQmFyc1YxVGltZWZyYW1lKSA9PiB7XG4gIGNvbnN0IHRyYWRlYWJsZVN5bWJvbHMgPSAoYXdhaXQgZ2V0VHJhZGVhYmxlQXNzZXRzKCkpLm1hcCh4ID0+IHtcbiAgICByZXR1cm4geC5zeW1ib2w7XG4gIH0pO1xuXG4gIC8vIEFkanVzdCB0byB0YXN0ZSBvciBzZXQgdG8gbWFueSB5ZWFycyBhZ28gaWYgZG9pbmcgYSBmdWxsIHN5bmMuXG4gIGNvbnN0IGNhbGVuZGFyID0gYXdhaXQgYWxwYWNhLmdldENhbGVuZGFyKHtcbiAgICBzdGFydDogRGF0ZVRpbWUubm93KCkubWludXMoeyBtb250aHM6IDIgfSkudG9KU0RhdGUoKSxcbiAgICBlbmQ6IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgZGF5czogMSB9KS50b0pTRGF0ZSgpXG4gIH0pO1xuXG4gIGZvciAoY29uc3QgcyBvZiB0cmFkZWFibGVTeW1ib2xzKSB7XG4gICAgbG9nZ2VyLmluZm8oYENoZWNraW5nICR7c30gaWYgaXQncyB1cCB0byBkYXRlYCk7XG4gICAgZm9yIChjb25zdCBjIG9mIGNhbGVuZGFyLnJldmVyc2UoKSkge1xuICAgICAgY29uc3QgZG93bmxvYWRlZCA9IGdsb2Iuc3luYyhgJHtkYXRhRGlyZWN0b3J5fS8ke21hcFRpbWVmcmFtZVRvRGlyTmFtZSh0aW1lZnJhbWUpfS8ke2MuZGF0ZX0vJHtzfS5jc3ZgKS5sZW5ndGggPT09IDE7XG4gICAgICBpZiAoIWRvd25sb2FkZWQpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oYERvd25sb2FkaW5nICR7dGltZWZyYW1lfSBiYXJzIGZvciAke3N9IGZyb20gJHtjLmRhdGV9IG9ud2FyZHMuYCk7XG4gICAgICAgIGF3YWl0IGRvd25sb2FkQWxsSW50cmFkYXlCYXJzKHMsIERhdGVUaW1lLmZyb21JU08oYy5kYXRlKSwgRGF0ZVRpbWUubm93KCkubWludXMoeyBtaW51dGVzOiAxNSB9KSwgdGltZWZyYW1lKVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsb2dnZXIuaW5mbyhgU3ltYm9sICR7c30gaXMgdXAgdG8gZGF0ZS5gKTtcbiAgfVxufVxuIl19