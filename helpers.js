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
    logger_1.default.info(`Grabbing first page of ${timeframe} bars for ${symbol}`);
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
        logger_1.default.info(`Grabbing more data from ${timeframe} bars ${page_token} from ${symbol}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsc0RBQTZCO0FBQzdCLCtDQUF1QztBQUVoQyxNQUFNLHFCQUFxQixHQUFHLENBQUMsU0FBMEIsRUFBRSxFQUFFO0lBQ2xFLE9BQU8sU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2pDLENBQUMsQ0FBQTtBQUZZLFFBQUEscUJBQXFCLHlCQUVqQztBQUVNLE1BQU0sb0JBQW9CLEdBQUcsQ0FDbEMsTUFBYyxFQUNkLFNBQTBCLEVBQzFCLEtBQVcsRUFDWCxHQUFTLEVBQ1QsRUFBRTtJQUNGLGdCQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixTQUFTLGFBQWEsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN0RSxJQUFJLElBQUksR0FBRyxNQUFNLG9CQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNoRyxnQkFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNmLE1BQU0sS0FBSyxDQUFDLHNDQUFzQyxNQUFNLE9BQU8sU0FBUyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0YsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1QsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUNELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFFckIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUV0QywwQ0FBMEM7SUFDMUMsT0FBTyxVQUFVLElBQUksSUFBSSxFQUFFO1FBQ3pCLGdCQUFNLENBQUMsSUFBSSxDQUFDLDJCQUEyQixTQUFTLFNBQVMsVUFBVSxTQUFTLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDdEYsSUFBSSxJQUFJLEdBQUcsTUFBTSxvQkFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN2RixnQkFBTSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRCxPQUFPO1FBQ1QsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUVELElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO0tBQ25DO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDLENBQUEsQ0FBQztBQXBDVyxRQUFBLG9CQUFvQix3QkFvQy9CO0FBRUssTUFBTSxrQkFBa0IsR0FBRyxHQUFTLEVBQUU7SUFDM0MsSUFBSTtRQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sb0JBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN4QyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDOUMsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUFDLE9BQU8sQ0FBVSxFQUFFO1FBQ25CLGdCQUFNLENBQUMsS0FBSyxDQUFDLHdEQUF3RCxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLE1BQU0sS0FBSyxFQUFFLENBQUE7S0FDZDtBQUNILENBQUMsQ0FBQSxDQUFBO0FBVlksUUFBQSxrQkFBa0Isc0JBVTlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEJhcnNWMVRpbWVmcmFtZSB9IGZyb20gJ0BtYXN0ZXItY2hpZWYvYWxwYWNhJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi9sb2dnZXInXG5pbXBvcnQgeyBhbHBhY2EgfSBmcm9tICcuL2Vudmlyb25tZW50JztcblxuZXhwb3J0IGNvbnN0IG1hcFRpbWVmcmFtZVRvRGlyTmFtZSA9ICh0aW1lZnJhbWU6IEJhcnNWMVRpbWVmcmFtZSkgPT4ge1xuICByZXR1cm4gdGltZWZyYW1lLnRvTG93ZXJDYXNlKCk7XG59XG5cbmV4cG9ydCBjb25zdCBnZXRBbGxCYXJzRnJvbUFscGFjYSA9IGFzeW5jIChcbiAgc3ltYm9sOiBzdHJpbmcsXG4gIHRpbWVmcmFtZTogQmFyc1YxVGltZWZyYW1lLFxuICBzdGFydDogRGF0ZSxcbiAgZW5kOiBEYXRlXG4pID0+IHtcbiAgbG9nZ2VyLmluZm8oYEdyYWJiaW5nIGZpcnN0IHBhZ2Ugb2YgJHt0aW1lZnJhbWV9IGJhcnMgZm9yICR7c3ltYm9sfWApO1xuICBsZXQgcmVzcCA9IGF3YWl0IGFscGFjYS5nZXRCYXJzKHsgc3ltYm9sLCBzdGFydCwgZW5kLCB0aW1lZnJhbWUsIGFkanVzdG1lbnQ6ICdzcGxpdCcgfSkuY2F0Y2goZSA9PiB7XG4gICAgbG9nZ2VyLmluZm8oZSk7XG4gICAgdGhyb3cgRXJyb3IoYElzc3VlIHdpdGggZ2V0dGluZyBiYXJzIGZvciBzeW1ib2wgJHtzeW1ib2x9IG9uICR7dGltZWZyYW1lfS4gRXJyb3IgaXMgJHtlfWApO1xuICB9KTtcblxuICBpZiAoIXJlc3ApIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgbGV0IGJhcnMgPSByZXNwLmJhcnM7XG5cbiAgbGV0IHBhZ2VfdG9rZW4gPSByZXNwLm5leHRfcGFnZV90b2tlbjtcblxuICAvLyB1bnRpbCB0aGUgbmV4dCB0b2tlbiB3ZSByZWNlaXZlIGlzIG51bGxcbiAgd2hpbGUgKHBhZ2VfdG9rZW4gIT0gbnVsbCkge1xuICAgIGxvZ2dlci5pbmZvKGBHcmFiYmluZyBtb3JlIGRhdGEgZnJvbSAke3RpbWVmcmFtZX0gYmFycyAke3BhZ2VfdG9rZW59IGZyb20gJHtzeW1ib2x9YCk7XG4gICAgbGV0IHJlc3AgPSBhd2FpdCBhbHBhY2EuZ2V0QmFycyh7IHN5bWJvbCwgc3RhcnQsIGVuZCwgdGltZWZyYW1lLCBwYWdlX3Rva2VuIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgbG9nZ2VyLmVycm9yKCdJc3N1ZSB3aXRoIHBhZ2luYXRlZCBnZXR0aW5nIGJhcnMnLCBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9KTtcblxuICAgIGlmICghcmVzcCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGJhcnMgPSBbLi4uYmFycywgLi4ucmVzcC5iYXJzXTtcbiAgICBwYWdlX3Rva2VuID0gcmVzcC5uZXh0X3BhZ2VfdG9rZW47XG4gIH1cblxuICByZXR1cm4gYmFycztcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRUcmFkZWFibGVBc3NldHMgPSBhc3luYyAoKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgYXNzZXRzID0gYXdhaXQgYWxwYWNhLmdldEFzc2V0cygpO1xuICAgIHJldHVybiBhc3NldHMuZmlsdGVyKHggPT4ge1xuICAgICAgcmV0dXJuIHgudHJhZGFibGUgJiYgIXguc3ltYm9sLmluY2x1ZGVzKCcvJylcbiAgICB9KTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIGxvZ2dlci5lcnJvcihgQ291bGQgbm90IGdldCB0cmFkZWFibGUgYXNzZXRzIGZyb20gYWxwYWNhLiBlcnJvciBpcyAke2V9YCk7XG4gICAgdGhyb3cgRXJyb3IoKVxuICB9XG59XG4iXX0=