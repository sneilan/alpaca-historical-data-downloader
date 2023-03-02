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
    options.symbols = options.symbols ? options.symbols : undefined;
    yield (0, _1day_1.syncDailyBars)(options);
});
f();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUdBLDhDQUFtRDtBQUNuRCx5Q0FBb0M7QUFDcEMsaURBQXlDO0FBQ3pDLHNEQUE4QjtBQUM5QixxREFBZ0U7QUFDaEUsa0RBQWtEO0FBQ2xELG9DQUFvQztBQUVwQyxNQUFNLENBQUMsR0FBRyxHQUFTLEVBQUU7SUFDbkIsMkRBQTJEO0lBQzNELDREQUE0RDtJQUM1RCwyQ0FBMkM7SUFFM0MsbUJBQU8sQ0FBQyxNQUFNLENBQ1oscUJBQXFCLEVBQ3JCLG9GQUFvRixFQUNwRixTQUFTLENBQ1YsQ0FBQztJQUNGLG1CQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLHVFQUF1RSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RILG1CQUFPLENBQUMsTUFBTSxDQUNaLHdCQUF3QixFQUN4QixxRkFBcUYsRUFDckYsU0FBUyxDQUNWLENBQUM7SUFFRixtQkFBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUQsbUJBQU8sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsb0RBQW9ELEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbkcsbUJBQU8sQ0FBQyxNQUFNLENBQ1osc0JBQXNCLEVBQ3RCOzhDQUMwQyxFQUMxQyxLQUFLLENBQ04sQ0FBQztJQUVGLG1CQUFPLENBQUMsTUFBTSxDQUNaLHVCQUF1QixFQUN2QiwwRkFBMEYsRUFDMUYsS0FBSyxDQUNOLENBQUM7SUFFRixtQkFBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2hCLE1BQU0sT0FBTyxHQUFHLG1CQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0IsSUFBSSxPQUFPLENBQUMsaUJBQWlCLEVBQUU7UUFDN0IsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLE9BQU8sQ0FBQyxPQUFPLFdBQVcsQ0FBQyxDQUFDO1FBQ3hFLElBQUEsc0JBQU8sRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekIsT0FBTztLQUNSO0lBRUQsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7UUFDNUIsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN0QyxJQUFBLGlDQUFzQixFQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEQsT0FBTztLQUNSO0lBRUQsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBRSxPQUFPLENBQUMsT0FBb0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQzlFLE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQWdGLENBQUMsQ0FBQztBQUN4RyxDQUFDLENBQUEsQ0FBQztBQUNGLENBQUMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgc3luY0RhaWx5QmFycyB9IGZyb20gJy4vZG93bmxvYWRlcnMvMWRheSc7XG5pbXBvcnQgeyBwcm9ncmFtIH0gZnJvbSAnY29tbWFuZGVyJztcbmltcG9ydCB7IGJ1aWxkRGIgfSBmcm9tICcuL2NvbnN0cnVjdC1kYic7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7IHN5bmNMYXRlc3RJbnRyYWRheUJhcnMgfSBmcm9tICcuL2Rvd25sb2FkZXJzL2ludHJhZGF5Jztcbi8vIGltcG9ydCB7IGdldFRyYWRlYWJsZUFzc2V0cyB9IGZyb20gJy4vaGVscGVycyc7XG4vLyBpbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gJ2x1eG9uJztcblxuY29uc3QgZiA9IGFzeW5jICgpID0+IHtcbiAgLy8gYnkgZGVmYXVsdCBpZiBub3RoaW5nIGluIGRhdGEgZGlyZWN0b3J5LCBkb2VzIGZ1bGwgc3luYy5cbiAgLy8gaWYgdGhlcmUncyBkYXRhIGluIHRoZSBkYXRhIGRpcmVjdG9yeSwgc3luYyBsYXN0IDMwIGRheXMuXG4gIC8vIGZvciBub3cgbm8gZXh0cmEgcGFyYW1zLiBqdXN0IHJ1biBkYWlseS5cblxuICBwcm9ncmFtLm9wdGlvbihcbiAgICAnLS1zdGFydCA8c3RhcnREYXRlPicsXG4gICAgJ0RhdGUgaW4gWVlZWS1NTS1ERCBmb3JtYXQgdG8gc3RhcnQgZG93bmxvYWRpbmcgZGF0YSBmcm9tLiBEZWZhdWx0cyB0byAzMCBkYXlzIGFnby4nLFxuICAgIHVuZGVmaW5lZFxuICApO1xuICBwcm9ncmFtLm9wdGlvbignLS1lbmQgPGVuZERhdGU+JywgJ0RhdGUgaW4gWVlZWS1NTS1ERCBmb3JtYXQgdG8gZG93bmxvYWQgZGF0YSB0by4gRGVmYXVsdHMgdG8geWVzdGVyZGF5LicsIHVuZGVmaW5lZCk7XG4gIHByb2dyYW0ub3B0aW9uKFxuICAgICctLXN5bWJvbHMgW3N5bWJvbHMuLi5dJyxcbiAgICAnTGlzdCBvZiBzeW1ib2xzIHRvIGdlciBkYXRhIGZvciBpbiBmb3JtYXQgb2YgTVNGVCxBQVBMLEdMRCBkZWZhdWx0cyB0byBhbGwgc3ltYm9scy4nLFxuICAgIHVuZGVmaW5lZFxuICApO1xuXG4gIHByb2dyYW0ub3B0aW9uKCctLXBhcGVyJywgJ1VzZSBwYXBlciB0cmFkaW5nIGRhdGEuJywgZmFsc2UpO1xuICBwcm9ncmFtLm9wdGlvbignLS1kYXRhLWRpciA8ZGlyPicsICdUaGUgZGlyZWN0b3J5IHRvIHN0b3JlIGhpc3RvcmljYWwgZGF0YSBmcm9tIGFscGFjYScsICcuL2RhdGEnKTtcbiAgcHJvZ3JhbS5vcHRpb24oXG4gICAgJy0tY29uc3RydWN0LWRhdGFiYXNlJyxcbiAgICBgQ29uc3RydWN0cyBhIHNxbGl0ZTMgZGF0YWJhc2UgZmlsZSBjYWxsZWQgZGFpbHkuZGIgaW5zaWRlIG9mIC0tZGF0YS1kaXIgZnJvbSBhbGwgMWRheSBmaWxlcy5cbiAgICBJZiBkYWlseS5kYiBhbHJlYWR5IGV4aXN0cywgdXBkYXRlcyBmaWxlLmAsXG4gICAgZmFsc2VcbiAgKTtcblxuICBwcm9ncmFtLm9wdGlvbihcbiAgICAnLS1kb3dubG9hZC0xLW1pbi1iYXJzJyxcbiAgICAnRG93bmxvYWQgMSBtaW51dGUgYmFycyBpbiAtLWRhdGEtZGlyLiBCeSBkZWZhdWx0IHN5bmNzIGFsbCBtaW51dGUgYmFycyBmcm9tIDYgeWVhcnMgYWdvLicsXG4gICAgZmFsc2VcbiAgKTtcblxuICBwcm9ncmFtLnBhcnNlKCk7XG4gIGNvbnN0IG9wdGlvbnMgPSBwcm9ncmFtLm9wdHMoKTtcbiAgaWYgKG9wdGlvbnMuY29uc3RydWN0RGF0YWJhc2UpIHtcbiAgICBsb2dnZXIuaW5mbyhgQ29uc3RydWN0aW5nIFNRTCBkYXRhYmFzZSBpbiAke29wdGlvbnMuZGF0YURpcn0vZGFpbHkuZGJgKTtcbiAgICBidWlsZERiKG9wdGlvbnMuZGF0YURpcik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuZG93bmxvYWQxTWluQmFycykge1xuICAgIGxvZ2dlci5pbmZvKGBEb3dubG9hZGluZyAxIG1pbiBiYXJzYCk7XG4gICAgc3luY0xhdGVzdEludHJhZGF5QmFycyhvcHRpb25zLmRhdGFEaXIsICcxTWluJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgb3B0aW9ucy5zeW1ib2xzID0gb3B0aW9ucy5zeW1ib2xzID8gKG9wdGlvbnMuc3ltYm9scyBhcyBzdHJpbmdbXSkgOiB1bmRlZmluZWQ7XG4gIGF3YWl0IHN5bmNEYWlseUJhcnMob3B0aW9ucyBhcyB7IGRhdGFEaXI6IHN0cmluZzsgc3RhcnQ/OiBzdHJpbmc7IGVuZD86IHN0cmluZzsgc3ltYm9scz86IHN0cmluZ1tdIH0pO1xufTtcbmYoKTtcbiJdfQ==