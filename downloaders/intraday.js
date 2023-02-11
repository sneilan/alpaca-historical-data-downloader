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
const luxon_1 = require("luxon");
const glob_1 = __importDefault(require("glob"));
const logger_1 = require("../logger");
const helpers_1 = require("../helpers");
const environment_1 = require("../environment");
const downloadAllIntradayBars = (dataDirectory, symbol, start, end, timeframe) => __awaiter(void 0, void 0, void 0, function* () {
    // logger.info(`Getting all ${timeframe} bars from alpaca for symbol ${symbol}`);
    // const bars = await getAllBarsFromAlpaca([symbol], timeframe, start.toJSDate(), end.toJSDate());
    // const barsGroupedByDate = _.groupBy(bars, x => {
    //   return x.t.toISOString().substring(0, 10);
    // });
    // for (const date in barsGroupedByDate) {
    //   const bars = _.sortBy(barsGroupedByDate[date], x => {
    //     return x.t.valueOf();
    //   });
    //   const directory = `${dataDirectory}/${mapTimeframeToDirName(timeframe)}/${date}/`;
    //   const file = `${directory}/${symbol}.csv`;
    //   fs.mkdirSync(directory, { recursive: true });
    //   const barData = _.map(bars, bar => {
    //     const time = bar.t.valueOf();
    //     return `${bar.o},${bar.h},${bar.l},${bar.c},${(bar as any).vw},${(bar as any).n},${time}`;
    //   }).join('\n');
    //   const barHeaders = `open,high,low,close,volume_weighted,n,unix_time`;
    //   const barFileContent = [barHeaders, barData].join('\n');
    //   try {
    //     fs.writeFileSync(file, barFileContent);
    //   } catch (err: unknown) {
    //     throw Error(`Unable to write csv ${file} - ${err}`);
    //   }
    // }
    // logger.info(`Downloaded ${bars.length} ${timeframe} bars for ${symbol}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50cmFkYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnRyYWRheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFFQSxpQ0FBaUM7QUFDakMsZ0RBQXdCO0FBRXhCLHNDQUFtQztBQUNuQyx3Q0FBNkY7QUFDN0YsZ0RBQXdDO0FBRXhDLE1BQU0sdUJBQXVCLEdBQUcsQ0FDOUIsYUFBcUIsRUFDckIsTUFBYyxFQUNkLEtBQWUsRUFDZixHQUFhLEVBQ2IsU0FBMEIsRUFDMUIsRUFBRTtJQUNGLGlGQUFpRjtJQUNqRixrR0FBa0c7SUFDbEcsbURBQW1EO0lBQ25ELCtDQUErQztJQUMvQyxNQUFNO0lBQ04sMENBQTBDO0lBQzFDLDBEQUEwRDtJQUMxRCw0QkFBNEI7SUFDNUIsUUFBUTtJQUNSLHVGQUF1RjtJQUN2RiwrQ0FBK0M7SUFDL0Msa0RBQWtEO0lBQ2xELHlDQUF5QztJQUN6QyxvQ0FBb0M7SUFDcEMsaUdBQWlHO0lBQ2pHLG1CQUFtQjtJQUNuQiwwRUFBMEU7SUFDMUUsNkRBQTZEO0lBQzdELFVBQVU7SUFDViw4Q0FBOEM7SUFDOUMsNkJBQTZCO0lBQzdCLDJEQUEyRDtJQUMzRCxNQUFNO0lBQ04sSUFBSTtJQUNKLDRFQUE0RTtBQUM5RSxDQUFDLENBQUEsQ0FBQztBQUVLLE1BQU0sc0JBQXNCLEdBQUcsQ0FBTyxhQUFxQixFQUFFLFNBQTBCLEVBQUUsRUFBRTtJQUNoRyxNQUFNLGdCQUFnQixHQUFHLENBQUMsTUFBTSxJQUFBLDRCQUFrQixHQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDNUQsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxRQUFRLEdBQUcsTUFBTSxvQkFBTSxDQUFDLFdBQVcsQ0FBQztRQUN4QyxLQUFLLEVBQUUsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUU7UUFDcEQsR0FBRyxFQUFFLGdCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO0tBQ2xELENBQUMsQ0FBQztJQUVILEtBQUssTUFBTSxDQUFDLElBQUksZ0JBQWdCLEVBQUU7UUFDaEMsZUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNoRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNsQyxNQUFNLFVBQVUsR0FDZCxjQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsYUFBYSxJQUFJLElBQUEsK0JBQXFCLEVBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFDcEcsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDZixlQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsU0FBUyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQztnQkFDOUUsTUFBTSx1QkFBdUIsQ0FDM0IsYUFBYSxFQUNiLENBQUMsRUFDRCxnQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ3hCLGdCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3JDLFNBQVMsQ0FDVixDQUFDO2dCQUNGLE1BQU07YUFDUDtTQUNGO1FBRUQsZUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUMzQztBQUNILENBQUMsQ0FBQSxDQUFDO0FBOUJXLFFBQUEsc0JBQXNCLDBCQThCakMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgQmFyc1YxVGltZWZyYW1lIH0gZnJvbSAnQG1hc3Rlci1jaGllZi9hbHBhY2EnO1xuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tICdsdXhvbic7XG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgZ2V0QWxsQmFyc0Zyb21BbHBhY2EsIGdldFRyYWRlYWJsZUFzc2V0cywgbWFwVGltZWZyYW1lVG9EaXJOYW1lIH0gZnJvbSAnLi4vaGVscGVycyc7XG5pbXBvcnQgeyBhbHBhY2EgfSBmcm9tICcuLi9lbnZpcm9ubWVudCc7XG5cbmNvbnN0IGRvd25sb2FkQWxsSW50cmFkYXlCYXJzID0gYXN5bmMgKFxuICBkYXRhRGlyZWN0b3J5OiBzdHJpbmcsXG4gIHN5bWJvbDogc3RyaW5nLFxuICBzdGFydDogRGF0ZVRpbWUsXG4gIGVuZDogRGF0ZVRpbWUsXG4gIHRpbWVmcmFtZTogQmFyc1YxVGltZWZyYW1lXG4pID0+IHtcbiAgLy8gbG9nZ2VyLmluZm8oYEdldHRpbmcgYWxsICR7dGltZWZyYW1lfSBiYXJzIGZyb20gYWxwYWNhIGZvciBzeW1ib2wgJHtzeW1ib2x9YCk7XG4gIC8vIGNvbnN0IGJhcnMgPSBhd2FpdCBnZXRBbGxCYXJzRnJvbUFscGFjYShbc3ltYm9sXSwgdGltZWZyYW1lLCBzdGFydC50b0pTRGF0ZSgpLCBlbmQudG9KU0RhdGUoKSk7XG4gIC8vIGNvbnN0IGJhcnNHcm91cGVkQnlEYXRlID0gXy5ncm91cEJ5KGJhcnMsIHggPT4ge1xuICAvLyAgIHJldHVybiB4LnQudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApO1xuICAvLyB9KTtcbiAgLy8gZm9yIChjb25zdCBkYXRlIGluIGJhcnNHcm91cGVkQnlEYXRlKSB7XG4gIC8vICAgY29uc3QgYmFycyA9IF8uc29ydEJ5KGJhcnNHcm91cGVkQnlEYXRlW2RhdGVdLCB4ID0+IHtcbiAgLy8gICAgIHJldHVybiB4LnQudmFsdWVPZigpO1xuICAvLyAgIH0pO1xuICAvLyAgIGNvbnN0IGRpcmVjdG9yeSA9IGAke2RhdGFEaXJlY3Rvcnl9LyR7bWFwVGltZWZyYW1lVG9EaXJOYW1lKHRpbWVmcmFtZSl9LyR7ZGF0ZX0vYDtcbiAgLy8gICBjb25zdCBmaWxlID0gYCR7ZGlyZWN0b3J5fS8ke3N5bWJvbH0uY3N2YDtcbiAgLy8gICBmcy5ta2RpclN5bmMoZGlyZWN0b3J5LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgLy8gICBjb25zdCBiYXJEYXRhID0gXy5tYXAoYmFycywgYmFyID0+IHtcbiAgLy8gICAgIGNvbnN0IHRpbWUgPSBiYXIudC52YWx1ZU9mKCk7XG4gIC8vICAgICByZXR1cm4gYCR7YmFyLm99LCR7YmFyLmh9LCR7YmFyLmx9LCR7YmFyLmN9LCR7KGJhciBhcyBhbnkpLnZ3fSwkeyhiYXIgYXMgYW55KS5ufSwke3RpbWV9YDtcbiAgLy8gICB9KS5qb2luKCdcXG4nKTtcbiAgLy8gICBjb25zdCBiYXJIZWFkZXJzID0gYG9wZW4saGlnaCxsb3csY2xvc2Usdm9sdW1lX3dlaWdodGVkLG4sdW5peF90aW1lYDtcbiAgLy8gICBjb25zdCBiYXJGaWxlQ29udGVudCA9IFtiYXJIZWFkZXJzLCBiYXJEYXRhXS5qb2luKCdcXG4nKTtcbiAgLy8gICB0cnkge1xuICAvLyAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlLCBiYXJGaWxlQ29udGVudCk7XG4gIC8vICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gIC8vICAgICB0aHJvdyBFcnJvcihgVW5hYmxlIHRvIHdyaXRlIGNzdiAke2ZpbGV9IC0gJHtlcnJ9YCk7XG4gIC8vICAgfVxuICAvLyB9XG4gIC8vIGxvZ2dlci5pbmZvKGBEb3dubG9hZGVkICR7YmFycy5sZW5ndGh9ICR7dGltZWZyYW1lfSBiYXJzIGZvciAke3N5bWJvbH1gKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzeW5jTGF0ZXN0SW50cmFkYXlCYXJzID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZywgdGltZWZyYW1lOiBCYXJzVjFUaW1lZnJhbWUpID0+IHtcbiAgY29uc3QgdHJhZGVhYmxlU3ltYm9scyA9IChhd2FpdCBnZXRUcmFkZWFibGVBc3NldHMoKSkubWFwKHggPT4ge1xuICAgIHJldHVybiB4LnN5bWJvbDtcbiAgfSk7XG5cbiAgY29uc3QgY2FsZW5kYXIgPSBhd2FpdCBhbHBhY2EuZ2V0Q2FsZW5kYXIoe1xuICAgIHN0YXJ0OiBEYXRlVGltZS5ub3coKS5taW51cyh7IHllYXJzOiA2IH0pLnRvSlNEYXRlKCksXG4gICAgZW5kOiBEYXRlVGltZS5ub3coKS5taW51cyh7IGRheXM6IDEgfSkudG9KU0RhdGUoKVxuICB9KTtcblxuICBmb3IgKGNvbnN0IHMgb2YgdHJhZGVhYmxlU3ltYm9scykge1xuICAgIGxvZ2dlci5pbmZvKGBDaGVja2luZyAke3N9IGlmIGl0J3MgdXAgdG8gZGF0ZWApO1xuICAgIGZvciAoY29uc3QgYyBvZiBjYWxlbmRhci5yZXZlcnNlKCkpIHtcbiAgICAgIGNvbnN0IGRvd25sb2FkZWQgPVxuICAgICAgICBnbG9iLnN5bmMoYCR7ZGF0YURpcmVjdG9yeX0vJHttYXBUaW1lZnJhbWVUb0Rpck5hbWUodGltZWZyYW1lKX0vJHtjLmRhdGV9LyR7c30uY3N2YCkubGVuZ3RoID09PSAxO1xuICAgICAgaWYgKCFkb3dubG9hZGVkKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBEb3dubG9hZGluZyAke3RpbWVmcmFtZX0gYmFycyBmb3IgJHtzfSBmcm9tICR7Yy5kYXRlfSBvbndhcmRzLmApO1xuICAgICAgICBhd2FpdCBkb3dubG9hZEFsbEludHJhZGF5QmFycyhcbiAgICAgICAgICBkYXRhRGlyZWN0b3J5LFxuICAgICAgICAgIHMsXG4gICAgICAgICAgRGF0ZVRpbWUuZnJvbUlTTyhjLmRhdGUpLFxuICAgICAgICAgIERhdGVUaW1lLm5vdygpLm1pbnVzKHsgbWludXRlczogMTUgfSksXG4gICAgICAgICAgdGltZWZyYW1lXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxvZ2dlci5pbmZvKGBTeW1ib2wgJHtzfSBpcyB1cCB0byBkYXRlLmApO1xuICB9XG59O1xuIl19