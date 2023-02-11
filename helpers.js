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
const getAllBarsFromAlpaca = (symbols, timeframe, start, end) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Grabbing first page of ${timeframe} bars for ${symbols.join(', ')}`);
    const bars = environment_1.alpacaJs.getMultiBarsV2(symbols, {});
    /*
    let resp = await alpaca.getBars({ symbol, start, end, timeframe, adjustment: 'split' }).catch(e => {
      logger.info(e);
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
      let resp = await alpaca.getBars({ symbol, start, end, timeframe, page_token }).catch(e => {
        logger.error('Issue with paginated getting bars', e);
        return;
      });
    
      if (!resp) {
        return [];
      }
    
      bars = [...bars, ...resp.bars];
      page_token = resp.next_page_token;
    }
    
    return bars;
      */
    return [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsc0RBQTZCO0FBQzdCLCtDQUFpRDtBQUUxQyxNQUFNLHFCQUFxQixHQUFHLENBQUMsU0FBMEIsRUFBRSxFQUFFO0lBQ2xFLE9BQU8sU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2pDLENBQUMsQ0FBQTtBQUZZLFFBQUEscUJBQXFCLHlCQUVqQztBQUVNLE1BQU0sb0JBQW9CLEdBQUcsQ0FDbEMsT0FBaUIsRUFDakIsU0FBMEIsRUFDMUIsS0FBVyxFQUNYLEdBQVMsRUFDVCxFQUFFO0lBQ0YsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLFNBQVMsYUFBYSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsRixNQUFNLElBQUksR0FBRyxzQkFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsRUFDN0MsQ0FBQyxDQUFDO0lBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQThCSTtJQUNKLE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQyxDQUFBLENBQUM7QUExQ1csUUFBQSxvQkFBb0Isd0JBMEMvQjtBQUVLLE1BQU0sa0JBQWtCLEdBQUcsR0FBUyxFQUFFO0lBQzNDLElBQUk7UUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLG9CQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDeEMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzlDLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFBQyxPQUFPLENBQVUsRUFBRTtRQUNuQixnQkFBTSxDQUFDLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRSxNQUFNLEtBQUssRUFBRSxDQUFBO0tBQ2Q7QUFDSCxDQUFDLENBQUEsQ0FBQTtBQVZZLFFBQUEsa0JBQWtCLHNCQVU5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBCYXJzVjFUaW1lZnJhbWUgfSBmcm9tICdAbWFzdGVyLWNoaWVmL2FscGFjYSc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJ1xuaW1wb3J0IHsgYWxwYWNhLCBhbHBhY2FKcyB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuXG5leHBvcnQgY29uc3QgbWFwVGltZWZyYW1lVG9EaXJOYW1lID0gKHRpbWVmcmFtZTogQmFyc1YxVGltZWZyYW1lKSA9PiB7XG4gIHJldHVybiB0aW1lZnJhbWUudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGNvbnN0IGdldEFsbEJhcnNGcm9tQWxwYWNhID0gYXN5bmMgKFxuICBzeW1ib2xzOiBzdHJpbmdbXSxcbiAgdGltZWZyYW1lOiBCYXJzVjFUaW1lZnJhbWUsXG4gIHN0YXJ0OiBEYXRlLFxuICBlbmQ6IERhdGVcbikgPT4ge1xuICBsb2dnZXIuaW5mbyhgR3JhYmJpbmcgZmlyc3QgcGFnZSBvZiAke3RpbWVmcmFtZX0gYmFycyBmb3IgJHtzeW1ib2xzLmpvaW4oJywgJyl9YCk7XG4gIGNvbnN0IGJhcnMgPSBhbHBhY2FKcy5nZXRNdWx0aUJhcnNWMihzeW1ib2xzLCB7XG4gIH0pO1xuXG4gIC8qXG4gIGxldCByZXNwID0gYXdhaXQgYWxwYWNhLmdldEJhcnMoeyBzeW1ib2wsIHN0YXJ0LCBlbmQsIHRpbWVmcmFtZSwgYWRqdXN0bWVudDogJ3NwbGl0JyB9KS5jYXRjaChlID0+IHtcbiAgICBsb2dnZXIuaW5mbyhlKTtcbiAgICB0aHJvdyBFcnJvcihgSXNzdWUgd2l0aCBnZXR0aW5nIGJhcnMgZm9yIHN5bWJvbCAke3N5bWJvbH0gb24gJHt0aW1lZnJhbWV9LiBFcnJvciBpcyAke2V9YCk7XG4gIH0pO1xuICBcbiAgaWYgKCFyZXNwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGxldCBiYXJzID0gcmVzcC5iYXJzO1xuICBcbiAgbGV0IHBhZ2VfdG9rZW4gPSByZXNwLm5leHRfcGFnZV90b2tlbjtcbiAgXG4gIC8vIHVudGlsIHRoZSBuZXh0IHRva2VuIHdlIHJlY2VpdmUgaXMgbnVsbFxuICB3aGlsZSAocGFnZV90b2tlbiAhPSBudWxsKSB7XG4gICAgLy8gbG9nZ2VyLmluZm8oYEdyYWJiaW5nIG1vcmUgZGF0YSBmcm9tICR7dGltZWZyYW1lfSBiYXJzICR7cGFnZV90b2tlbn0gZnJvbSAke3N5bWJvbH1gKTtcbiAgICBsZXQgcmVzcCA9IGF3YWl0IGFscGFjYS5nZXRCYXJzKHsgc3ltYm9sLCBzdGFydCwgZW5kLCB0aW1lZnJhbWUsIHBhZ2VfdG9rZW4gfSkuY2F0Y2goZSA9PiB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0lzc3VlIHdpdGggcGFnaW5hdGVkIGdldHRpbmcgYmFycycsIGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH0pO1xuICBcbiAgICBpZiAoIXJlc3ApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIFxuICAgIGJhcnMgPSBbLi4uYmFycywgLi4ucmVzcC5iYXJzXTtcbiAgICBwYWdlX3Rva2VuID0gcmVzcC5uZXh0X3BhZ2VfdG9rZW47XG4gIH1cbiAgXG4gIHJldHVybiBiYXJzO1xuICAgICovXG4gIHJldHVybiBbXTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRUcmFkZWFibGVBc3NldHMgPSBhc3luYyAoKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgYXNzZXRzID0gYXdhaXQgYWxwYWNhLmdldEFzc2V0cygpO1xuICAgIHJldHVybiBhc3NldHMuZmlsdGVyKHggPT4ge1xuICAgICAgcmV0dXJuIHgudHJhZGFibGUgJiYgIXguc3ltYm9sLmluY2x1ZGVzKCcvJylcbiAgICB9KTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIGxvZ2dlci5lcnJvcihgQ291bGQgbm90IGdldCB0cmFkZWFibGUgYXNzZXRzIGZyb20gYWxwYWNhLiBlcnJvciBpcyAke2V9YCk7XG4gICAgdGhyb3cgRXJyb3IoKVxuICB9XG59XG4iXX0=