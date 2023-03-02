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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxpREFBb0Q7QUFDcEQsa0ZBQWdEO0FBRWhELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO0FBQ25DLElBQUksQ0FBQyxHQUFHLEVBQUU7SUFDUixNQUFNLEtBQUssQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0NBQzNFO0FBRUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7QUFDekMsSUFBSSxDQUFDLE1BQU0sRUFBRTtJQUNYLE1BQU0sS0FBSyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7Q0FDakY7QUFFRCxNQUFNLFdBQVcsR0FBRztJQUNsQixHQUFHO0lBQ0gsTUFBTTtJQUNOLEtBQUssRUFBRSxLQUFLO0NBQ2IsQ0FBQztBQUVXLFFBQUEsTUFBTSxHQUFHLElBQUkscUJBQVksQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM3RCxRQUFBLFFBQVEsR0FBRyxJQUFJLDBCQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBbHBhY2FDbGllbnQgfSBmcm9tICdAbWFzdGVyLWNoaWVmL2FscGFjYSc7XG5pbXBvcnQgQWxwYWNhIGZyb20gJ0BhbHBhY2FocS9hbHBhY2EtdHJhZGUtYXBpJztcblxuY29uc3Qga2V5ID0gcHJvY2Vzcy5lbnYuQUxQQUNBX0tFWTtcbmlmICgha2V5KSB7XG4gIHRocm93IEVycm9yKGBNaXNzaW5nIGFscGFjYSBrZXkuIERlZmluZSBBTFBBQ0FfS0VZIGluIHlvdXIgZW52aXJvbm1lbnQuYCk7XG59XG5cbmNvbnN0IHNlY3JldCA9IHByb2Nlc3MuZW52LkFMUEFDQV9TRUNSRVQ7XG5pZiAoIXNlY3JldCkge1xuICB0aHJvdyBFcnJvcihgTWlzc2luZyBhbHBhY2Egc2VjcmV0LiBEZWZpbmUgQUxQQUNBX1NFQ1JFVCBpbiB5b3VyIGVudmlyb25tZW50LmApO1xufVxuXG5jb25zdCBjcmVkZW50aWFscyA9IHtcbiAga2V5LFxuICBzZWNyZXQsXG4gIHBhcGVyOiBmYWxzZVxufTtcblxuZXhwb3J0IGNvbnN0IGFscGFjYSA9IG5ldyBBbHBhY2FDbGllbnQoeyBjcmVkZW50aWFscywgcmF0ZV9saW1pdDogdHJ1ZSB9KTtcbmV4cG9ydCBjb25zdCBhbHBhY2FKcyA9IG5ldyBBbHBhY2EoeyBrZXlJZDoga2V5LCBzZWNyZXRLZXk6IHNlY3JldCwgcGFwZXI6IGZhbHNlIH0pO1xuIl19