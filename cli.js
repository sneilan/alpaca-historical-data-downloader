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
    commander_1.program.option('--start <startDate>', 'Date in YYYY-MM-DD format to start downloading data from. Defaults to 5 days ago.', undefined);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUdBLDhDQUFtRDtBQUNuRCx5Q0FBb0M7QUFDcEMsaURBQXlDO0FBQ3pDLHNEQUE4QjtBQUM5QixxREFBZ0U7QUFDaEUsa0RBQWtEO0FBQ2xELG9DQUFvQztBQUVwQyxNQUFNLENBQUMsR0FBRyxHQUFTLEVBQUU7SUFDbkIsMkRBQTJEO0lBQzNELDREQUE0RDtJQUM1RCwyQ0FBMkM7SUFFM0MsbUJBQU8sQ0FBQyxNQUFNLENBQ1oscUJBQXFCLEVBQ3JCLG1GQUFtRixFQUNuRixTQUFTLENBQ1YsQ0FBQztJQUNGLG1CQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLHVFQUF1RSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RILG1CQUFPLENBQUMsTUFBTSxDQUNaLHdCQUF3QixFQUN4QixxRkFBcUYsRUFDckYsU0FBUyxDQUNWLENBQUM7SUFFRixtQkFBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUQsbUJBQU8sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsb0RBQW9ELEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbkcsbUJBQU8sQ0FBQyxNQUFNLENBQ1osc0JBQXNCLEVBQ3RCOzhDQUMwQyxFQUMxQyxLQUFLLENBQ04sQ0FBQztJQUVGLG1CQUFPLENBQUMsTUFBTSxDQUNaLHVCQUF1QixFQUN2QiwwRkFBMEYsRUFDMUYsS0FBSyxDQUNOLENBQUM7SUFFRixtQkFBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2hCLE1BQU0sT0FBTyxHQUFHLG1CQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0IsSUFBSSxPQUFPLENBQUMsaUJBQWlCLEVBQUU7UUFDN0IsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLE9BQU8sQ0FBQyxPQUFPLFdBQVcsQ0FBQyxDQUFDO1FBQ3hFLElBQUEsc0JBQU8sRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekIsT0FBTztLQUNSO0lBRUQsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7UUFDNUIsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN0QyxJQUFBLGlDQUFzQixFQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEQsT0FBTztLQUNSO0lBRUQsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBRSxPQUFPLENBQUMsT0FBb0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQzlFLE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQWdGLENBQUMsQ0FBQztBQUN4RyxDQUFDLENBQUEsQ0FBQztBQUNGLENBQUMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgc3luY0RhaWx5QmFycyB9IGZyb20gJy4vZG93bmxvYWRlcnMvMWRheSc7XG5pbXBvcnQgeyBwcm9ncmFtIH0gZnJvbSAnY29tbWFuZGVyJztcbmltcG9ydCB7IGJ1aWxkRGIgfSBmcm9tICcuL2NvbnN0cnVjdC1kYic7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7IHN5bmNMYXRlc3RJbnRyYWRheUJhcnMgfSBmcm9tICcuL2Rvd25sb2FkZXJzL2ludHJhZGF5Jztcbi8vIGltcG9ydCB7IGdldFRyYWRlYWJsZUFzc2V0cyB9IGZyb20gJy4vaGVscGVycyc7XG4vLyBpbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gJ2x1eG9uJztcblxuY29uc3QgZiA9IGFzeW5jICgpID0+IHtcbiAgLy8gYnkgZGVmYXVsdCBpZiBub3RoaW5nIGluIGRhdGEgZGlyZWN0b3J5LCBkb2VzIGZ1bGwgc3luYy5cbiAgLy8gaWYgdGhlcmUncyBkYXRhIGluIHRoZSBkYXRhIGRpcmVjdG9yeSwgc3luYyBsYXN0IDMwIGRheXMuXG4gIC8vIGZvciBub3cgbm8gZXh0cmEgcGFyYW1zLiBqdXN0IHJ1biBkYWlseS5cblxuICBwcm9ncmFtLm9wdGlvbihcbiAgICAnLS1zdGFydCA8c3RhcnREYXRlPicsXG4gICAgJ0RhdGUgaW4gWVlZWS1NTS1ERCBmb3JtYXQgdG8gc3RhcnQgZG93bmxvYWRpbmcgZGF0YSBmcm9tLiBEZWZhdWx0cyB0byA1IGRheXMgYWdvLicsXG4gICAgdW5kZWZpbmVkXG4gICk7XG4gIHByb2dyYW0ub3B0aW9uKCctLWVuZCA8ZW5kRGF0ZT4nLCAnRGF0ZSBpbiBZWVlZLU1NLUREIGZvcm1hdCB0byBkb3dubG9hZCBkYXRhIHRvLiBEZWZhdWx0cyB0byB5ZXN0ZXJkYXkuJywgdW5kZWZpbmVkKTtcbiAgcHJvZ3JhbS5vcHRpb24oXG4gICAgJy0tc3ltYm9scyBbc3ltYm9scy4uLl0nLFxuICAgICdMaXN0IG9mIHN5bWJvbHMgdG8gZ2VyIGRhdGEgZm9yIGluIGZvcm1hdCBvZiBNU0ZULEFBUEwsR0xEIGRlZmF1bHRzIHRvIGFsbCBzeW1ib2xzLicsXG4gICAgdW5kZWZpbmVkXG4gICk7XG5cbiAgcHJvZ3JhbS5vcHRpb24oJy0tcGFwZXInLCAnVXNlIHBhcGVyIHRyYWRpbmcgZGF0YS4nLCBmYWxzZSk7XG4gIHByb2dyYW0ub3B0aW9uKCctLWRhdGEtZGlyIDxkaXI+JywgJ1RoZSBkaXJlY3RvcnkgdG8gc3RvcmUgaGlzdG9yaWNhbCBkYXRhIGZyb20gYWxwYWNhJywgJy4vZGF0YScpO1xuICBwcm9ncmFtLm9wdGlvbihcbiAgICAnLS1jb25zdHJ1Y3QtZGF0YWJhc2UnLFxuICAgIGBDb25zdHJ1Y3RzIGEgc3FsaXRlMyBkYXRhYmFzZSBmaWxlIGNhbGxlZCBkYWlseS5kYiBpbnNpZGUgb2YgLS1kYXRhLWRpciBmcm9tIGFsbCAxZGF5IGZpbGVzLlxuICAgIElmIGRhaWx5LmRiIGFscmVhZHkgZXhpc3RzLCB1cGRhdGVzIGZpbGUuYCxcbiAgICBmYWxzZVxuICApO1xuXG4gIHByb2dyYW0ub3B0aW9uKFxuICAgICctLWRvd25sb2FkLTEtbWluLWJhcnMnLFxuICAgICdEb3dubG9hZCAxIG1pbnV0ZSBiYXJzIGluIC0tZGF0YS1kaXIuIEJ5IGRlZmF1bHQgc3luY3MgYWxsIG1pbnV0ZSBiYXJzIGZyb20gNiB5ZWFycyBhZ28uJyxcbiAgICBmYWxzZVxuICApO1xuXG4gIHByb2dyYW0ucGFyc2UoKTtcbiAgY29uc3Qgb3B0aW9ucyA9IHByb2dyYW0ub3B0cygpO1xuICBpZiAob3B0aW9ucy5jb25zdHJ1Y3REYXRhYmFzZSkge1xuICAgIGxvZ2dlci5pbmZvKGBDb25zdHJ1Y3RpbmcgU1FMIGRhdGFiYXNlIGluICR7b3B0aW9ucy5kYXRhRGlyfS9kYWlseS5kYmApO1xuICAgIGJ1aWxkRGIob3B0aW9ucy5kYXRhRGlyKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAob3B0aW9ucy5kb3dubG9hZDFNaW5CYXJzKSB7XG4gICAgbG9nZ2VyLmluZm8oYERvd25sb2FkaW5nIDEgbWluIGJhcnNgKTtcbiAgICBzeW5jTGF0ZXN0SW50cmFkYXlCYXJzKG9wdGlvbnMuZGF0YURpciwgJzFNaW4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBvcHRpb25zLnN5bWJvbHMgPSBvcHRpb25zLnN5bWJvbHMgPyAob3B0aW9ucy5zeW1ib2xzIGFzIHN0cmluZ1tdKSA6IHVuZGVmaW5lZDtcbiAgYXdhaXQgc3luY0RhaWx5QmFycyhvcHRpb25zIGFzIHsgZGF0YURpcjogc3RyaW5nOyBzdGFydD86IHN0cmluZzsgZW5kPzogc3RyaW5nOyBzeW1ib2xzPzogc3RyaW5nW10gfSk7XG59O1xuZigpO1xuIl19