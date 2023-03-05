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
    commander_1.program.option('--add-indexes', `Add indexes to daily db database.`, false);
    commander_1.program.option('--download-1-min-bars', 'Download 1 minute bars in --data-dir. By default syncs all minute bars from 6 years ago.', false);
    commander_1.program.parse();
    const options = commander_1.program.opts();
    if (options.constructDatabase) {
        logger_1.default.info(`Constructing SQL database in ${options.dataDir}/daily.db`);
        (0, construct_db_1.buildDb)(options.dataDir);
        return;
    }
    if (options.addIndexes) {
        logger_1.default.info(`Add indexes to database ${options.dataDir}/daily.db`);
        (0, construct_db_1.addIndexes)(options.dataDir);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUdBLDhDQUFtRDtBQUNuRCx5Q0FBb0M7QUFDcEMsaURBQXFEO0FBQ3JELHNEQUE4QjtBQUM5QixxREFBZ0U7QUFDaEUsa0RBQWtEO0FBQ2xELG9DQUFvQztBQUVwQyxNQUFNLENBQUMsR0FBRyxHQUFTLEVBQUU7SUFDbkIsMkRBQTJEO0lBQzNELDREQUE0RDtJQUM1RCwyQ0FBMkM7SUFFM0MsbUJBQU8sQ0FBQyxNQUFNLENBQ1oscUJBQXFCLEVBQ3JCLG1GQUFtRixFQUNuRixTQUFTLENBQ1YsQ0FBQztJQUNGLG1CQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLHVFQUF1RSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RILG1CQUFPLENBQUMsTUFBTSxDQUNaLHdCQUF3QixFQUN4QixxRkFBcUYsRUFDckYsU0FBUyxDQUNWLENBQUM7SUFFRixtQkFBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUQsbUJBQU8sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsb0RBQW9ELEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbkcsbUJBQU8sQ0FBQyxNQUFNLENBQ1osc0JBQXNCLEVBQ3RCOzhDQUMwQyxFQUMxQyxLQUFLLENBQ04sQ0FBQztJQUVGLG1CQUFPLENBQUMsTUFBTSxDQUNaLGVBQWUsRUFDZixtQ0FBbUMsRUFDbkMsS0FBSyxDQUNOLENBQUM7SUFFRixtQkFBTyxDQUFDLE1BQU0sQ0FDWix1QkFBdUIsRUFDdkIsMEZBQTBGLEVBQzFGLEtBQUssQ0FDTixDQUFDO0lBRUYsbUJBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNoQixNQUFNLE9BQU8sR0FBRyxtQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQy9CLElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO1FBQzdCLGdCQUFNLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxPQUFPLENBQUMsT0FBTyxXQUFXLENBQUMsQ0FBQztRQUN4RSxJQUFBLHNCQUFPLEVBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCLE9BQU87S0FDUjtJQUVELElBQUksT0FBTyxDQUFDLFVBQVUsRUFBRTtRQUN0QixnQkFBTSxDQUFDLElBQUksQ0FBQywyQkFBMkIsT0FBTyxDQUFDLE9BQU8sV0FBVyxDQUFDLENBQUM7UUFDbkUsSUFBQSx5QkFBVSxFQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QixPQUFPO0tBQ1I7SUFDRCxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtRQUM1QixnQkFBTSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RDLElBQUEsaUNBQXNCLEVBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNoRCxPQUFPO0tBQ1I7SUFFRCxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFFLE9BQU8sQ0FBQyxPQUFvQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDOUUsTUFBTSxJQUFBLHFCQUFhLEVBQUMsT0FBZ0YsQ0FBQyxDQUFDO0FBQ3hHLENBQUMsQ0FBQSxDQUFDO0FBQ0YsQ0FBQyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBzeW5jRGFpbHlCYXJzIH0gZnJvbSAnLi9kb3dubG9hZGVycy8xZGF5JztcbmltcG9ydCB7IHByb2dyYW0gfSBmcm9tICdjb21tYW5kZXInO1xuaW1wb3J0IHsgYWRkSW5kZXhlcywgYnVpbGREYiB9IGZyb20gJy4vY29uc3RydWN0LWRiJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHsgc3luY0xhdGVzdEludHJhZGF5QmFycyB9IGZyb20gJy4vZG93bmxvYWRlcnMvaW50cmFkYXknO1xuLy8gaW1wb3J0IHsgZ2V0VHJhZGVhYmxlQXNzZXRzIH0gZnJvbSAnLi9oZWxwZXJzJztcbi8vIGltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSAnbHV4b24nO1xuXG5jb25zdCBmID0gYXN5bmMgKCkgPT4ge1xuICAvLyBieSBkZWZhdWx0IGlmIG5vdGhpbmcgaW4gZGF0YSBkaXJlY3RvcnksIGRvZXMgZnVsbCBzeW5jLlxuICAvLyBpZiB0aGVyZSdzIGRhdGEgaW4gdGhlIGRhdGEgZGlyZWN0b3J5LCBzeW5jIGxhc3QgMzAgZGF5cy5cbiAgLy8gZm9yIG5vdyBubyBleHRyYSBwYXJhbXMuIGp1c3QgcnVuIGRhaWx5LlxuXG4gIHByb2dyYW0ub3B0aW9uKFxuICAgICctLXN0YXJ0IDxzdGFydERhdGU+JyxcbiAgICAnRGF0ZSBpbiBZWVlZLU1NLUREIGZvcm1hdCB0byBzdGFydCBkb3dubG9hZGluZyBkYXRhIGZyb20uIERlZmF1bHRzIHRvIDUgZGF5cyBhZ28uJyxcbiAgICB1bmRlZmluZWRcbiAgKTtcbiAgcHJvZ3JhbS5vcHRpb24oJy0tZW5kIDxlbmREYXRlPicsICdEYXRlIGluIFlZWVktTU0tREQgZm9ybWF0IHRvIGRvd25sb2FkIGRhdGEgdG8uIERlZmF1bHRzIHRvIHllc3RlcmRheS4nLCB1bmRlZmluZWQpO1xuICBwcm9ncmFtLm9wdGlvbihcbiAgICAnLS1zeW1ib2xzIFtzeW1ib2xzLi4uXScsXG4gICAgJ0xpc3Qgb2Ygc3ltYm9scyB0byBnZXIgZGF0YSBmb3IgaW4gZm9ybWF0IG9mIE1TRlQsQUFQTCxHTEQgZGVmYXVsdHMgdG8gYWxsIHN5bWJvbHMuJyxcbiAgICB1bmRlZmluZWRcbiAgKTtcblxuICBwcm9ncmFtLm9wdGlvbignLS1wYXBlcicsICdVc2UgcGFwZXIgdHJhZGluZyBkYXRhLicsIGZhbHNlKTtcbiAgcHJvZ3JhbS5vcHRpb24oJy0tZGF0YS1kaXIgPGRpcj4nLCAnVGhlIGRpcmVjdG9yeSB0byBzdG9yZSBoaXN0b3JpY2FsIGRhdGEgZnJvbSBhbHBhY2EnLCAnLi9kYXRhJyk7XG4gIHByb2dyYW0ub3B0aW9uKFxuICAgICctLWNvbnN0cnVjdC1kYXRhYmFzZScsXG4gICAgYENvbnN0cnVjdHMgYSBzcWxpdGUzIGRhdGFiYXNlIGZpbGUgY2FsbGVkIGRhaWx5LmRiIGluc2lkZSBvZiAtLWRhdGEtZGlyIGZyb20gYWxsIDFkYXkgZmlsZXMuXG4gICAgSWYgZGFpbHkuZGIgYWxyZWFkeSBleGlzdHMsIHVwZGF0ZXMgZmlsZS5gLFxuICAgIGZhbHNlXG4gICk7XG5cbiAgcHJvZ3JhbS5vcHRpb24oXG4gICAgJy0tYWRkLWluZGV4ZXMnLFxuICAgIGBBZGQgaW5kZXhlcyB0byBkYWlseSBkYiBkYXRhYmFzZS5gLFxuICAgIGZhbHNlXG4gICk7XG5cbiAgcHJvZ3JhbS5vcHRpb24oXG4gICAgJy0tZG93bmxvYWQtMS1taW4tYmFycycsXG4gICAgJ0Rvd25sb2FkIDEgbWludXRlIGJhcnMgaW4gLS1kYXRhLWRpci4gQnkgZGVmYXVsdCBzeW5jcyBhbGwgbWludXRlIGJhcnMgZnJvbSA2IHllYXJzIGFnby4nLFxuICAgIGZhbHNlXG4gICk7XG5cbiAgcHJvZ3JhbS5wYXJzZSgpO1xuICBjb25zdCBvcHRpb25zID0gcHJvZ3JhbS5vcHRzKCk7XG4gIGlmIChvcHRpb25zLmNvbnN0cnVjdERhdGFiYXNlKSB7XG4gICAgbG9nZ2VyLmluZm8oYENvbnN0cnVjdGluZyBTUUwgZGF0YWJhc2UgaW4gJHtvcHRpb25zLmRhdGFEaXJ9L2RhaWx5LmRiYCk7XG4gICAgYnVpbGREYihvcHRpb25zLmRhdGFEaXIpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmFkZEluZGV4ZXMpIHtcbiAgICBsb2dnZXIuaW5mbyhgQWRkIGluZGV4ZXMgdG8gZGF0YWJhc2UgJHtvcHRpb25zLmRhdGFEaXJ9L2RhaWx5LmRiYCk7XG4gICAgYWRkSW5kZXhlcyhvcHRpb25zLmRhdGFEaXIpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAob3B0aW9ucy5kb3dubG9hZDFNaW5CYXJzKSB7XG4gICAgbG9nZ2VyLmluZm8oYERvd25sb2FkaW5nIDEgbWluIGJhcnNgKTtcbiAgICBzeW5jTGF0ZXN0SW50cmFkYXlCYXJzKG9wdGlvbnMuZGF0YURpciwgJzFNaW4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBvcHRpb25zLnN5bWJvbHMgPSBvcHRpb25zLnN5bWJvbHMgPyAob3B0aW9ucy5zeW1ib2xzIGFzIHN0cmluZ1tdKSA6IHVuZGVmaW5lZDtcbiAgYXdhaXQgc3luY0RhaWx5QmFycyhvcHRpb25zIGFzIHsgZGF0YURpcjogc3RyaW5nOyBzdGFydD86IHN0cmluZzsgZW5kPzogc3RyaW5nOyBzeW1ib2xzPzogc3RyaW5nW10gfSk7XG59O1xuZigpO1xuIl19