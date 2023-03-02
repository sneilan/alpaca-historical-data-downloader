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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1day_1 = require("./downloaders/1day");
const commander_1 = require("commander");
const construct_db_1 = require("./construct-db");
const logger_1 = __importDefault(require("./logger"));
const intraday_1 = require("./downloaders/intraday");
// import { getTradeableAssets } from './helpers';
// import { DateTime } from 'luxon';
const f = () => __awaiter(void 0, void 0, void 0, function* () {
    // by default if nothing in data directory, does full sync.
    // if there's data in the data directory, sync last 30 days.
    // for now no extra params. just run daily.
    commander_1.program.option('--start <startDate>', 'Date in YYYY-MM-DD format to start downloading data from. Defaults to 30 days ago.', undefined);
    commander_1.program.option('--end <endDate>', 'Date in YYYY-MM-DD format to download data to. Defaults to yesterday.', undefined);
    commander_1.program.option('--symbols [symbols...]', 'List of symbols to ger data for in format of MSFT,AAPL,GLD defaults to all symbols.', undefined);
    commander_1.program.option('--paper', 'Use paper trading data.', false);
    commander_1.program.option('--data-dir <dir>', 'The directory to store historical data from alpaca', './data');
    commander_1.program.option('--construct-database', `Constructs a sqlite3 database file called daily.db inside of --data-dir from all 1day files.
    If daily.db already exists, updates file.`, false);
    commander_1.program.option('--download-1-min-bars', 'Download 1 minute bars in --data-dir. By default syncs all minute bars from 6 years ago.', false);
    commander_1.program.parse();
    const options = commander_1.program.opts();
    if (options.constructDatabase) {
        logger_1.default.info(`Constructing SQL database in ${options.dataDir}/daily.db`);
        (0, construct_db_1.buildDb)(options.dataDir);
        return;
    }
    if (options.download1MinBars) {
        logger_1.default.info(`Downloading 1 min bars`);
        (0, intraday_1.syncLatestIntradayBars)(options.dataDir, '1Min');
        return;
    }
    const symbols = options.symbols ? options.symbols : undefined;
    yield (0, _1day_1.syncDailyBars)(options);
});
f();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUdBLDhDQUFtRDtBQUNuRCx5Q0FBb0M7QUFDcEMsaURBQXlDO0FBQ3pDLHNEQUE4QjtBQUM5QixxREFBZ0U7QUFDaEUsa0RBQWtEO0FBQ2xELG9DQUFvQztBQUVwQyxNQUFNLENBQUMsR0FBRyxHQUFTLEVBQUU7SUFDbkIsMkRBQTJEO0lBQzNELDREQUE0RDtJQUM1RCwyQ0FBMkM7SUFFM0MsbUJBQU8sQ0FBQyxNQUFNLENBQ1oscUJBQXFCLEVBQ3JCLG9GQUFvRixFQUNwRixTQUFTLENBQ1YsQ0FBQztJQUNGLG1CQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLHVFQUF1RSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RILG1CQUFPLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLHFGQUFxRixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRTNJLG1CQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSx5QkFBeUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1RCxtQkFBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxvREFBb0QsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuRyxtQkFBTyxDQUFDLE1BQU0sQ0FDWixzQkFBc0IsRUFDdEI7OENBQzBDLEVBQzFDLEtBQUssQ0FDTixDQUFDO0lBRUYsbUJBQU8sQ0FBQyxNQUFNLENBQ1osdUJBQXVCLEVBQ3ZCLDBGQUEwRixFQUMxRixLQUFLLENBQ04sQ0FBQztJQUVGLG1CQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDaEIsTUFBTSxPQUFPLEdBQUcsbUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMvQixJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtRQUM3QixnQkFBTSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsT0FBTyxDQUFDLE9BQU8sV0FBVyxDQUFDLENBQUM7UUFDeEUsSUFBQSxzQkFBTyxFQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QixPQUFPO0tBQ1I7SUFDRCxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtRQUM1QixnQkFBTSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RDLElBQUEsaUNBQXNCLEVBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNoRCxPQUFPO0tBQ1I7SUFFRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBbUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQzFFLE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQXNHLENBQUMsQ0FBQztBQUM5SCxDQUFDLENBQUEsQ0FBQztBQUNGLENBQUMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgc3luY0RhaWx5QmFycyB9IGZyb20gJy4vZG93bmxvYWRlcnMvMWRheSc7XG5pbXBvcnQgeyBwcm9ncmFtIH0gZnJvbSAnY29tbWFuZGVyJztcbmltcG9ydCB7IGJ1aWxkRGIgfSBmcm9tICcuL2NvbnN0cnVjdC1kYic7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7IHN5bmNMYXRlc3RJbnRyYWRheUJhcnMgfSBmcm9tICcuL2Rvd25sb2FkZXJzL2ludHJhZGF5Jztcbi8vIGltcG9ydCB7IGdldFRyYWRlYWJsZUFzc2V0cyB9IGZyb20gJy4vaGVscGVycyc7XG4vLyBpbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gJ2x1eG9uJztcblxuY29uc3QgZiA9IGFzeW5jICgpID0+IHtcbiAgLy8gYnkgZGVmYXVsdCBpZiBub3RoaW5nIGluIGRhdGEgZGlyZWN0b3J5LCBkb2VzIGZ1bGwgc3luYy5cbiAgLy8gaWYgdGhlcmUncyBkYXRhIGluIHRoZSBkYXRhIGRpcmVjdG9yeSwgc3luYyBsYXN0IDMwIGRheXMuXG4gIC8vIGZvciBub3cgbm8gZXh0cmEgcGFyYW1zLiBqdXN0IHJ1biBkYWlseS5cblxuICBwcm9ncmFtLm9wdGlvbihcbiAgICAnLS1zdGFydCA8c3RhcnREYXRlPicsXG4gICAgJ0RhdGUgaW4gWVlZWS1NTS1ERCBmb3JtYXQgdG8gc3RhcnQgZG93bmxvYWRpbmcgZGF0YSBmcm9tLiBEZWZhdWx0cyB0byAzMCBkYXlzIGFnby4nLFxuICAgIHVuZGVmaW5lZFxuICApO1xuICBwcm9ncmFtLm9wdGlvbignLS1lbmQgPGVuZERhdGU+JywgJ0RhdGUgaW4gWVlZWS1NTS1ERCBmb3JtYXQgdG8gZG93bmxvYWQgZGF0YSB0by4gRGVmYXVsdHMgdG8geWVzdGVyZGF5LicsIHVuZGVmaW5lZCk7XG4gIHByb2dyYW0ub3B0aW9uKCctLXN5bWJvbHMgW3N5bWJvbHMuLi5dJywgJ0xpc3Qgb2Ygc3ltYm9scyB0byBnZXIgZGF0YSBmb3IgaW4gZm9ybWF0IG9mIE1TRlQsQUFQTCxHTEQgZGVmYXVsdHMgdG8gYWxsIHN5bWJvbHMuJywgdW5kZWZpbmVkKTtcblxuICBwcm9ncmFtLm9wdGlvbignLS1wYXBlcicsICdVc2UgcGFwZXIgdHJhZGluZyBkYXRhLicsIGZhbHNlKTtcbiAgcHJvZ3JhbS5vcHRpb24oJy0tZGF0YS1kaXIgPGRpcj4nLCAnVGhlIGRpcmVjdG9yeSB0byBzdG9yZSBoaXN0b3JpY2FsIGRhdGEgZnJvbSBhbHBhY2EnLCAnLi9kYXRhJyk7XG4gIHByb2dyYW0ub3B0aW9uKFxuICAgICctLWNvbnN0cnVjdC1kYXRhYmFzZScsXG4gICAgYENvbnN0cnVjdHMgYSBzcWxpdGUzIGRhdGFiYXNlIGZpbGUgY2FsbGVkIGRhaWx5LmRiIGluc2lkZSBvZiAtLWRhdGEtZGlyIGZyb20gYWxsIDFkYXkgZmlsZXMuXG4gICAgSWYgZGFpbHkuZGIgYWxyZWFkeSBleGlzdHMsIHVwZGF0ZXMgZmlsZS5gLFxuICAgIGZhbHNlXG4gICk7XG5cbiAgcHJvZ3JhbS5vcHRpb24oXG4gICAgJy0tZG93bmxvYWQtMS1taW4tYmFycycsXG4gICAgJ0Rvd25sb2FkIDEgbWludXRlIGJhcnMgaW4gLS1kYXRhLWRpci4gQnkgZGVmYXVsdCBzeW5jcyBhbGwgbWludXRlIGJhcnMgZnJvbSA2IHllYXJzIGFnby4nLFxuICAgIGZhbHNlXG4gICk7XG5cbiAgcHJvZ3JhbS5wYXJzZSgpO1xuICBjb25zdCBvcHRpb25zID0gcHJvZ3JhbS5vcHRzKCk7XG4gIGlmIChvcHRpb25zLmNvbnN0cnVjdERhdGFiYXNlKSB7XG4gICAgbG9nZ2VyLmluZm8oYENvbnN0cnVjdGluZyBTUUwgZGF0YWJhc2UgaW4gJHtvcHRpb25zLmRhdGFEaXJ9L2RhaWx5LmRiYCk7XG4gICAgYnVpbGREYihvcHRpb25zLmRhdGFEaXIpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAob3B0aW9ucy5kb3dubG9hZDFNaW5CYXJzKSB7XG4gICAgbG9nZ2VyLmluZm8oYERvd25sb2FkaW5nIDEgbWluIGJhcnNgKTtcbiAgICBzeW5jTGF0ZXN0SW50cmFkYXlCYXJzKG9wdGlvbnMuZGF0YURpciwgJzFNaW4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBzeW1ib2xzID0gb3B0aW9ucy5zeW1ib2xzID8gb3B0aW9ucy5zeW1ib2xzIGFzIHN0cmluZ1tdIDogdW5kZWZpbmVkO1xuICBhd2FpdCBzeW5jRGFpbHlCYXJzKG9wdGlvbnMgYXMgeyBkYXRhRGlyOiBzdHJpbmc7IHN0YXJ0OiB1bmRlZmluZWQgfCBzdHJpbmc7IGVuZDogdW5kZWZpbmVkIHwgc3RyaW5nLCBzeW1ib2xzPzogc3RyaW5nW10gfSk7XG59O1xuZigpO1xuIl19