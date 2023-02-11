#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./environment");
const helpers_1 = require("./helpers");
const luxon_1 = require("luxon");
const f = () => __awaiter(void 0, void 0, void 0, function* () {
    // by default if nothing in data directory, does full sync.
    // if there's data in the data directory, sync last 30 days.
    // for now no extra params. just run daily.
    // const symbols = ['AAPL', 'GOOG'];
    const symbols = (yield (0, helpers_1.getTradeableAssets)()).map(x => x.symbol).slice(0, 1000);
    // const bars = await alpacaJs.getMultiBarsV2(symbols, {});
    const bars2 = environment_1.alpacaJs.getMultiBarsAsyncV2(symbols, {
        start: luxon_1.DateTime.now().minus({ days: 30 }).toISODate(),
        end: luxon_1.DateTime.now().minus({ days: 1 }).toISODate(),
        timeframe: environment_1.alpacaJs.newTimeframe(1, environment_1.alpacaJs.timeframeUnit.DAY)
    });
    const symbolsDownloaded = [];
    let totalBars = 0;
    do {
        const blah = yield bars2.next();
        if (blah.done) {
            break;
        }
        totalBars += 1;
        // console.log(blah.value.Symbol);
        if (!symbolsDownloaded.includes(blah.value.Symbol)) {
            symbolsDownloaded.push(blah.value.Symbol);
        }
    } while (true);
    console.log(symbols.length);
    console.log(symbolsDownloaded.length);
    for (const symbol of symbols) {
        if (!symbolsDownloaded.includes(symbol)) {
            console.log(symbol);
        }
    }
    // console.log(totalBars);
    // for (const meow of bars2) {
    // }
    // for (const symbol of symbols) {
    //   const data = bars2.get(symbol) as
    //     | {
    //         Timestamp: string;
    //         OpenPrice: number;
    //         HighPrice: number;
    //         LowPrice: number;
    //         ClosePrice: number;
    //         Volume: number;
    //         TradeCount: number;
    //         VWAP: number;
    //         Symbol: string;
    //       }[]
    //     | undefined;
    //   if (!data) {
    //     console.log(`error retrieving symbol ${symbol}`);
    //     continue;
    //   } else {
    //     console.log(`retrieved ${symbol}`);
    //   }
    //   // console.log(data.length);
    //   // console.log(data[0].Symbol);
    // }
    /*
      Timestamp: '2022-04-01T04:00:00Z',
      OpenPrice: 174.03,
      HighPrice: 174.88,
      LowPrice: 171.94,
      ClosePrice: 174.31,
      Volume: 79064404,
      TradeCount: 659177,
      VWAP: 173.413361,
      Symbol: 'AAPL'
    */
    // console.log(bars2);
    // // program.option('--paper', 'Use paper trading data.', false);
    // program.option('--data-dir <dir>', 'The directory to store historical data from alpaca', './data');
    // program.option(
    //   '--construct-database',
    //   `Constructs a sqlite3 database file called daily.db inside of --data-dir from all 1day files.
    //   If daily.db already exists, updates file.`,
    //   false
    // );
    // program.option(
    //   '--download-1-min-bars',
    //   'Download 1 minute bars in --data-dir. By default syncs all minute bars from 6 years ago.',
    //   false
    // );
    // program.parse();
    // const options = program.opts();
    // if (options.constructDatabase) {
    //   logger.info(`Constructing SQL database in ${options.dataDir}/daily.db`);
    //   buildDb(options.dataDir);
    //   return;
    // }
    // if (options.download1MinBars) {
    //   logger.info(`Downloading 1 min bars`);
    //   syncLatestIntradayBars(options.dataDir, '1Min');
    //   return;
    // }
    // await syncDailyBars(options.dataDir);
});
f();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLCtDQUF5QztBQUN6Qyx1Q0FBK0M7QUFDL0MsaUNBQWlDO0FBRWpDLE1BQU0sQ0FBQyxHQUFHLEdBQVMsRUFBRTtJQUNuQiwyREFBMkQ7SUFDM0QsNERBQTREO0lBQzVELDJDQUEyQztJQUUzQyxvQ0FBb0M7SUFDcEMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFNLElBQUEsNEJBQWtCLEdBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9FLDJEQUEyRDtJQUMzRCxNQUFNLEtBQUssR0FBRyxzQkFBUSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRTtRQUNsRCxLQUFLLEVBQUUsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUU7UUFDckQsR0FBRyxFQUFFLGdCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFO1FBQ2xELFNBQVMsRUFBRSxzQkFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsc0JBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO0tBQ2hFLENBQUMsQ0FBQztJQUNILE1BQU0saUJBQWlCLEdBQWEsRUFBRSxDQUFDO0lBQ3ZDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNsQixHQUFHO1FBQ0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2IsTUFBTTtTQUNQO1FBRUQsU0FBUyxJQUFJLENBQUMsQ0FBQztRQUNmLGtDQUFrQztRQUNsQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDbEQsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDM0M7S0FDRixRQUFRLElBQUksRUFBRTtJQUVmLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEMsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7UUFDNUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3JCO0tBQ0Y7SUFFRCwwQkFBMEI7SUFFMUIsOEJBQThCO0lBQzlCLElBQUk7SUFFSixrQ0FBa0M7SUFDbEMsc0NBQXNDO0lBQ3RDLFVBQVU7SUFDViw2QkFBNkI7SUFDN0IsNkJBQTZCO0lBQzdCLDZCQUE2QjtJQUM3Qiw0QkFBNEI7SUFDNUIsOEJBQThCO0lBQzlCLDBCQUEwQjtJQUMxQiw4QkFBOEI7SUFDOUIsd0JBQXdCO0lBQ3hCLDBCQUEwQjtJQUMxQixZQUFZO0lBQ1osbUJBQW1CO0lBQ25CLGlCQUFpQjtJQUNqQix3REFBd0Q7SUFDeEQsZ0JBQWdCO0lBQ2hCLGFBQWE7SUFDYiwwQ0FBMEM7SUFDMUMsTUFBTTtJQUVOLGlDQUFpQztJQUNqQyxvQ0FBb0M7SUFDcEMsSUFBSTtJQUVKOzs7Ozs7Ozs7O01BVUU7SUFFRixzQkFBc0I7SUFFdEIsa0VBQWtFO0lBQ2xFLHNHQUFzRztJQUN0RyxrQkFBa0I7SUFDbEIsNEJBQTRCO0lBQzVCLGtHQUFrRztJQUNsRyxnREFBZ0Q7SUFDaEQsVUFBVTtJQUNWLEtBQUs7SUFDTCxrQkFBa0I7SUFDbEIsNkJBQTZCO0lBQzdCLGdHQUFnRztJQUNoRyxVQUFVO0lBQ1YsS0FBSztJQUNMLG1CQUFtQjtJQUVuQixrQ0FBa0M7SUFDbEMsbUNBQW1DO0lBQ25DLDZFQUE2RTtJQUM3RSw4QkFBOEI7SUFDOUIsWUFBWTtJQUNaLElBQUk7SUFFSixrQ0FBa0M7SUFDbEMsMkNBQTJDO0lBQzNDLHFEQUFxRDtJQUNyRCxZQUFZO0lBQ1osSUFBSTtJQUVKLHdDQUF3QztBQUMxQyxDQUFDLENBQUEsQ0FBQztBQUNGLENBQUMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgc3luY0RhaWx5QmFycyB9IGZyb20gJy4vZG93bmxvYWRlcnMvMWRheSc7XG5pbXBvcnQgeyBwcm9ncmFtIH0gZnJvbSAnY29tbWFuZGVyJztcbmltcG9ydCB7IGJ1aWxkRGIgfSBmcm9tICcuL2NvbnN0cnVjdC1kYic7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7IHN5bmNMYXRlc3RJbnRyYWRheUJhcnMgfSBmcm9tICcuL2Rvd25sb2FkZXJzL2ludHJhZGF5JztcbmltcG9ydCB7IGFscGFjYUpzIH0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQgeyBnZXRUcmFkZWFibGVBc3NldHMgfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tICdsdXhvbic7XG5cbmNvbnN0IGYgPSBhc3luYyAoKSA9PiB7XG4gIC8vIGJ5IGRlZmF1bHQgaWYgbm90aGluZyBpbiBkYXRhIGRpcmVjdG9yeSwgZG9lcyBmdWxsIHN5bmMuXG4gIC8vIGlmIHRoZXJlJ3MgZGF0YSBpbiB0aGUgZGF0YSBkaXJlY3RvcnksIHN5bmMgbGFzdCAzMCBkYXlzLlxuICAvLyBmb3Igbm93IG5vIGV4dHJhIHBhcmFtcy4ganVzdCBydW4gZGFpbHkuXG5cbiAgLy8gY29uc3Qgc3ltYm9scyA9IFsnQUFQTCcsICdHT09HJ107XG4gIGNvbnN0IHN5bWJvbHMgPSAoYXdhaXQgZ2V0VHJhZGVhYmxlQXNzZXRzKCkpLm1hcCh4ID0+IHguc3ltYm9sKS5zbGljZSgwLCAxMDAwKTtcbiAgLy8gY29uc3QgYmFycyA9IGF3YWl0IGFscGFjYUpzLmdldE11bHRpQmFyc1YyKHN5bWJvbHMsIHt9KTtcbiAgY29uc3QgYmFyczIgPSBhbHBhY2FKcy5nZXRNdWx0aUJhcnNBc3luY1YyKHN5bWJvbHMsIHtcbiAgICBzdGFydDogRGF0ZVRpbWUubm93KCkubWludXMoeyBkYXlzOiAzMCB9KS50b0lTT0RhdGUoKSxcbiAgICBlbmQ6IERhdGVUaW1lLm5vdygpLm1pbnVzKHsgZGF5czogMSB9KS50b0lTT0RhdGUoKSxcbiAgICB0aW1lZnJhbWU6IGFscGFjYUpzLm5ld1RpbWVmcmFtZSgxLCBhbHBhY2FKcy50aW1lZnJhbWVVbml0LkRBWSlcbiAgfSk7XG4gIGNvbnN0IHN5bWJvbHNEb3dubG9hZGVkOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgdG90YWxCYXJzID0gMDtcbiAgZG8ge1xuICAgIGNvbnN0IGJsYWggPSBhd2FpdCBiYXJzMi5uZXh0KCk7XG4gICAgaWYgKGJsYWguZG9uZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdG90YWxCYXJzICs9IDE7XG4gICAgLy8gY29uc29sZS5sb2coYmxhaC52YWx1ZS5TeW1ib2wpO1xuICAgIGlmICghc3ltYm9sc0Rvd25sb2FkZWQuaW5jbHVkZXMoYmxhaC52YWx1ZS5TeW1ib2wpKSB7XG4gICAgICBzeW1ib2xzRG93bmxvYWRlZC5wdXNoKGJsYWgudmFsdWUuU3ltYm9sKTtcbiAgICB9XG4gIH0gd2hpbGUgKHRydWUpO1xuXG4gIGNvbnNvbGUubG9nKHN5bWJvbHMubGVuZ3RoKTtcbiAgY29uc29sZS5sb2coc3ltYm9sc0Rvd25sb2FkZWQubGVuZ3RoKTtcbiAgZm9yIChjb25zdCBzeW1ib2wgb2Ygc3ltYm9scykge1xuICAgIGlmICghc3ltYm9sc0Rvd25sb2FkZWQuaW5jbHVkZXMoc3ltYm9sKSkge1xuICAgICAgY29uc29sZS5sb2coc3ltYm9sKTtcbiAgICB9XG4gIH1cblxuICAvLyBjb25zb2xlLmxvZyh0b3RhbEJhcnMpO1xuXG4gIC8vIGZvciAoY29uc3QgbWVvdyBvZiBiYXJzMikge1xuICAvLyB9XG5cbiAgLy8gZm9yIChjb25zdCBzeW1ib2wgb2Ygc3ltYm9scykge1xuICAvLyAgIGNvbnN0IGRhdGEgPSBiYXJzMi5nZXQoc3ltYm9sKSBhc1xuICAvLyAgICAgfCB7XG4gIC8vICAgICAgICAgVGltZXN0YW1wOiBzdHJpbmc7XG4gIC8vICAgICAgICAgT3BlblByaWNlOiBudW1iZXI7XG4gIC8vICAgICAgICAgSGlnaFByaWNlOiBudW1iZXI7XG4gIC8vICAgICAgICAgTG93UHJpY2U6IG51bWJlcjtcbiAgLy8gICAgICAgICBDbG9zZVByaWNlOiBudW1iZXI7XG4gIC8vICAgICAgICAgVm9sdW1lOiBudW1iZXI7XG4gIC8vICAgICAgICAgVHJhZGVDb3VudDogbnVtYmVyO1xuICAvLyAgICAgICAgIFZXQVA6IG51bWJlcjtcbiAgLy8gICAgICAgICBTeW1ib2w6IHN0cmluZztcbiAgLy8gICAgICAgfVtdXG4gIC8vICAgICB8IHVuZGVmaW5lZDtcbiAgLy8gICBpZiAoIWRhdGEpIHtcbiAgLy8gICAgIGNvbnNvbGUubG9nKGBlcnJvciByZXRyaWV2aW5nIHN5bWJvbCAke3N5bWJvbH1gKTtcbiAgLy8gICAgIGNvbnRpbnVlO1xuICAvLyAgIH0gZWxzZSB7XG4gIC8vICAgICBjb25zb2xlLmxvZyhgcmV0cmlldmVkICR7c3ltYm9sfWApO1xuICAvLyAgIH1cblxuICAvLyAgIC8vIGNvbnNvbGUubG9nKGRhdGEubGVuZ3RoKTtcbiAgLy8gICAvLyBjb25zb2xlLmxvZyhkYXRhWzBdLlN5bWJvbCk7XG4gIC8vIH1cblxuICAvKlxuICAgIFRpbWVzdGFtcDogJzIwMjItMDQtMDFUMDQ6MDA6MDBaJyxcbiAgICBPcGVuUHJpY2U6IDE3NC4wMyxcbiAgICBIaWdoUHJpY2U6IDE3NC44OCxcbiAgICBMb3dQcmljZTogMTcxLjk0LFxuICAgIENsb3NlUHJpY2U6IDE3NC4zMSxcbiAgICBWb2x1bWU6IDc5MDY0NDA0LFxuICAgIFRyYWRlQ291bnQ6IDY1OTE3NyxcbiAgICBWV0FQOiAxNzMuNDEzMzYxLFxuICAgIFN5bWJvbDogJ0FBUEwnXG4gICovXG5cbiAgLy8gY29uc29sZS5sb2coYmFyczIpO1xuXG4gIC8vIC8vIHByb2dyYW0ub3B0aW9uKCctLXBhcGVyJywgJ1VzZSBwYXBlciB0cmFkaW5nIGRhdGEuJywgZmFsc2UpO1xuICAvLyBwcm9ncmFtLm9wdGlvbignLS1kYXRhLWRpciA8ZGlyPicsICdUaGUgZGlyZWN0b3J5IHRvIHN0b3JlIGhpc3RvcmljYWwgZGF0YSBmcm9tIGFscGFjYScsICcuL2RhdGEnKTtcbiAgLy8gcHJvZ3JhbS5vcHRpb24oXG4gIC8vICAgJy0tY29uc3RydWN0LWRhdGFiYXNlJyxcbiAgLy8gICBgQ29uc3RydWN0cyBhIHNxbGl0ZTMgZGF0YWJhc2UgZmlsZSBjYWxsZWQgZGFpbHkuZGIgaW5zaWRlIG9mIC0tZGF0YS1kaXIgZnJvbSBhbGwgMWRheSBmaWxlcy5cbiAgLy8gICBJZiBkYWlseS5kYiBhbHJlYWR5IGV4aXN0cywgdXBkYXRlcyBmaWxlLmAsXG4gIC8vICAgZmFsc2VcbiAgLy8gKTtcbiAgLy8gcHJvZ3JhbS5vcHRpb24oXG4gIC8vICAgJy0tZG93bmxvYWQtMS1taW4tYmFycycsXG4gIC8vICAgJ0Rvd25sb2FkIDEgbWludXRlIGJhcnMgaW4gLS1kYXRhLWRpci4gQnkgZGVmYXVsdCBzeW5jcyBhbGwgbWludXRlIGJhcnMgZnJvbSA2IHllYXJzIGFnby4nLFxuICAvLyAgIGZhbHNlXG4gIC8vICk7XG4gIC8vIHByb2dyYW0ucGFyc2UoKTtcblxuICAvLyBjb25zdCBvcHRpb25zID0gcHJvZ3JhbS5vcHRzKCk7XG4gIC8vIGlmIChvcHRpb25zLmNvbnN0cnVjdERhdGFiYXNlKSB7XG4gIC8vICAgbG9nZ2VyLmluZm8oYENvbnN0cnVjdGluZyBTUUwgZGF0YWJhc2UgaW4gJHtvcHRpb25zLmRhdGFEaXJ9L2RhaWx5LmRiYCk7XG4gIC8vICAgYnVpbGREYihvcHRpb25zLmRhdGFEaXIpO1xuICAvLyAgIHJldHVybjtcbiAgLy8gfVxuXG4gIC8vIGlmIChvcHRpb25zLmRvd25sb2FkMU1pbkJhcnMpIHtcbiAgLy8gICBsb2dnZXIuaW5mbyhgRG93bmxvYWRpbmcgMSBtaW4gYmFyc2ApO1xuICAvLyAgIHN5bmNMYXRlc3RJbnRyYWRheUJhcnMob3B0aW9ucy5kYXRhRGlyLCAnMU1pbicpO1xuICAvLyAgIHJldHVybjtcbiAgLy8gfVxuXG4gIC8vIGF3YWl0IHN5bmNEYWlseUJhcnMob3B0aW9ucy5kYXRhRGlyKTtcbn07XG5mKCk7XG4iXX0=