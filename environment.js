"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alpacaJs = exports.alpaca = void 0;
const alpaca_1 = require("@master-chief/alpaca");
const alpaca_trade_api_1 = __importDefault(require("@alpacahq/alpaca-trade-api"));
const key = process.env.ALPACA_KEY;
if (!key) {
    throw Error(`Missing alpaca key. Define ALPACA_KEY in your environment.`);
}
const secret = process.env.ALPACA_SECRET;
if (!secret) {
    throw Error(`Missing alpaca secret. Define ALPACA_SECRET in your environment.`);
}
const credentials = {
    key,
    secret,
    paper: false
};
exports.alpaca = new alpaca_1.AlpacaClient({ credentials, rate_limit: true });
exports.alpacaJs = new alpaca_trade_api_1.default({ keyId: key, secretKey: secret, paper: false });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxpREFBb0Q7QUFDcEQsa0ZBQStDO0FBRS9DLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO0FBQ25DLElBQUksQ0FBQyxHQUFHLEVBQUU7SUFDUixNQUFNLEtBQUssQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0NBQzNFO0FBRUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7QUFDekMsSUFBSSxDQUFDLE1BQU0sRUFBRTtJQUNYLE1BQU0sS0FBSyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7Q0FDakY7QUFFRCxNQUFNLFdBQVcsR0FBRztJQUNsQixHQUFHO0lBQ0gsTUFBTTtJQUNOLEtBQUssRUFBRSxLQUFLO0NBQ2IsQ0FBQztBQUVXLFFBQUEsTUFBTSxHQUFHLElBQUkscUJBQVksQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM3RCxRQUFBLFFBQVEsR0FBRyxJQUFJLDBCQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBbHBhY2FDbGllbnQgfSBmcm9tICdAbWFzdGVyLWNoaWVmL2FscGFjYSc7XG5pbXBvcnQgQWxwYWNhIGZyb20gJ0BhbHBhY2FocS9hbHBhY2EtdHJhZGUtYXBpJ1xuXG5jb25zdCBrZXkgPSBwcm9jZXNzLmVudi5BTFBBQ0FfS0VZO1xuaWYgKCFrZXkpIHtcbiAgdGhyb3cgRXJyb3IoYE1pc3NpbmcgYWxwYWNhIGtleS4gRGVmaW5lIEFMUEFDQV9LRVkgaW4geW91ciBlbnZpcm9ubWVudC5gKTtcbn1cblxuY29uc3Qgc2VjcmV0ID0gcHJvY2Vzcy5lbnYuQUxQQUNBX1NFQ1JFVDtcbmlmICghc2VjcmV0KSB7XG4gIHRocm93IEVycm9yKGBNaXNzaW5nIGFscGFjYSBzZWNyZXQuIERlZmluZSBBTFBBQ0FfU0VDUkVUIGluIHlvdXIgZW52aXJvbm1lbnQuYCk7XG59XG5cbmNvbnN0IGNyZWRlbnRpYWxzID0ge1xuICBrZXksXG4gIHNlY3JldCxcbiAgcGFwZXI6IGZhbHNlXG59O1xuXG5leHBvcnQgY29uc3QgYWxwYWNhID0gbmV3IEFscGFjYUNsaWVudCh7IGNyZWRlbnRpYWxzLCByYXRlX2xpbWl0OiB0cnVlIH0pO1xuZXhwb3J0IGNvbnN0IGFscGFjYUpzID0gbmV3IEFscGFjYSh7IGtleUlkOiBrZXksIHNlY3JldEtleTogc2VjcmV0LCBwYXBlcjogZmFsc2UgfSk7XG4iXX0=