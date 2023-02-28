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
const environment_1 = require("./environment");
// import { getTradeableAssets } from './helpers';
// import { DateTime } from 'luxon';
const f = () => __awaiter(void 0, void 0, void 0, function* () {
    // by default if nothing in data directory, does full sync.
    // if there's data in the data directory, sync last 30 days.
    // for now no extra params. just run daily.
    const timeframe = environment_1.alpacaJs.newTimeframe(1, environment_1.alpacaJs.timeframeUnit.HOUR);
    console.log(timeframe);
    process.exit(0);
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
    console.log(options.dataDir);
    yield (0, _1day_1.syncDailyBars)(options);
});
f();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUdBLDhDQUFtRDtBQUNuRCx5Q0FBb0M7QUFDcEMsaURBQXlDO0FBQ3pDLHNEQUE4QjtBQUM5QixxREFBZ0U7QUFDaEUsK0NBQXlDO0FBQ3pDLGtEQUFrRDtBQUNsRCxvQ0FBb0M7QUFFcEMsTUFBTSxDQUFDLEdBQUcsR0FBUyxFQUFFO0lBQ25CLDJEQUEyRDtJQUMzRCw0REFBNEQ7SUFDNUQsMkNBQTJDO0lBRTNDLE1BQU0sU0FBUyxHQUFHLHNCQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxzQkFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFaEIsbUJBQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVELG1CQUFPLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLG9EQUFvRCxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ25HLG1CQUFPLENBQUMsTUFBTSxDQUNaLHNCQUFzQixFQUN0Qjs4Q0FDMEMsRUFDMUMsS0FBSyxDQUNOLENBQUM7SUFDRixtQkFBTyxDQUFDLE1BQU0sQ0FDWix1QkFBdUIsRUFDdkIsMEZBQTBGLEVBQzFGLEtBQUssQ0FDTixDQUFDO0lBQ0YsbUJBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNoQixNQUFNLE9BQU8sR0FBRyxtQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQy9CLElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO1FBQzdCLGdCQUFNLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxPQUFPLENBQUMsT0FBTyxXQUFXLENBQUMsQ0FBQztRQUN4RSxJQUFBLHNCQUFPLEVBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCLE9BQU87S0FDUjtJQUNELElBQUksT0FBTyxDQUFDLGdCQUFnQixFQUFFO1FBQzVCLGdCQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdEMsSUFBQSxpQ0FBc0IsRUFBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELE9BQU87S0FDUjtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQThCLENBQUMsQ0FBQztBQUN0RCxDQUFDLENBQUEsQ0FBQztBQUNGLENBQUMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgc3luY0RhaWx5QmFycyB9IGZyb20gJy4vZG93bmxvYWRlcnMvMWRheSc7XG5pbXBvcnQgeyBwcm9ncmFtIH0gZnJvbSAnY29tbWFuZGVyJztcbmltcG9ydCB7IGJ1aWxkRGIgfSBmcm9tICcuL2NvbnN0cnVjdC1kYic7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7IHN5bmNMYXRlc3RJbnRyYWRheUJhcnMgfSBmcm9tICcuL2Rvd25sb2FkZXJzL2ludHJhZGF5JztcbmltcG9ydCB7IGFscGFjYUpzIH0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG4vLyBpbXBvcnQgeyBnZXRUcmFkZWFibGVBc3NldHMgfSBmcm9tICcuL2hlbHBlcnMnO1xuLy8gaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tICdsdXhvbic7XG5cbmNvbnN0IGYgPSBhc3luYyAoKSA9PiB7XG4gIC8vIGJ5IGRlZmF1bHQgaWYgbm90aGluZyBpbiBkYXRhIGRpcmVjdG9yeSwgZG9lcyBmdWxsIHN5bmMuXG4gIC8vIGlmIHRoZXJlJ3MgZGF0YSBpbiB0aGUgZGF0YSBkaXJlY3RvcnksIHN5bmMgbGFzdCAzMCBkYXlzLlxuICAvLyBmb3Igbm93IG5vIGV4dHJhIHBhcmFtcy4ganVzdCBydW4gZGFpbHkuXG5cbiAgY29uc3QgdGltZWZyYW1lID0gYWxwYWNhSnMubmV3VGltZWZyYW1lKDEsIGFscGFjYUpzLnRpbWVmcmFtZVVuaXQuSE9VUik7XG4gIGNvbnNvbGUubG9nKHRpbWVmcmFtZSk7XG4gIHByb2Nlc3MuZXhpdCgwKTtcblxuICBwcm9ncmFtLm9wdGlvbignLS1wYXBlcicsICdVc2UgcGFwZXIgdHJhZGluZyBkYXRhLicsIGZhbHNlKTtcbiAgcHJvZ3JhbS5vcHRpb24oJy0tZGF0YS1kaXIgPGRpcj4nLCAnVGhlIGRpcmVjdG9yeSB0byBzdG9yZSBoaXN0b3JpY2FsIGRhdGEgZnJvbSBhbHBhY2EnLCAnLi9kYXRhJyk7XG4gIHByb2dyYW0ub3B0aW9uKFxuICAgICctLWNvbnN0cnVjdC1kYXRhYmFzZScsXG4gICAgYENvbnN0cnVjdHMgYSBzcWxpdGUzIGRhdGFiYXNlIGZpbGUgY2FsbGVkIGRhaWx5LmRiIGluc2lkZSBvZiAtLWRhdGEtZGlyIGZyb20gYWxsIDFkYXkgZmlsZXMuXG4gICAgSWYgZGFpbHkuZGIgYWxyZWFkeSBleGlzdHMsIHVwZGF0ZXMgZmlsZS5gLFxuICAgIGZhbHNlXG4gICk7XG4gIHByb2dyYW0ub3B0aW9uKFxuICAgICctLWRvd25sb2FkLTEtbWluLWJhcnMnLFxuICAgICdEb3dubG9hZCAxIG1pbnV0ZSBiYXJzIGluIC0tZGF0YS1kaXIuIEJ5IGRlZmF1bHQgc3luY3MgYWxsIG1pbnV0ZSBiYXJzIGZyb20gNiB5ZWFycyBhZ28uJyxcbiAgICBmYWxzZVxuICApO1xuICBwcm9ncmFtLnBhcnNlKCk7XG4gIGNvbnN0IG9wdGlvbnMgPSBwcm9ncmFtLm9wdHMoKTtcbiAgaWYgKG9wdGlvbnMuY29uc3RydWN0RGF0YWJhc2UpIHtcbiAgICBsb2dnZXIuaW5mbyhgQ29uc3RydWN0aW5nIFNRTCBkYXRhYmFzZSBpbiAke29wdGlvbnMuZGF0YURpcn0vZGFpbHkuZGJgKTtcbiAgICBidWlsZERiKG9wdGlvbnMuZGF0YURpcik7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChvcHRpb25zLmRvd25sb2FkMU1pbkJhcnMpIHtcbiAgICBsb2dnZXIuaW5mbyhgRG93bmxvYWRpbmcgMSBtaW4gYmFyc2ApO1xuICAgIHN5bmNMYXRlc3RJbnRyYWRheUJhcnMob3B0aW9ucy5kYXRhRGlyLCAnMU1pbicpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zb2xlLmxvZyhvcHRpb25zLmRhdGFEaXIpO1xuICBhd2FpdCBzeW5jRGFpbHlCYXJzKG9wdGlvbnMgYXMgeyBkYXRhRGlyOiBzdHJpbmcgfSk7XG59O1xuZigpO1xuIl19