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
const f = () => __awaiter(void 0, void 0, void 0, function* () {
    // by default if nothing in data directory, does full sync.
    // if there's data in the data directory, sync last 30 days.
    // for now no extra params. just run daily.
    yield (0, _1day_1.syncDailyBars)();
});
f();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0EsOENBQW1EO0FBRW5ELE1BQU0sQ0FBQyxHQUFHLEdBQVMsRUFBRTtJQUNuQiwyREFBMkQ7SUFDM0QsNERBQTREO0lBQzVELDJDQUEyQztJQUUzQyxNQUFNLElBQUEscUJBQWEsR0FBRSxDQUFDO0FBQ3hCLENBQUMsQ0FBQSxDQUFBO0FBRUQsQ0FBQyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgc3luY0RhaWx5QmFycyB9IGZyb20gJy4vZG93bmxvYWRlcnMvMWRheSc7XG5cbmNvbnN0IGYgPSBhc3luYyAoKSA9PiB7XG4gIC8vIGJ5IGRlZmF1bHQgaWYgbm90aGluZyBpbiBkYXRhIGRpcmVjdG9yeSwgZG9lcyBmdWxsIHN5bmMuXG4gIC8vIGlmIHRoZXJlJ3MgZGF0YSBpbiB0aGUgZGF0YSBkaXJlY3RvcnksIHN5bmMgbGFzdCAzMCBkYXlzLlxuICAvLyBmb3Igbm93IG5vIGV4dHJhIHBhcmFtcy4ganVzdCBydW4gZGFpbHkuXG4gIFxuICBhd2FpdCBzeW5jRGFpbHlCYXJzKCk7XG59XG5cbmYoKTtcbiJdfQ==