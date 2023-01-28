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
const f = () => __awaiter(void 0, void 0, void 0, function* () {
    // by default if nothing in data directory, does full sync.
    // if there's data in the data directory, sync last 30 days.
    // for now no extra params. just run daily.
    // program.option('--paper', 'Use paper trading data.', false);
    commander_1.program.option('--data-dir <dir>', 'The directory to store historical data from alpaca', './data');
    commander_1.program.option('--construct-database', `Constructs a sqlite3 database file called daily.db inside of --data-dir from all 1day files.
    If daily.db already exists, updates file.`, false);
    commander_1.program.parse();
    const options = commander_1.program.opts();
    if (options.constructDatabase) {
        logger_1.default.info(`Constructing SQL database in ${options.dataDir}/daily.db`);
        (0, construct_db_1.buildDb)(options.dataDir);
        return;
    }
    yield (0, _1day_1.syncDailyBars)(options.dataDir);
});
f();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUdBLDhDQUFtRDtBQUNuRCx5Q0FBb0M7QUFDcEMsaURBQXlDO0FBQ3pDLHNEQUE4QjtBQUU5QixNQUFNLENBQUMsR0FBRyxHQUFTLEVBQUU7SUFDbkIsMkRBQTJEO0lBQzNELDREQUE0RDtJQUM1RCwyQ0FBMkM7SUFFM0MsK0RBQStEO0lBQy9ELG1CQUFPLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLG9EQUFvRCxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ25HLG1CQUFPLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFOzhDQUNLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDckQsbUJBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUVoQixNQUFNLE9BQU8sR0FBRyxtQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQy9CLElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO1FBQzdCLGdCQUFNLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxPQUFPLENBQUMsT0FBTyxXQUFXLENBQUMsQ0FBQztRQUN4RSxJQUFBLHNCQUFPLEVBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCLE9BQU87S0FDUjtJQUVELE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QyxDQUFDLENBQUEsQ0FBQTtBQUVELENBQUMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgc3luY0RhaWx5QmFycyB9IGZyb20gJy4vZG93bmxvYWRlcnMvMWRheSc7XG5pbXBvcnQgeyBwcm9ncmFtIH0gZnJvbSAnY29tbWFuZGVyJztcbmltcG9ydCB7IGJ1aWxkRGIgfSBmcm9tICcuL2NvbnN0cnVjdC1kYic7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcblxuY29uc3QgZiA9IGFzeW5jICgpID0+IHtcbiAgLy8gYnkgZGVmYXVsdCBpZiBub3RoaW5nIGluIGRhdGEgZGlyZWN0b3J5LCBkb2VzIGZ1bGwgc3luYy5cbiAgLy8gaWYgdGhlcmUncyBkYXRhIGluIHRoZSBkYXRhIGRpcmVjdG9yeSwgc3luYyBsYXN0IDMwIGRheXMuXG4gIC8vIGZvciBub3cgbm8gZXh0cmEgcGFyYW1zLiBqdXN0IHJ1biBkYWlseS5cbiAgXG4gIC8vIHByb2dyYW0ub3B0aW9uKCctLXBhcGVyJywgJ1VzZSBwYXBlciB0cmFkaW5nIGRhdGEuJywgZmFsc2UpO1xuICBwcm9ncmFtLm9wdGlvbignLS1kYXRhLWRpciA8ZGlyPicsICdUaGUgZGlyZWN0b3J5IHRvIHN0b3JlIGhpc3RvcmljYWwgZGF0YSBmcm9tIGFscGFjYScsICcuL2RhdGEnKTtcbiAgcHJvZ3JhbS5vcHRpb24oJy0tY29uc3RydWN0LWRhdGFiYXNlJywgYENvbnN0cnVjdHMgYSBzcWxpdGUzIGRhdGFiYXNlIGZpbGUgY2FsbGVkIGRhaWx5LmRiIGluc2lkZSBvZiAtLWRhdGEtZGlyIGZyb20gYWxsIDFkYXkgZmlsZXMuXG4gICAgSWYgZGFpbHkuZGIgYWxyZWFkeSBleGlzdHMsIHVwZGF0ZXMgZmlsZS5gLCBmYWxzZSk7XG4gIHByb2dyYW0ucGFyc2UoKTtcblxuICBjb25zdCBvcHRpb25zID0gcHJvZ3JhbS5vcHRzKCk7XG4gIGlmIChvcHRpb25zLmNvbnN0cnVjdERhdGFiYXNlKSB7XG4gICAgbG9nZ2VyLmluZm8oYENvbnN0cnVjdGluZyBTUUwgZGF0YWJhc2UgaW4gJHtvcHRpb25zLmRhdGFEaXJ9L2RhaWx5LmRiYCk7XG4gICAgYnVpbGREYihvcHRpb25zLmRhdGFEaXIpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGF3YWl0IHN5bmNEYWlseUJhcnMob3B0aW9ucy5kYXRhRGlyKTtcbn1cblxuZigpO1xuIl19