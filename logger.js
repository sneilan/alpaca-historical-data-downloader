"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
exports.logger = winston_1.default.createLogger({
    transports: [
        new winston_1.default.transports.Console(),
    ]
});
exports.default = exports.logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHNEQUE4QjtBQUVqQixRQUFBLE1BQU0sR0FBRyxpQkFBTyxDQUFDLFlBQVksQ0FBQztJQUN6QyxVQUFVLEVBQUU7UUFDVixJQUFJLGlCQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtLQUNqQztDQUNGLENBQUMsQ0FBQztBQUVILGtCQUFlLGNBQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB3aW5zdG9uIGZyb20gJ3dpbnN0b24nO1xuXG5leHBvcnQgY29uc3QgbG9nZ2VyID0gd2luc3Rvbi5jcmVhdGVMb2dnZXIoe1xuICB0cmFuc3BvcnRzOiBbXG4gICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKCksXG4gIF1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBsb2dnZXI7XG4iXX0=