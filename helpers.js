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
exports.getTradeableAssets = exports.getAllBarsFromAlpaca = exports.mapTimeframeToDirName = void 0;
const logger_1 = __importDefault(require("./logger"));
const environment_1 = require("./environment");
const mapTimeframeToDirName = (timeframe) => {
    return timeframe.toLowerCase();
};
exports.mapTimeframeToDirName = mapTimeframeToDirName;
const getAllBarsFromAlpaca = (symbol, timeframe, start, end) => __awaiter(void 0, void 0, void 0, function* () {
    // logger.info(`Grabbing first page of ${timeframe} bars for ${symbol}`);
    let resp = yield environment_1.alpaca.getBars({ symbol, start, end, timeframe, adjustment: 'split' }).catch(e => {
        logger_1.default.info(e);
        throw Error(`Issue with getting bars for symbol ${symbol} on ${timeframe}. Error is ${e}`);
    });
    if (!resp) {
        return [];
    }
    let bars = resp.bars;
    let page_token = resp.next_page_token;
    // until the next token we receive is null
    while (page_token != null) {
        // logger.info(`Grabbing more data from ${timeframe} bars ${page_token} from ${symbol}`);
        let resp = yield environment_1.alpaca.getBars({ symbol, start, end, timeframe, page_token }).catch(e => {
            logger_1.default.error('Issue with paginated getting bars', e);
            return;
        });
        if (!resp) {
            return [];
        }
        bars = [...bars, ...resp.bars];
        page_token = resp.next_page_token;
    }
    return bars;
});
exports.getAllBarsFromAlpaca = getAllBarsFromAlpaca;
const getTradeableAssets = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assets = yield environment_1.alpaca.getAssets();
        return assets.filter(x => {
            return x.tradable && !x.symbol.includes('/');
        });
    }
    catch (e) {
        logger_1.default.error(`Could not get tradeable assets from alpaca. error is ${e}`);
        throw Error();
    }
});
exports.getTradeableAssets = getTradeableAssets;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsc0RBQTZCO0FBQzdCLCtDQUF1QztBQUVoQyxNQUFNLHFCQUFxQixHQUFHLENBQUMsU0FBMEIsRUFBRSxFQUFFO0lBQ2xFLE9BQU8sU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2pDLENBQUMsQ0FBQTtBQUZZLFFBQUEscUJBQXFCLHlCQUVqQztBQUVNLE1BQU0sb0JBQW9CLEdBQUcsQ0FDbEMsTUFBYyxFQUNkLFNBQTBCLEVBQzFCLEtBQVcsRUFDWCxHQUFTLEVBQ1QsRUFBRTtJQUNGLHlFQUF5RTtJQUN6RSxJQUFJLElBQUksR0FBRyxNQUFNLG9CQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNoRyxnQkFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNmLE1BQU0sS0FBSyxDQUFDLHNDQUFzQyxNQUFNLE9BQU8sU0FBUyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0YsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1QsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUNELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFFckIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUV0QywwQ0FBMEM7SUFDMUMsT0FBTyxVQUFVLElBQUksSUFBSSxFQUFFO1FBQ3pCLHlGQUF5RjtRQUN6RixJQUFJLElBQUksR0FBRyxNQUFNLG9CQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3ZGLGdCQUFNLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JELE9BQU87UUFDVCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7S0FDbkM7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMsQ0FBQSxDQUFDO0FBcENXLFFBQUEsb0JBQW9CLHdCQW9DL0I7QUFFSyxNQUFNLGtCQUFrQixHQUFHLEdBQVMsRUFBRTtJQUMzQyxJQUFJO1FBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxvQkFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM5QyxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQUMsT0FBTyxDQUFVLEVBQUU7UUFDbkIsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsd0RBQXdELENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUUsTUFBTSxLQUFLLEVBQUUsQ0FBQTtLQUNkO0FBQ0gsQ0FBQyxDQUFBLENBQUE7QUFWWSxRQUFBLGtCQUFrQixzQkFVOUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgQmFyc1YxVGltZWZyYW1lIH0gZnJvbSAnQG1hc3Rlci1jaGllZi9hbHBhY2EnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuL2xvZ2dlcidcbmltcG9ydCB7IGFscGFjYSB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuXG5leHBvcnQgY29uc3QgbWFwVGltZWZyYW1lVG9EaXJOYW1lID0gKHRpbWVmcmFtZTogQmFyc1YxVGltZWZyYW1lKSA9PiB7XG4gIHJldHVybiB0aW1lZnJhbWUudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGNvbnN0IGdldEFsbEJhcnNGcm9tQWxwYWNhID0gYXN5bmMgKFxuICBzeW1ib2w6IHN0cmluZyxcbiAgdGltZWZyYW1lOiBCYXJzVjFUaW1lZnJhbWUsXG4gIHN0YXJ0OiBEYXRlLFxuICBlbmQ6IERhdGVcbikgPT4ge1xuICAvLyBsb2dnZXIuaW5mbyhgR3JhYmJpbmcgZmlyc3QgcGFnZSBvZiAke3RpbWVmcmFtZX0gYmFycyBmb3IgJHtzeW1ib2x9YCk7XG4gIGxldCByZXNwID0gYXdhaXQgYWxwYWNhLmdldEJhcnMoeyBzeW1ib2wsIHN0YXJ0LCBlbmQsIHRpbWVmcmFtZSwgYWRqdXN0bWVudDogJ3NwbGl0JyB9KS5jYXRjaChlID0+IHtcbiAgICBsb2dnZXIuaW5mbyhlKTtcbiAgICB0aHJvdyBFcnJvcihgSXNzdWUgd2l0aCBnZXR0aW5nIGJhcnMgZm9yIHN5bWJvbCAke3N5bWJvbH0gb24gJHt0aW1lZnJhbWV9LiBFcnJvciBpcyAke2V9YCk7XG4gIH0pO1xuXG4gIGlmICghcmVzcCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBsZXQgYmFycyA9IHJlc3AuYmFycztcblxuICBsZXQgcGFnZV90b2tlbiA9IHJlc3AubmV4dF9wYWdlX3Rva2VuO1xuXG4gIC8vIHVudGlsIHRoZSBuZXh0IHRva2VuIHdlIHJlY2VpdmUgaXMgbnVsbFxuICB3aGlsZSAocGFnZV90b2tlbiAhPSBudWxsKSB7XG4gICAgLy8gbG9nZ2VyLmluZm8oYEdyYWJiaW5nIG1vcmUgZGF0YSBmcm9tICR7dGltZWZyYW1lfSBiYXJzICR7cGFnZV90b2tlbn0gZnJvbSAke3N5bWJvbH1gKTtcbiAgICBsZXQgcmVzcCA9IGF3YWl0IGFscGFjYS5nZXRCYXJzKHsgc3ltYm9sLCBzdGFydCwgZW5kLCB0aW1lZnJhbWUsIHBhZ2VfdG9rZW4gfSkuY2F0Y2goZSA9PiB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0lzc3VlIHdpdGggcGFnaW5hdGVkIGdldHRpbmcgYmFycycsIGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH0pO1xuXG4gICAgaWYgKCFyZXNwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgYmFycyA9IFsuLi5iYXJzLCAuLi5yZXNwLmJhcnNdO1xuICAgIHBhZ2VfdG9rZW4gPSByZXNwLm5leHRfcGFnZV90b2tlbjtcbiAgfVxuXG4gIHJldHVybiBiYXJzO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFRyYWRlYWJsZUFzc2V0cyA9IGFzeW5jICgpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBhc3NldHMgPSBhd2FpdCBhbHBhY2EuZ2V0QXNzZXRzKCk7XG4gICAgcmV0dXJuIGFzc2V0cy5maWx0ZXIoeCA9PiB7XG4gICAgICByZXR1cm4geC50cmFkYWJsZSAmJiAheC5zeW1ib2wuaW5jbHVkZXMoJy8nKVxuICAgIH0pO1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgbG9nZ2VyLmVycm9yKGBDb3VsZCBub3QgZ2V0IHRyYWRlYWJsZSBhc3NldHMgZnJvbSBhbHBhY2EuIGVycm9yIGlzICR7ZX1gKTtcbiAgICB0aHJvdyBFcnJvcigpXG4gIH1cbn1cbiJdfQ==