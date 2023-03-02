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
        console.log(barParams);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esc0RBQThCO0FBQzlCLCtDQUFpRDtBQUNqRCx3RkFBMEY7QUFDMUYsc0ZBQXFHO0FBSTlGLE1BQU0sWUFBWSxHQUFHLENBQUMsTUFBYyxFQUFFLElBQWUsRUFBRSxFQUFFO0lBQzlELE1BQU0sWUFBWSxHQUE0QztRQUM1RCxJQUFJLEVBQUUsd0JBQWEsQ0FBQyxJQUFJO1FBQ3hCLEdBQUcsRUFBRSx3QkFBYSxDQUFDLEdBQUc7UUFDdEIsR0FBRyxFQUFFLHdCQUFhLENBQUMsR0FBRztRQUN0QixJQUFJLEVBQUUsd0JBQWEsQ0FBQyxJQUFJO1FBQ3hCLEtBQUssRUFBRSx3QkFBYSxDQUFDLEtBQUs7S0FDM0IsQ0FBQztJQUNGLE9BQU8sc0JBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNELENBQUMsQ0FBQztBQVRXLFFBQUEsWUFBWSxnQkFTdkI7QUFFSyxNQUFNLHFCQUFxQixHQUFHLENBQUMsU0FBaUIsRUFBRSxFQUFFO0lBQ3pELE9BQU8sU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2pDLENBQUMsQ0FBQztBQUZXLFFBQUEscUJBQXFCLHlCQUVoQztBQUVGLFNBQXVCLG9CQUFvQixDQUFDLE9BQWlCLEVBQUUsS0FBVyxFQUFFLEdBQVMsRUFBRSxTQUFpQjs7UUFDdEcsTUFBTSxTQUFTLEdBQWtCO1lBQy9CLGdHQUFnRztZQUNoRyxLQUFLLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLFNBQVM7WUFDVCxVQUFVLEVBQUUsb0JBQVUsQ0FBQyxLQUFLO1NBQzdCLENBQUM7UUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXZCLE1BQU0sYUFBYSxHQUFHLHNCQUFRLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRXZFLEdBQUc7WUFDRCxNQUFNLEdBQUcsR0FBRyxjQUFNLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQSxDQUFDO1lBRXZDLElBQUksR0FBRyxDQUFDLElBQUksRUFBRTtnQkFDWiw2QkFBTzthQUNSO1lBRUQsb0JBQU0sR0FBRyxDQUFDLEtBQUssQ0FBQSxDQUFDO1NBQ2pCLFFBQVEsSUFBSSxFQUFFO0lBQ2pCLENBQUM7Q0FBQTtBQXJCRCxvREFxQkM7QUFFTSxNQUFNLGtCQUFrQixHQUFHLEdBQVMsRUFBRTtJQUMzQyxJQUFJO1FBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxvQkFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQUMsT0FBTyxDQUFVLEVBQUU7UUFDbkIsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsd0RBQXdELENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUUsTUFBTSxLQUFLLEVBQUUsQ0FBQztLQUNmO0FBQ0gsQ0FBQyxDQUFBLENBQUM7QUFWVyxRQUFBLGtCQUFrQixzQkFVN0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgeyBhbHBhY2EsIGFscGFjYUpzIH0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQgeyBUaW1lRnJhbWVVbml0IH0gZnJvbSAnQGFscGFjYWhxL2FscGFjYS10cmFkZS1hcGkvZGlzdC9yZXNvdXJjZXMvZGF0YXYyL2VudGl0eXYyJztcbmltcG9ydCB7IEFkanVzdG1lbnQsIEdldEJhcnNQYXJhbXMgfSBmcm9tICdAYWxwYWNhaHEvYWxwYWNhLXRyYWRlLWFwaS9kaXN0L3Jlc291cmNlcy9kYXRhdjIvcmVzdF92Mic7XG5cbmV4cG9ydCB0eXBlIHRpbWVmcmFtZSA9ICdob3VyJyB8ICdtaW4nIHwgJ2RheScgfCAnd2VlaycgfCAnbW9udGgnO1xuXG5leHBvcnQgY29uc3QgZ2V0VGltZUZyYW1lID0gKGFtb3VudDogbnVtYmVyLCB1bml0OiB0aW1lZnJhbWUpID0+IHtcbiAgY29uc3QgdGltZWZyYW1lTWFwOiB7IFtmcmFtZSBpbiB0aW1lZnJhbWVdOiBUaW1lRnJhbWVVbml0IH0gPSB7XG4gICAgaG91cjogVGltZUZyYW1lVW5pdC5IT1VSLFxuICAgIGRheTogVGltZUZyYW1lVW5pdC5EQVksXG4gICAgbWluOiBUaW1lRnJhbWVVbml0Lk1JTixcbiAgICB3ZWVrOiBUaW1lRnJhbWVVbml0LldFRUssXG4gICAgbW9udGg6IFRpbWVGcmFtZVVuaXQuTU9OVEhcbiAgfTtcbiAgcmV0dXJuIGFscGFjYUpzLm5ld1RpbWVmcmFtZShhbW91bnQsIHRpbWVmcmFtZU1hcFt1bml0XSk7XG59O1xuXG5leHBvcnQgY29uc3QgbWFwVGltZWZyYW1lVG9EaXJOYW1lID0gKHRpbWVmcmFtZTogc3RyaW5nKSA9PiB7XG4gIHJldHVybiB0aW1lZnJhbWUudG9Mb3dlckNhc2UoKTtcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiogZ2V0QWxsQmFyc0Zyb21BbHBhY2Eoc3ltYm9sczogc3RyaW5nW10sIHN0YXJ0OiBEYXRlLCBlbmQ6IERhdGUsIHRpbWVmcmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGJhclBhcmFtczogR2V0QmFyc1BhcmFtcyA9IHtcbiAgICAvLyBOZWVkcyB0byBiZSBpbiBZWVlZLU1NLUREIGZvcm1hdCBwZXIgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvQGFscGFjYWhxL2FscGFjYS10cmFkZS1hcGlcbiAgICBzdGFydDogc3RhcnQudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLFxuICAgIGVuZDogZW5kLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSxcbiAgICB0aW1lZnJhbWUsXG4gICAgYWRqdXN0bWVudDogQWRqdXN0bWVudC5TUExJVFxuICB9O1xuICBjb25zb2xlLmxvZyhiYXJQYXJhbXMpO1xuXG4gIGNvbnN0IGJhcnNHZW5lcmF0b3IgPSBhbHBhY2FKcy5nZXRNdWx0aUJhcnNBc3luY1YyKHN5bWJvbHMsIGJhclBhcmFtcyk7XG5cbiAgZG8ge1xuICAgIGNvbnN0IGJhciA9IGF3YWl0IGJhcnNHZW5lcmF0b3IubmV4dCgpO1xuXG4gICAgaWYgKGJhci5kb25lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgeWllbGQgYmFyLnZhbHVlO1xuICB9IHdoaWxlICh0cnVlKTtcbn1cblxuZXhwb3J0IGNvbnN0IGdldFRyYWRlYWJsZUFzc2V0cyA9IGFzeW5jICgpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBhc3NldHMgPSBhd2FpdCBhbHBhY2EuZ2V0QXNzZXRzKCk7XG4gICAgcmV0dXJuIGFzc2V0cy5maWx0ZXIoeCA9PiB7XG4gICAgICByZXR1cm4geC50cmFkYWJsZSAmJiAheC5zeW1ib2wuaW5jbHVkZXMoJy8nKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIGxvZ2dlci5lcnJvcihgQ291bGQgbm90IGdldCB0cmFkZWFibGUgYXNzZXRzIGZyb20gYWxwYWNhLiBlcnJvciBpcyAke2V9YCk7XG4gICAgdGhyb3cgRXJyb3IoKTtcbiAgfVxufTtcbiJdfQ==