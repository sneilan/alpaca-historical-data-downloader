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
const f = () => __awaiter(void 0, void 0, void 0, function* () {
    // by default if nothing in data directory, does full sync.
    // if there's data in the data directory, sync last 30 days.
    // for now no extra params. just run daily.
    // program.option('--paper', 'Use paper trading data.', false);
    commander_1.program.option('--data-dir <dir>', 'The directory to store historical data from alpaca', './data');
    commander_1.program.option('--construct-database', `Constructs a sqlite3 database file called daily.db inside of --data-dir from all 1day files.
    If daily.db already exists, updates file.`, false);
    commander_1.program.option('--download-1-min-bars', 'Download 1 minute bars in --data-dir. By default syncs all minute bars from 6 years ago.', './data');
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
    yield (0, _1day_1.syncDailyBars)(options.dataDir);
});
f();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUdBLDhDQUFtRDtBQUNuRCx5Q0FBb0M7QUFDcEMsaURBQXlDO0FBQ3pDLHNEQUE4QjtBQUM5QixxREFBZ0U7QUFFaEUsTUFBTSxDQUFDLEdBQUcsR0FBUyxFQUFFO0lBQ25CLDJEQUEyRDtJQUMzRCw0REFBNEQ7SUFDNUQsMkNBQTJDO0lBRTNDLCtEQUErRDtJQUMvRCxtQkFBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxvREFBb0QsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuRyxtQkFBTyxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRTs4Q0FDSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JELG1CQUFPLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLDBGQUEwRixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzlJLG1CQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7SUFFaEIsTUFBTSxPQUFPLEdBQUcsbUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMvQixJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtRQUM3QixnQkFBTSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsT0FBTyxDQUFDLE9BQU8sV0FBVyxDQUFDLENBQUM7UUFDeEUsSUFBQSxzQkFBTyxFQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QixPQUFPO0tBQ1I7SUFFRCxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtRQUM1QixnQkFBTSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RDLElBQUEsaUNBQXNCLEVBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNoRCxPQUFPO0tBQ1I7SUFFRCxNQUFNLElBQUEscUJBQWEsRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFBLENBQUE7QUFFRCxDQUFDLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IHN5bmNEYWlseUJhcnMgfSBmcm9tICcuL2Rvd25sb2FkZXJzLzFkYXknO1xuaW1wb3J0IHsgcHJvZ3JhbSB9IGZyb20gJ2NvbW1hbmRlcic7XG5pbXBvcnQgeyBidWlsZERiIH0gZnJvbSAnLi9jb25zdHJ1Y3QtZGInO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgeyBzeW5jTGF0ZXN0SW50cmFkYXlCYXJzIH0gZnJvbSAnLi9kb3dubG9hZGVycy9pbnRyYWRheSc7XG5cbmNvbnN0IGYgPSBhc3luYyAoKSA9PiB7XG4gIC8vIGJ5IGRlZmF1bHQgaWYgbm90aGluZyBpbiBkYXRhIGRpcmVjdG9yeSwgZG9lcyBmdWxsIHN5bmMuXG4gIC8vIGlmIHRoZXJlJ3MgZGF0YSBpbiB0aGUgZGF0YSBkaXJlY3RvcnksIHN5bmMgbGFzdCAzMCBkYXlzLlxuICAvLyBmb3Igbm93IG5vIGV4dHJhIHBhcmFtcy4ganVzdCBydW4gZGFpbHkuXG4gIFxuICAvLyBwcm9ncmFtLm9wdGlvbignLS1wYXBlcicsICdVc2UgcGFwZXIgdHJhZGluZyBkYXRhLicsIGZhbHNlKTtcbiAgcHJvZ3JhbS5vcHRpb24oJy0tZGF0YS1kaXIgPGRpcj4nLCAnVGhlIGRpcmVjdG9yeSB0byBzdG9yZSBoaXN0b3JpY2FsIGRhdGEgZnJvbSBhbHBhY2EnLCAnLi9kYXRhJyk7XG4gIHByb2dyYW0ub3B0aW9uKCctLWNvbnN0cnVjdC1kYXRhYmFzZScsIGBDb25zdHJ1Y3RzIGEgc3FsaXRlMyBkYXRhYmFzZSBmaWxlIGNhbGxlZCBkYWlseS5kYiBpbnNpZGUgb2YgLS1kYXRhLWRpciBmcm9tIGFsbCAxZGF5IGZpbGVzLlxuICAgIElmIGRhaWx5LmRiIGFscmVhZHkgZXhpc3RzLCB1cGRhdGVzIGZpbGUuYCwgZmFsc2UpO1xuICBwcm9ncmFtLm9wdGlvbignLS1kb3dubG9hZC0xLW1pbi1iYXJzJywgJ0Rvd25sb2FkIDEgbWludXRlIGJhcnMgaW4gLS1kYXRhLWRpci4gQnkgZGVmYXVsdCBzeW5jcyBhbGwgbWludXRlIGJhcnMgZnJvbSA2IHllYXJzIGFnby4nLCAnLi9kYXRhJyk7XG4gIHByb2dyYW0ucGFyc2UoKTtcblxuICBjb25zdCBvcHRpb25zID0gcHJvZ3JhbS5vcHRzKCk7XG4gIGlmIChvcHRpb25zLmNvbnN0cnVjdERhdGFiYXNlKSB7XG4gICAgbG9nZ2VyLmluZm8oYENvbnN0cnVjdGluZyBTUUwgZGF0YWJhc2UgaW4gJHtvcHRpb25zLmRhdGFEaXJ9L2RhaWx5LmRiYCk7XG4gICAgYnVpbGREYihvcHRpb25zLmRhdGFEaXIpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmRvd25sb2FkMU1pbkJhcnMpIHtcbiAgICBsb2dnZXIuaW5mbyhgRG93bmxvYWRpbmcgMSBtaW4gYmFyc2ApO1xuICAgIHN5bmNMYXRlc3RJbnRyYWRheUJhcnMob3B0aW9ucy5kYXRhRGlyLCAnMU1pbicpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGF3YWl0IHN5bmNEYWlseUJhcnMob3B0aW9ucy5kYXRhRGlyKTtcbn1cblxuZigpO1xuIl19