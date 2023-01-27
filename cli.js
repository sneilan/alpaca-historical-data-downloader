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
const _1day_1 = require("./downloaders/1day");
const commander_1 = require("commander");
const f = () => __awaiter(void 0, void 0, void 0, function* () {
    // by default if nothing in data directory, does full sync.
    // if there's data in the data directory, sync last 30 days.
    // for now no extra params. just run daily.
    // program.option('--paper', 'Use paper trading data.', false);
    commander_1.program.option('--data-dir <dir>', 'The directory to store historical data from alpaca', './data');
    commander_1.program.parse();
    const options = commander_1.program.opts();
    yield (0, _1day_1.syncDailyBars)(options.dataDir);
});
f();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUdBLDhDQUFtRDtBQUNuRCx5Q0FBb0M7QUFFcEMsTUFBTSxDQUFDLEdBQUcsR0FBUyxFQUFFO0lBQ25CLDJEQUEyRDtJQUMzRCw0REFBNEQ7SUFDNUQsMkNBQTJDO0lBRTNDLCtEQUErRDtJQUMvRCxtQkFBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxvREFBb0QsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuRyxtQkFBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBRWhCLE1BQU0sT0FBTyxHQUFHLG1CQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0IsTUFBTSxJQUFBLHFCQUFhLEVBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQSxDQUFBO0FBRUQsQ0FBQyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBzeW5jRGFpbHlCYXJzIH0gZnJvbSAnLi9kb3dubG9hZGVycy8xZGF5JztcbmltcG9ydCB7IHByb2dyYW0gfSBmcm9tICdjb21tYW5kZXInO1xuXG5jb25zdCBmID0gYXN5bmMgKCkgPT4ge1xuICAvLyBieSBkZWZhdWx0IGlmIG5vdGhpbmcgaW4gZGF0YSBkaXJlY3RvcnksIGRvZXMgZnVsbCBzeW5jLlxuICAvLyBpZiB0aGVyZSdzIGRhdGEgaW4gdGhlIGRhdGEgZGlyZWN0b3J5LCBzeW5jIGxhc3QgMzAgZGF5cy5cbiAgLy8gZm9yIG5vdyBubyBleHRyYSBwYXJhbXMuIGp1c3QgcnVuIGRhaWx5LlxuICBcbiAgLy8gcHJvZ3JhbS5vcHRpb24oJy0tcGFwZXInLCAnVXNlIHBhcGVyIHRyYWRpbmcgZGF0YS4nLCBmYWxzZSk7XG4gIHByb2dyYW0ub3B0aW9uKCctLWRhdGEtZGlyIDxkaXI+JywgJ1RoZSBkaXJlY3RvcnkgdG8gc3RvcmUgaGlzdG9yaWNhbCBkYXRhIGZyb20gYWxwYWNhJywgJy4vZGF0YScpO1xuICBwcm9ncmFtLnBhcnNlKCk7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IHByb2dyYW0ub3B0cygpO1xuICBhd2FpdCBzeW5jRGFpbHlCYXJzKG9wdGlvbnMuZGF0YURpcik7XG59XG5cbmYoKTtcbiJdfQ==