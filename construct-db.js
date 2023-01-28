#!/usr/bin/env node
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
exports.buildDb = void 0;
const fs_1 = __importDefault(require("fs"));
const winston_1 = __importDefault(require("winston"));
const luxon_1 = require("luxon");
const lodash_1 = require("lodash");
const sequelize_1 = require("sequelize");
const logger = winston_1.default.createLogger({
    transports: [
        new winston_1.default.transports.Console(),
    ]
});
const getDatabaseName = (dataDirectory) => {
    return `${dataDirectory}/daily.db`;
};
const getBarModel = (sequelize) => __awaiter(void 0, void 0, void 0, function* () {
    const Bar = sequelize.define('daily_bars', {
        symbol: sequelize_1.STRING,
        open: sequelize_1.NUMBER,
        high: sequelize_1.NUMBER,
        low: sequelize_1.NUMBER,
        close: sequelize_1.NUMBER,
        volume_weighted: sequelize_1.INTEGER,
        n: sequelize_1.INTEGER,
        // unix_time: INTEGER,
        date: sequelize_1.DATEONLY
    });
    yield sequelize.sync();
    return Bar;
});
const loadDb = (dataDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    // if (fs.existsSync(storage)) {
    // fs.rmSync(storage);
    // }
    const storage = getDatabaseName(dataDirectory);
    const sequelize = new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage,
        // https://sequelize.org/docs/v6/getting-started/#logging
        logging: false
    });
    yield sequelize.authenticate();
    return sequelize;
});
const buildDb = (dataDirectory, start) => __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = yield loadDb(dataDirectory);
    const Bar = yield getBarModel(sequelize);
    const dir = '../data/1day';
    const dateFilenames = fs_1.default.readdirSync(dir);
    const filteredFiles = start ? dateFilenames.filter((d) => {
        const date = d.split('.csv')[0];
        if (luxon_1.DateTime.fromISO(date).startOf('day') <= start.startOf('day')) {
            return false;
        }
        return true;
    }) : dateFilenames;
    const beforeBars = yield Bar.count();
    if (start) {
        yield sequelize.query(`delete from daily_bars where date >= '${start.startOf('day').toFormat('yyyy-MM-dd')}'`);
    }
    yield sequelize.query('PRAGMA synchronous = OFF');
    yield sequelize.query('PRAGMA journal_mode = MEMORY');
    for (const dateFilename of filteredFiles) {
        const stocks = fs_1.default.readFileSync(`${dir}/${dateFilename}`).toString().split('\n').slice(1);
        const date = dateFilename.split('.csv')[0];
        const datetime = luxon_1.DateTime.fromISO(date);
        const transaction = yield sequelize.transaction();
        for (const stock of stocks) {
            const [symbol, open, high, low, close, volume_weighted, n] = stock.split(',');
            // if (symbol !== 'SPY') {
            //   continue;
            // }
            yield Bar.create({
                symbol,
                open: parseFloat(open),
                high: parseFloat(high),
                low: parseFloat(low),
                close: parseFloat(close),
                volume_weighted: (0, lodash_1.parseInt)(volume_weighted),
                n: (0, lodash_1.parseInt)(volume_weighted),
                date
            });
        }
        logger.info(`Saved ${stocks.length} stocks under date ${dateFilename}`);
        yield transaction.commit();
    }
    logger.info(`Before bars ${beforeBars}`);
    logger.info(`After bars ${yield Bar.count()}`);
    sequelize.close();
});
exports.buildDb = buildDb;
const addIndexes = (dataDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = yield loadDb(dataDirectory);
    // const Bar = await getBarModel(sequelize);
    yield sequelize.query(`create index idx_bar_date on daily_bars (date)`);
    yield sequelize.query(`create index idx_symbol on daily_bars (symbol)`);
});
// buildDb(DateTime.now().minus({ months: 1 }));
// addIndexes()
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RydWN0LWRiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uc3RydWN0LWRiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSw0Q0FBb0I7QUFDcEIsc0RBQThCO0FBQzlCLGlDQUFpQztBQUdqQyxtQ0FBa0M7QUFDbEMseUNBQXlFO0FBRXpFLE1BQU0sTUFBTSxHQUFHLGlCQUFPLENBQUMsWUFBWSxDQUFDO0lBQ2xDLFVBQVUsRUFBRTtRQUNWLElBQUksaUJBQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO0tBQ2pDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxlQUFlLEdBQUcsQ0FBQyxhQUFxQixFQUFFLEVBQUU7SUFDaEQsT0FBTyxHQUFHLGFBQWEsV0FBVyxDQUFDO0FBQ3JDLENBQUMsQ0FBQTtBQUVELE1BQU0sV0FBVyxHQUFHLENBQU8sU0FBb0IsRUFBRSxFQUFFO0lBQ2pELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO1FBQ3pDLE1BQU0sRUFBRSxrQkFBTTtRQUNkLElBQUksRUFBRSxrQkFBTTtRQUNaLElBQUksRUFBRSxrQkFBTTtRQUNaLEdBQUcsRUFBRSxrQkFBTTtRQUNYLEtBQUssRUFBRSxrQkFBTTtRQUNiLGVBQWUsRUFBRSxtQkFBTztRQUN4QixDQUFDLEVBQUUsbUJBQU87UUFDVixzQkFBc0I7UUFDdEIsSUFBSSxFQUFFLG9CQUFRO0tBQ2YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFdkIsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDLENBQUEsQ0FBQTtBQUVELE1BQU0sTUFBTSxHQUFHLENBQU8sYUFBcUIsRUFBRSxFQUFFO0lBQzdDLGdDQUFnQztJQUM5QixzQkFBc0I7SUFDeEIsSUFBSTtJQUVKLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUUvQyxNQUFNLFNBQVMs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LElBQUEsaUJBQVEsRUFBQyxlQUFlLENBQUM7Z0JBQzFDLENBQUMsRUFBRSxJQUFBLGlCQUFRLEVBQUMsZUFBZSxDQUFDO2dCQUM1QixJQUFJO2FBQ0wsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDeEUsTUFBTSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDNUI7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsTUFBTSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRS9DLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwQixDQUFDLENBQUEsQ0FBQTtBQTFEWSxRQUFBLE9BQU8sV0EwRG5CO0FBRUQsTUFBTSxVQUFVLEdBQUcsQ0FBTyxhQUFxQixFQUFFLEVBQUU7SUFDakQsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUMsNENBQTRDO0lBQzVDLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0lBQ3hFLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0FBQzFFLENBQUMsQ0FBQSxDQUFBO0FBRUQsZ0RBQWdEO0FBQ2hELGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHdpbnN0b24gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gJ2x1eG9uJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCB7IHBhcnNlSW50IH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IFNlcXVlbGl6ZSwgU1RSSU5HLCBJTlRFR0VSLCBOVU1CRVIsIERBVEVPTkxZIH0gZnJvbSAnc2VxdWVsaXplJztcblxuY29uc3QgbG9nZ2VyID0gd2luc3Rvbi5jcmVhdGVMb2dnZXIoe1xuICB0cmFuc3BvcnRzOiBbXG4gICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKCksXG4gIF1cbn0pO1xuXG5jb25zdCBnZXREYXRhYmFzZU5hbWUgPSAoZGF0YURpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gIHJldHVybiBgJHtkYXRhRGlyZWN0b3J5fS9kYWlseS5kYmA7XG59XG5cbmNvbnN0IGdldEJhck1vZGVsID0gYXN5bmMgKHNlcXVlbGl6ZTogU2VxdWVsaXplKSA9PiB7XG4gIGNvbnN0IEJhciA9IHNlcXVlbGl6ZS5kZWZpbmUoJ2RhaWx5X2JhcnMnLCB7XG4gICAgc3ltYm9sOiBTVFJJTkcsXG4gICAgb3BlbjogTlVNQkVSLFxuICAgIGhpZ2g6IE5VTUJFUixcbiAgICBsb3c6IE5VTUJFUixcbiAgICBjbG9zZTogTlVNQkVSLFxuICAgIHZvbHVtZV93ZWlnaHRlZDogSU5URUdFUixcbiAgICBuOiBJTlRFR0VSLFxuICAgIC8vIHVuaXhfdGltZTogSU5URUdFUixcbiAgICBkYXRlOiBEQVRFT05MWVxuICB9KTtcblxuICBhd2FpdCBzZXF1ZWxpemUuc3luYygpO1xuXG4gIHJldHVybiBCYXI7XG59XG5cbmNvbnN0IGxvYWREYiA9IGFzeW5jIChkYXRhRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgLy8gaWYgKGZzLmV4aXN0c1N5bmMoc3RvcmFnZSkpIHtcbiAgICAvLyBmcy5ybVN5bmMoc3RvcmFnZSk7XG4gIC8vIH1cblxuICBjb25zdCBzdG9yYWdlID0gZ2V0RGF0YWJhc2VOYW1lKGRhdGFEaXJlY3RvcnkpO1xuXG4gIGNvbnN0IHNlcXVlbGl6ZSA9IG5ldyBTZXF1ZWxpemUoe1xuICAgIGRpYWxlY3Q6ICdzcWxpdGUnLFxuICAgIHN0b3JhZ2UsXG4gICAgLy8gaHR0cHM6Ly9zZXF1ZWxpemUub3JnL2RvY3MvdjYvZ2V0dGluZy1zdGFydGVkLyNsb2dnaW5nXG4gICAgbG9nZ2luZzogZmFsc2VcbiAgfSk7XG5cbiAgYXdhaXQgc2VxdWVsaXplLmF1dGhlbnRpY2F0ZSgpO1xuXG4gIHJldHVybiBzZXF1ZWxpemU7XG59XG5cbmV4cG9ydCBjb25zdCBidWlsZERiID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZywgc3RhcnQ/OiBEYXRlVGltZSkgPT4ge1xuICBjb25zdCBzZXF1ZWxpemUgPSBhd2FpdCBsb2FkRGIoZGF0YURpcmVjdG9yeSk7XG5cbiAgY29uc3QgQmFyID0gYXdhaXQgZ2V0QmFyTW9kZWwoc2VxdWVsaXplKTtcblxuICBjb25zdCBkaXIgPSAnLi4vZGF0YS8xZGF5JztcbiAgY29uc3QgZGF0ZUZpbGVuYW1lcyA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG5cbiAgY29uc3QgZmlsdGVyZWRGaWxlcyA9IHN0YXJ0ID8gZGF0ZUZpbGVuYW1lcy5maWx0ZXIoKGQpID0+IHtcbiAgICBjb25zdCBkYXRlID0gZC5zcGxpdCgnLmNzdicpWzBdO1xuXG4gICAgaWYgKERhdGVUaW1lLmZyb21JU08oZGF0ZSkuc3RhcnRPZignZGF5JykgPD0gc3RhcnQuc3RhcnRPZignZGF5JykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSkgOiBkYXRlRmlsZW5hbWVzO1xuXG4gIGNvbnN0IGJlZm9yZUJhcnMgPSBhd2FpdCBCYXIuY291bnQoKTtcbiAgaWYgKHN0YXJ0KSB7XG4gICAgYXdhaXQgc2VxdWVsaXplLnF1ZXJ5KGBkZWxldGUgZnJvbSBkYWlseV9iYXJzIHdoZXJlIGRhdGUgPj0gJyR7c3RhcnQuc3RhcnRPZignZGF5JykudG9Gb3JtYXQoJ3l5eXktTU0tZGQnKX0nYCk7XG4gIH1cblxuICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoJ1BSQUdNQSBzeW5jaHJvbm91cyA9IE9GRicpO1xuICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoJ1BSQUdNQSBqb3VybmFsX21vZGUgPSBNRU1PUlknKTtcblxuICBmb3IgKGNvbnN0IGRhdGVGaWxlbmFtZSBvZiBmaWx0ZXJlZEZpbGVzKSB7XG4gICAgY29uc3Qgc3RvY2tzID0gZnMucmVhZEZpbGVTeW5jKGAke2Rpcn0vJHtkYXRlRmlsZW5hbWV9YCkudG9TdHJpbmcoKS5zcGxpdCgnXFxuJykuc2xpY2UoMSk7XG4gICAgY29uc3QgZGF0ZSA9IGRhdGVGaWxlbmFtZS5zcGxpdCgnLmNzdicpWzBdO1xuICAgIGNvbnN0IGRhdGV0aW1lID0gRGF0ZVRpbWUuZnJvbUlTTyhkYXRlKTtcblxuICAgIGNvbnN0IHRyYW5zYWN0aW9uID0gYXdhaXQgc2VxdWVsaXplLnRyYW5zYWN0aW9uKCk7XG4gICAgZm9yIChjb25zdCBzdG9jayBvZiBzdG9ja3MpIHtcbiAgICAgIGNvbnN0IFtzeW1ib2wsIG9wZW4sIGhpZ2gsIGxvdywgY2xvc2UsIHZvbHVtZV93ZWlnaHRlZCwgbl0gPSBzdG9jay5zcGxpdCgnLCcpO1xuICAgICAgLy8gaWYgKHN5bWJvbCAhPT0gJ1NQWScpIHtcbiAgICAgIC8vICAgY29udGludWU7XG4gICAgICAvLyB9XG5cbiAgICAgIGF3YWl0IEJhci5jcmVhdGUoe1xuICAgICAgICBzeW1ib2wsXG4gICAgICAgIG9wZW46IHBhcnNlRmxvYXQob3BlbiksXG4gICAgICAgIGhpZ2g6IHBhcnNlRmxvYXQoaGlnaCksXG4gICAgICAgIGxvdzogcGFyc2VGbG9hdChsb3cpLFxuICAgICAgICBjbG9zZTogcGFyc2VGbG9hdChjbG9zZSksXG4gICAgICAgIHZvbHVtZV93ZWlnaHRlZDogcGFyc2VJbnQodm9sdW1lX3dlaWdodGVkKSxcbiAgICAgICAgbjogcGFyc2VJbnQodm9sdW1lX3dlaWdodGVkKSxcbiAgICAgICAgZGF0ZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgbG9nZ2VyLmluZm8oYFNhdmVkICR7c3RvY2tzLmxlbmd0aH0gc3RvY2tzIHVuZGVyIGRhdGUgJHtkYXRlRmlsZW5hbWV9YCk7XG4gICAgYXdhaXQgdHJhbnNhY3Rpb24uY29tbWl0KCk7XG4gIH1cblxuICBsb2dnZXIuaW5mbyhgQmVmb3JlIGJhcnMgJHtiZWZvcmVCYXJzfWApO1xuICBsb2dnZXIuaW5mbyhgQWZ0ZXIgYmFycyAke2F3YWl0IEJhci5jb3VudCgpfWApO1xuXG4gIHNlcXVlbGl6ZS5jbG9zZSgpO1xufVxuXG5jb25zdCBhZGRJbmRleGVzID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBjb25zdCBzZXF1ZWxpemUgPSBhd2FpdCBsb2FkRGIoZGF0YURpcmVjdG9yeSk7XG4gIC8vIGNvbnN0IEJhciA9IGF3YWl0IGdldEJhck1vZGVsKHNlcXVlbGl6ZSk7XG4gIGF3YWl0IHNlcXVlbGl6ZS5xdWVyeShgY3JlYXRlIGluZGV4IGlkeF9iYXJfZGF0ZSBvbiBkYWlseV9iYXJzIChkYXRlKWApO1xuICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoYGNyZWF0ZSBpbmRleCBpZHhfc3ltYm9sIG9uIGRhaWx5X2JhcnMgKHN5bWJvbClgKTtcbn1cblxuLy8gYnVpbGREYihEYXRlVGltZS5ub3coKS5taW51cyh7IG1vbnRoczogMSB9KSk7XG4vLyBhZGRJbmRleGVzKClcbiJdfQ==