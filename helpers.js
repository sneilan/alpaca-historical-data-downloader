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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeableAssets = exports.getAllBarsFromAlpaca = exports.mapTimeframeToDirName = exports.getTimeFrame = void 0;
const logger_1 = __importDefault(require("./logger"));
const environment_1 = require("./environment");
const entityv2_1 = require("@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2");
const rest_v2_1 = require("@alpacahq/alpaca-trade-api/dist/resources/datav2/rest_v2");
const getTimeFrame = (amount, unit) => {
    const timeframeMap = {
        hour: entityv2_1.TimeFrameUnit.HOUR,
        day: entityv2_1.TimeFrameUnit.DAY,
        min: entityv2_1.TimeFrameUnit.MIN,
        week: entityv2_1.TimeFrameUnit.WEEK,
        month: entityv2_1.TimeFrameUnit.MONTH
    };
    return environment_1.alpacaJs.newTimeframe(amount, timeframeMap[unit]);
};
exports.getTimeFrame = getTimeFrame;
const mapTimeframeToDirName = (timeframe) => {
    return timeframe.toLowerCase();
};
exports.mapTimeframeToDirName = mapTimeframeToDirName;
function getAllBarsFromAlpaca(symbols, start, end, timeframe) {
    return __asyncGenerator(this, arguments, function* getAllBarsFromAlpaca_1() {
        const barParams = {
            // Needs to be in YYYY-MM-DD format per https://www.npmjs.com/package/@alpacahq/alpaca-trade-api
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
            timeframe,
            adjustment: rest_v2_1.Adjustment.SPLIT
        };
        const barsGenerator = environment_1.alpacaJs.getMultiBarsAsyncV2(symbols, barParams);
        do {
            const bar = yield __await(barsGenerator.next());
            if (bar.done) {
                return yield __await(void 0);
            }
            yield yield __await(bar.value);
        } while (true);
    });
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esc0RBQThCO0FBQzlCLCtDQUFpRDtBQUNqRCx3RkFBMEY7QUFDMUYsc0ZBQXFHO0FBSTlGLE1BQU0sWUFBWSxHQUFHLENBQUMsTUFBYyxFQUFFLElBQWUsRUFBRSxFQUFFO0lBQzlELE1BQU0sWUFBWSxHQUE0QztRQUM1RCxJQUFJLEVBQUUsd0JBQWEsQ0FBQyxJQUFJO1FBQ3hCLEdBQUcsRUFBRSx3QkFBYSxDQUFDLEdBQUc7UUFDdEIsR0FBRyxFQUFFLHdCQUFhLENBQUMsR0FBRztRQUN0QixJQUFJLEVBQUUsd0JBQWEsQ0FBQyxJQUFJO1FBQ3hCLEtBQUssRUFBRSx3QkFBYSxDQUFDLEtBQUs7S0FDM0IsQ0FBQztJQUNGLE9BQU8sc0JBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNELENBQUMsQ0FBQztBQVRXLFFBQUEsWUFBWSxnQkFTdkI7QUFFSyxNQUFNLHFCQUFxQixHQUFHLENBQUMsU0FBaUIsRUFBRSxFQUFFO0lBQ3pELE9BQU8sU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2pDLENBQUMsQ0FBQztBQUZXLFFBQUEscUJBQXFCLHlCQUVoQztBQUVGLFNBQXVCLG9CQUFvQixDQUFDLE9BQWlCLEVBQUUsS0FBVyxFQUFFLEdBQVMsRUFBRSxTQUFpQjs7UUFDdEcsTUFBTSxTQUFTLEdBQWtCO1lBQy9CLGdHQUFnRztZQUNoRyxLQUFLLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLFNBQVM7WUFDVCxVQUFVLEVBQUUsb0JBQVUsQ0FBQyxLQUFLO1NBQzdCLENBQUE7UUFDRCxNQUFNLGFBQWEsR0FBRyxzQkFBUSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUV2RSxHQUFHO1lBQ0QsTUFBTSxHQUFHLEdBQUcsY0FBTSxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUEsQ0FBQztZQUV2QyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7Z0JBQ1osNkJBQU87YUFDUjtZQUVELG9CQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUEsQ0FBQztTQUNqQixRQUFRLElBQUksRUFBRTtJQUNqQixDQUFDO0NBQUE7QUFuQkQsb0RBbUJDO0FBRU0sTUFBTSxrQkFBa0IsR0FBRyxHQUFTLEVBQUU7SUFDM0MsSUFBSTtRQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sb0JBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN4QyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0MsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUFDLE9BQU8sQ0FBVSxFQUFFO1FBQ25CLGdCQUFNLENBQUMsS0FBSyxDQUFDLHdEQUF3RCxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLE1BQU0sS0FBSyxFQUFFLENBQUM7S0FDZjtBQUNILENBQUMsQ0FBQSxDQUFDO0FBVlcsUUFBQSxrQkFBa0Isc0JBVTdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHsgYWxwYWNhLCBhbHBhY2FKcyB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHsgVGltZUZyYW1lVW5pdCB9IGZyb20gJ0BhbHBhY2FocS9hbHBhY2EtdHJhZGUtYXBpL2Rpc3QvcmVzb3VyY2VzL2RhdGF2Mi9lbnRpdHl2Mic7XG5pbXBvcnQgeyBBZGp1c3RtZW50LCBHZXRCYXJzUGFyYW1zIH0gZnJvbSAnQGFscGFjYWhxL2FscGFjYS10cmFkZS1hcGkvZGlzdC9yZXNvdXJjZXMvZGF0YXYyL3Jlc3RfdjInO1xuXG5leHBvcnQgdHlwZSB0aW1lZnJhbWUgPSAnaG91cicgfCAnbWluJyB8ICdkYXknIHwgJ3dlZWsnIHwgJ21vbnRoJztcblxuZXhwb3J0IGNvbnN0IGdldFRpbWVGcmFtZSA9IChhbW91bnQ6IG51bWJlciwgdW5pdDogdGltZWZyYW1lKSA9PiB7XG4gIGNvbnN0IHRpbWVmcmFtZU1hcDogeyBbZnJhbWUgaW4gdGltZWZyYW1lXTogVGltZUZyYW1lVW5pdCB9ID0ge1xuICAgIGhvdXI6IFRpbWVGcmFtZVVuaXQuSE9VUixcbiAgICBkYXk6IFRpbWVGcmFtZVVuaXQuREFZLFxuICAgIG1pbjogVGltZUZyYW1lVW5pdC5NSU4sXG4gICAgd2VlazogVGltZUZyYW1lVW5pdC5XRUVLLFxuICAgIG1vbnRoOiBUaW1lRnJhbWVVbml0Lk1PTlRIXG4gIH07XG4gIHJldHVybiBhbHBhY2FKcy5uZXdUaW1lZnJhbWUoYW1vdW50LCB0aW1lZnJhbWVNYXBbdW5pdF0pO1xufTtcblxuZXhwb3J0IGNvbnN0IG1hcFRpbWVmcmFtZVRvRGlyTmFtZSA9ICh0aW1lZnJhbWU6IHN0cmluZykgPT4ge1xuICByZXR1cm4gdGltZWZyYW1lLnRvTG93ZXJDYXNlKCk7XG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24qIGdldEFsbEJhcnNGcm9tQWxwYWNhKHN5bWJvbHM6IHN0cmluZ1tdLCBzdGFydDogRGF0ZSwgZW5kOiBEYXRlLCB0aW1lZnJhbWU6IHN0cmluZykge1xuICBjb25zdCBiYXJQYXJhbXM6IEdldEJhcnNQYXJhbXMgPSB7XG4gICAgLy8gTmVlZHMgdG8gYmUgaW4gWVlZWS1NTS1ERCBmb3JtYXQgcGVyIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL0BhbHBhY2FocS9hbHBhY2EtdHJhZGUtYXBpXG4gICAgc3RhcnQ6IHN0YXJ0LnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSxcbiAgICBlbmQ6IGVuZC50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXG4gICAgdGltZWZyYW1lLFxuICAgIGFkanVzdG1lbnQ6IEFkanVzdG1lbnQuU1BMSVRcbiAgfVxuICBjb25zdCBiYXJzR2VuZXJhdG9yID0gYWxwYWNhSnMuZ2V0TXVsdGlCYXJzQXN5bmNWMihzeW1ib2xzLCBiYXJQYXJhbXMpO1xuXG4gIGRvIHtcbiAgICBjb25zdCBiYXIgPSBhd2FpdCBiYXJzR2VuZXJhdG9yLm5leHQoKTtcblxuICAgIGlmIChiYXIuZG9uZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHlpZWxkIGJhci52YWx1ZTtcbiAgfSB3aGlsZSAodHJ1ZSk7XG59XG5cbmV4cG9ydCBjb25zdCBnZXRUcmFkZWFibGVBc3NldHMgPSBhc3luYyAoKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgYXNzZXRzID0gYXdhaXQgYWxwYWNhLmdldEFzc2V0cygpO1xuICAgIHJldHVybiBhc3NldHMuZmlsdGVyKHggPT4ge1xuICAgICAgcmV0dXJuIHgudHJhZGFibGUgJiYgIXguc3ltYm9sLmluY2x1ZGVzKCcvJyk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICBsb2dnZXIuZXJyb3IoYENvdWxkIG5vdCBnZXQgdHJhZGVhYmxlIGFzc2V0cyBmcm9tIGFscGFjYS4gZXJyb3IgaXMgJHtlfWApO1xuICAgIHRocm93IEVycm9yKCk7XG4gIH1cbn07XG4iXX0=