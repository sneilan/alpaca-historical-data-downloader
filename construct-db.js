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
    const storage = getDatabaseName(dataDirectory);
    const sequelize = new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage,
        // https://sequelize.org/docs/v6/getting-started/#logging
        logging: false
    });
    if (!fs_1.default.existsSync(storage)) {
        yield getBarModel(sequelize);
    }
    yield sequelize.authenticate();
    return sequelize;
});
const buildDb = (dataDirectory, start) => __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = yield loadDb(dataDirectory);
    const Bar = yield getBarModel(sequelize);
    const dir = `${dataDirectory}/1day`;
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
                n: (0, lodash_1.parseInt)(n),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RydWN0LWRiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uc3RydWN0LWRiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSw0Q0FBb0I7QUFDcEIsc0RBQThCO0FBQzlCLGlDQUFpQztBQUdqQyxtQ0FBa0M7QUFDbEMseUNBQXlFO0FBRXpFLE1BQU0sTUFBTSxHQUFHLGlCQUFPLENBQUMsWUFBWSxDQUFDO0lBQ2xDLFVBQVUsRUFBRTtRQUNWLElBQUksaUJBQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO0tBQ2pDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxlQUFlLEdBQUcsQ0FBQyxhQUFxQixFQUFFLEVBQUU7SUFDaEQsT0FBTyxHQUFHLGFBQWEsV0FBVyxDQUFDO0FBQ3JDLENBQUMsQ0FBQTtBQUVELE1BQU0sV0FBVyxHQUFHLENBQU8sU0FBb0IsRUFBRSxFQUFFO0lBQ2pELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO1FBQ3pDLE1BQU0sRUFBRSxrQkFBTTtRQUNkLElBQUksRUFBRSxrQkFBTTtRQUNaLElBQUksRUFBRSxrQkFBTTtRQUNaLEdBQUcsRUFBRSxrQkFBTTtRQUNYLEtBQUssRUFBRSxrQkFBTTtRQUNiLGVBQWUsRUFBRSxtQkFBTztRQUN4QixDQUFDLEVBQUUsbUJBQU87UUFDVixzQkFBc0I7UUFDdEIsSUFBSSxFQUFFLG9CQUFRO0tBQ2YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFdkIsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDLENBQUEsQ0FBQTtBQUVELE1BQU0sTUFBTSxHQUFHLENBQU8sYUFBcUIsRUFBRSxFQUFFO0lBRTdDLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUUvQyxNQUFNLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQUM7UUFDOUIsT0FBTyxFQUFF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QUMsR0FBRyxDQUFDO2dCQUNwQixLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQztnQkFDeEIsZUFBZSxFQUFFLElBQUEsaUJBQVEsRUFBQyxlQUFlLENBQUM7Z0JBQzFDLENBQUMsRUFBRSxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxDQUFDO2dCQUNkLElBQUk7YUFDTCxDQUFDLENBQUM7U0FDSjtRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxNQUFNLENBQUMsTUFBTSxzQkFBc0IsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUN4RSxNQUFNLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUM1QjtJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxNQUFNLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFL0MsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3BCLENBQUMsQ0FBQSxDQUFBO0FBMURZLFFBQUEsT0FBTyxXQTBEbkI7QUFFRCxNQUFNLFVBQVUsR0FBRyxDQUFPLGFBQXFCLEVBQUUsRUFBRTtJQUNqRCxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5Qyw0Q0FBNEM7SUFDNUMsTUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7SUFDeEUsTUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7QUFDMUUsQ0FBQyxDQUFBLENBQUE7QUFFRCxnREFBZ0Q7QUFDaEQsZUFBZSIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgd2luc3RvbiBmcm9tICd3aW5zdG9uJztcbmltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSAnbHV4b24nO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuaW1wb3J0IHsgcGFyc2VJbnQgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgU2VxdWVsaXplLCBTVFJJTkcsIElOVEVHRVIsIE5VTUJFUiwgREFURU9OTFkgfSBmcm9tICdzZXF1ZWxpemUnO1xuXG5jb25zdCBsb2dnZXIgPSB3aW5zdG9uLmNyZWF0ZUxvZ2dlcih7XG4gIHRyYW5zcG9ydHM6IFtcbiAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoKSxcbiAgXVxufSk7XG5cbmNvbnN0IGdldERhdGFiYXNlTmFtZSA9IChkYXRhRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgcmV0dXJuIGAke2RhdGFEaXJlY3Rvcnl9L2RhaWx5LmRiYDtcbn1cblxuY29uc3QgZ2V0QmFyTW9kZWwgPSBhc3luYyAoc2VxdWVsaXplOiBTZXF1ZWxpemUpID0+IHtcbiAgY29uc3QgQmFyID0gc2VxdWVsaXplLmRlZmluZSgnZGFpbHlfYmFycycsIHtcbiAgICBzeW1ib2w6IFNUUklORyxcbiAgICBvcGVuOiBOVU1CRVIsXG4gICAgaGlnaDogTlVNQkVSLFxuICAgIGxvdzogTlVNQkVSLFxuICAgIGNsb3NlOiBOVU1CRVIsXG4gICAgdm9sdW1lX3dlaWdodGVkOiBJTlRFR0VSLFxuICAgIG46IElOVEVHRVIsXG4gICAgLy8gdW5peF90aW1lOiBJTlRFR0VSLFxuICAgIGRhdGU6IERBVEVPTkxZXG4gIH0pO1xuXG4gIGF3YWl0IHNlcXVlbGl6ZS5zeW5jKCk7XG5cbiAgcmV0dXJuIEJhcjtcbn1cblxuY29uc3QgbG9hZERiID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuXG4gIGNvbnN0IHN0b3JhZ2UgPSBnZXREYXRhYmFzZU5hbWUoZGF0YURpcmVjdG9yeSk7XG5cbiAgY29uc3Qgc2VxdWVsaXplID0gbmV3IFNlcXVlbGl6ZSh7XG4gICAgZGlhbGVjdDogJ3NxbGl0ZScsXG4gICAgc3RvcmFnZSxcbiAgICAvLyBodHRwczovL3NlcXVlbGl6ZS5vcmcvZG9jcy92Ni9nZXR0aW5nLXN0YXJ0ZWQvI2xvZ2dpbmdcbiAgICBsb2dnaW5nOiBmYWxzZVxuICB9KTtcblxuICBpZiAoIWZzLmV4aXN0c1N5bmMoc3RvcmFnZSkpIHtcbiAgICBhd2FpdCBnZXRCYXJNb2RlbChzZXF1ZWxpemUpO1xuICB9XG5cbiAgYXdhaXQgc2VxdWVsaXplLmF1dGhlbnRpY2F0ZSgpO1xuXG4gIHJldHVybiBzZXF1ZWxpemU7XG59XG5cbmV4cG9ydCBjb25zdCBidWlsZERiID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZywgc3RhcnQ/OiBEYXRlVGltZSkgPT4ge1xuICBjb25zdCBzZXF1ZWxpemUgPSBhd2FpdCBsb2FkRGIoZGF0YURpcmVjdG9yeSk7XG5cbiAgY29uc3QgQmFyID0gYXdhaXQgZ2V0QmFyTW9kZWwoc2VxdWVsaXplKTtcblxuICBjb25zdCBkaXIgPSBgJHtkYXRhRGlyZWN0b3J5fS8xZGF5YDtcbiAgY29uc3QgZGF0ZUZpbGVuYW1lcyA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG5cbiAgY29uc3QgZmlsdGVyZWRGaWxlcyA9IHN0YXJ0ID8gZGF0ZUZpbGVuYW1lcy5maWx0ZXIoKGQpID0+IHtcbiAgICBjb25zdCBkYXRlID0gZC5zcGxpdCgnLmNzdicpWzBdO1xuXG4gICAgaWYgKERhdGVUaW1lLmZyb21JU08oZGF0ZSkuc3RhcnRPZignZGF5JykgPD0gc3RhcnQuc3RhcnRPZignZGF5JykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSkgOiBkYXRlRmlsZW5hbWVzO1xuXG4gIGNvbnN0IGJlZm9yZUJhcnMgPSBhd2FpdCBCYXIuY291bnQoKTtcbiAgaWYgKHN0YXJ0KSB7XG4gICAgYXdhaXQgc2VxdWVsaXplLnF1ZXJ5KGBkZWxldGUgZnJvbSBkYWlseV9iYXJzIHdoZXJlIGRhdGUgPj0gJyR7c3RhcnQuc3RhcnRPZignZGF5JykudG9Gb3JtYXQoJ3l5eXktTU0tZGQnKX0nYCk7XG4gIH1cblxuICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoJ1BSQUdNQSBzeW5jaHJvbm91cyA9IE9GRicpO1xuICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoJ1BSQUdNQSBqb3VybmFsX21vZGUgPSBNRU1PUlknKTtcblxuICBmb3IgKGNvbnN0IGRhdGVGaWxlbmFtZSBvZiBmaWx0ZXJlZEZpbGVzKSB7XG4gICAgY29uc3Qgc3RvY2tzID0gZnMucmVhZEZpbGVTeW5jKGAke2Rpcn0vJHtkYXRlRmlsZW5hbWV9YCkudG9TdHJpbmcoKS5zcGxpdCgnXFxuJykuc2xpY2UoMSk7XG4gICAgY29uc3QgZGF0ZSA9IGRhdGVGaWxlbmFtZS5zcGxpdCgnLmNzdicpWzBdO1xuICAgIGNvbnN0IGRhdGV0aW1lID0gRGF0ZVRpbWUuZnJvbUlTTyhkYXRlKTtcblxuICAgIGNvbnN0IHRyYW5zYWN0aW9uID0gYXdhaXQgc2VxdWVsaXplLnRyYW5zYWN0aW9uKCk7XG4gICAgZm9yIChjb25zdCBzdG9jayBvZiBzdG9ja3MpIHtcbiAgICAgIGNvbnN0IFtzeW1ib2wsIG9wZW4sIGhpZ2gsIGxvdywgY2xvc2UsIHZvbHVtZV93ZWlnaHRlZCwgbl0gPSBzdG9jay5zcGxpdCgnLCcpO1xuICAgICAgLy8gaWYgKHN5bWJvbCAhPT0gJ1NQWScpIHtcbiAgICAgIC8vICAgY29udGludWU7XG4gICAgICAvLyB9XG5cbiAgICAgIGF3YWl0IEJhci5jcmVhdGUoe1xuICAgICAgICBzeW1ib2wsXG4gICAgICAgIG9wZW46IHBhcnNlRmxvYXQob3BlbiksXG4gICAgICAgIGhpZ2g6IHBhcnNlRmxvYXQoaGlnaCksXG4gICAgICAgIGxvdzogcGFyc2VGbG9hdChsb3cpLFxuICAgICAgICBjbG9zZTogcGFyc2VGbG9hdChjbG9zZSksXG4gICAgICAgIHZvbHVtZV93ZWlnaHRlZDogcGFyc2VJbnQodm9sdW1lX3dlaWdodGVkKSxcbiAgICAgICAgbjogcGFyc2VJbnQobiksXG4gICAgICAgIGRhdGVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGxvZ2dlci5pbmZvKGBTYXZlZCAke3N0b2Nrcy5sZW5ndGh9IHN0b2NrcyB1bmRlciBkYXRlICR7ZGF0ZUZpbGVuYW1lfWApO1xuICAgIGF3YWl0IHRyYW5zYWN0aW9uLmNvbW1pdCgpO1xuICB9XG5cbiAgbG9nZ2VyLmluZm8oYEJlZm9yZSBiYXJzICR7YmVmb3JlQmFyc31gKTtcbiAgbG9nZ2VyLmluZm8oYEFmdGVyIGJhcnMgJHthd2FpdCBCYXIuY291bnQoKX1gKTtcblxuICBzZXF1ZWxpemUuY2xvc2UoKTtcbn1cblxuY29uc3QgYWRkSW5kZXhlcyA9IGFzeW5jIChkYXRhRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgY29uc3Qgc2VxdWVsaXplID0gYXdhaXQgbG9hZERiKGRhdGFEaXJlY3RvcnkpO1xuICAvLyBjb25zdCBCYXIgPSBhd2FpdCBnZXRCYXJNb2RlbChzZXF1ZWxpemUpO1xuICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoYGNyZWF0ZSBpbmRleCBpZHhfYmFyX2RhdGUgb24gZGFpbHlfYmFycyAoZGF0ZSlgKTtcbiAgYXdhaXQgc2VxdWVsaXplLnF1ZXJ5KGBjcmVhdGUgaW5kZXggaWR4X3N5bWJvbCBvbiBkYWlseV9iYXJzIChzeW1ib2wpYCk7XG59XG5cbi8vIGJ1aWxkRGIoRGF0ZVRpbWUubm93KCkubWludXMoeyBtb250aHM6IDEgfSkpO1xuLy8gYWRkSW5kZXhlcygpXG4iXX0=