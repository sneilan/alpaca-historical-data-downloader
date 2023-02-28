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
exports.getTradeableAssets = exports.getAllBarsFromAlpaca = exports.mapTimeframeToDirName = void 0;
const logger_1 = __importDefault(require("./logger"));
const environment_1 = require("./environment");
const mapTimeframeToDirName = (timeframe) => {
    return timeframe.toLowerCase();
};
exports.mapTimeframeToDirName = mapTimeframeToDirName;
function getAllBarsFromAlpaca(symbols, start, end) {
    return __asyncGenerator(this, arguments, function* getAllBarsFromAlpaca_1() {
        const barsGenerator = environment_1.alpacaJs.getMultiBarsAsyncV2(symbols, {
            start,
            end,
            timeframe: environment_1.alpacaJs.newTimeframe(1, environment_1.alpacaJs.timeframeUnit.DAY)
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsc0RBQThCO0FBQzlCLCtDQUFpRDtBQUUxQyxNQUFNLHFCQUFxQixHQUFHLENBQUMsU0FBMEIsRUFBRSxFQUFFO0lBQ2xFLE9BQU8sU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2pDLENBQUMsQ0FBQztBQUZXLFFBQUEscUJBQXFCLHlCQUVoQztBQUVGLFNBQXVCLG9CQUFvQixDQUFDLE9BQWlCLEVBQUUsS0FBVyxFQUFFLEdBQVM7O1FBQ25GLE1BQU0sYUFBYSxHQUFHLHNCQUFRLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFO1lBQzFELEtBQUs7WUFDTCxHQUFHO1lBQ0gsU0FBUyxFQUFFLHNCQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxzQkFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7U0FDaEUsQ0FBQyxDQUFDO1FBRUgsR0FBRztZQUNELE1BQU0sR0FBRyxHQUFHLGNBQU0sYUFBYSxDQUFDLElBQUksRUFBRSxDQUFBLENBQUM7WUFFdkMsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO2dCQUNaLDZCQUFPO2FBQ1I7WUFFRCxvQkFBTSxHQUFHLENBQUMsS0FBSyxDQUFBLENBQUM7U0FDakIsUUFBUSxJQUFJLEVBQUU7SUFDakIsQ0FBQztDQUFBO0FBaEJELG9EQWdCQztBQUVNLE1BQU0sa0JBQWtCLEdBQUcsR0FBUyxFQUFFO0lBQzNDLElBQUk7UUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLG9CQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDeEMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFBQyxPQUFPLENBQVUsRUFBRTtRQUNuQixnQkFBTSxDQUFDLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRSxNQUFNLEtBQUssRUFBRSxDQUFDO0tBQ2Y7QUFDSCxDQUFDLENBQUEsQ0FBQztBQVZXLFFBQUEsa0JBQWtCLHNCQVU3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBCYXJzVjFUaW1lZnJhbWUgfSBmcm9tICdAbWFzdGVyLWNoaWVmL2FscGFjYSc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7IGFscGFjYSwgYWxwYWNhSnMgfSBmcm9tICcuL2Vudmlyb25tZW50JztcblxuZXhwb3J0IGNvbnN0IG1hcFRpbWVmcmFtZVRvRGlyTmFtZSA9ICh0aW1lZnJhbWU6IEJhcnNWMVRpbWVmcmFtZSkgPT4ge1xuICByZXR1cm4gdGltZWZyYW1lLnRvTG93ZXJDYXNlKCk7XG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24qIGdldEFsbEJhcnNGcm9tQWxwYWNhKHN5bWJvbHM6IHN0cmluZ1tdLCBzdGFydDogRGF0ZSwgZW5kOiBEYXRlKSB7XG4gIGNvbnN0IGJhcnNHZW5lcmF0b3IgPSBhbHBhY2FKcy5nZXRNdWx0aUJhcnNBc3luY1YyKHN5bWJvbHMsIHtcbiAgICBzdGFydCxcbiAgICBlbmQsXG4gICAgdGltZWZyYW1lOiBhbHBhY2FKcy5uZXdUaW1lZnJhbWUoMSwgYWxwYWNhSnMudGltZWZyYW1lVW5pdC5EQVkpXG4gIH0pO1xuXG4gIGRvIHtcbiAgICBjb25zdCBiYXIgPSBhd2FpdCBiYXJzR2VuZXJhdG9yLm5leHQoKTtcblxuICAgIGlmIChiYXIuZG9uZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHlpZWxkIGJhci52YWx1ZTtcbiAgfSB3aGlsZSAodHJ1ZSk7XG59XG5cbmV4cG9ydCBjb25zdCBnZXRUcmFkZWFibGVBc3NldHMgPSBhc3luYyAoKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgYXNzZXRzID0gYXdhaXQgYWxwYWNhLmdldEFzc2V0cygpO1xuICAgIHJldHVybiBhc3NldHMuZmlsdGVyKHggPT4ge1xuICAgICAgcmV0dXJuIHgudHJhZGFibGUgJiYgIXguc3ltYm9sLmluY2x1ZGVzKCcvJyk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICBsb2dnZXIuZXJyb3IoYENvdWxkIG5vdCBnZXQgdHJhZGVhYmxlIGFzc2V0cyBmcm9tIGFscGFjYS4gZXJyb3IgaXMgJHtlfWApO1xuICAgIHRocm93IEVycm9yKCk7XG4gIH1cbn07XG4iXX0=