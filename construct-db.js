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
exports.addIndexes = exports.buildDb = void 0;
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
    yield sequelize.authenticate();
    return sequelize;
});
const buildDb = (dataDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = yield loadDb(dataDirectory);
    const Bar = yield getBarModel(sequelize);
    const dir = `${dataDirectory}/1day`;
    const dateFilenames = fs_1.default.readdirSync(dir);
    // Given a set of files and a database, get the maximum date in the database & load files from five days ago if we have data in the database.
    const [[{ startJsDate }]] = (yield sequelize.query(`select max(date) as startJsDate from daily_bars`));
    const start = startJsDate ? luxon_1.DateTime.fromFormat(startJsDate, 'yyyy-MM-dd').minus({ 'days': 5 }) : undefined;
    const filteredFiles = start ? dateFilenames.filter((d) => {
        const date = d.split('.csv')[0];
        if (luxon_1.DateTime.fromISO(date).startOf('day') >= start.startOf('day')) {
            return true;
        }
        return false;
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
exports.addIndexes = addIndexes;
// buildDb(DateTime.now().minus({ months: 1 }));
// addIndexes();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RydWN0LWRiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uc3RydWN0LWRiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSw0Q0FBb0I7QUFDcEIsc0RBQThCO0FBQzlCLGlDQUFpQztBQUdqQyxtQ0FBa0M7QUFDbEMseUNBQXlFO0FBRXpFLE1BQU0sTUFBTSxHQUFHLGlCQUFPLENBQUMsWUFBWSxDQUFDO0lBQ2xDLFVBQVUsRUFBRTtRQUNWLElBQUksaUJBQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO0tBQ2pDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxlQUFlLEdBQUcsQ0FBQyxhQUFxQixFQUFFLEVBQUU7SUFDaEQsT0FBTyxHQUFHLGFBQWEsV0FBVyxDQUFDO0FBQ3JDLENBQUMsQ0FBQTtBQUVELE1BQU0sV0FBVyxHQUFHLENBQU8sU0FBb0IsRUFBRSxFQUFFO0lBQ2pELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO1FBQ3pDLE1BQU0sRUFBRSxrQkFBTTtRQUNkLElBQUksRUFBRSxrQkFBTTtRQUNaLElBQUksRUFBRSxrQkFBTTtRQUNaLEdBQUcsRUFBRSxrQkFBTTtRQUNYLEtBQUssRUFBRSxrQkFBTTtRQUNiLGVBQWUsRUFBRSxtQkFBTztRQUN4QixDQUFDLEVBQUUsbUJBQU87UUFDVixzQkFBc0I7UUFDdEIsSUFBSSxFQUFFLG9CQUFRO0tBQ2YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFdkIsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDLENBQUEsQ0FBQTtBQUVELE1BQU0sTUFBTSxHQUFHLENBQU8sYUFBcUIsRUFBRSxFQUFFO0lBQzdDLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUUvQyxNQUFNLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQUM7UUFDOUIsT0FBTyxFQUFFLFFBQVE7UUFDakIsT0FBTztRQUNQLHlEQUF5RDtRQUN6RCxPQUFPLEVBQUUsS0FBSztLQUNmLENBQUMsQ0FBQztJQUVILE1BQU0sU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBRS9CLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMsQ0FBQSxDQUFBO0FBRU0sTUFBTSxPQUFPLEdBQUcsQ0FBTyxhQUFxQixFQUFFLEVBQUU7SUFDckQsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFOUMsTUFBTSxHQUFHLEdBQUcsTUFBTSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFekMsTUFBTSxHQUFHLEdBQUcsR0FBRyxhQUFhLE9BQU8sQ0FBQztJQUNwQyxNQUFNLGFBQWEsR0FBRyxZQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRTFDLDZJQUE2STtJQUM3SSxNQUFNLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUF1QyxDQUFDO0lBRTNJLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFFMUcsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDdkQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVoQyxJQUFJLGdCQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pFLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7SUFFbkIsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckMsSUFBSSxLQUFLLEVBQUU7UUFDVCxNQUFNLFNBQVMsQ0FBQyxLQUFLLENBQUMseUNBQXlDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNoSDtJQUVELE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ2xELE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0lBRXRELEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxFQUFFO1FBQ3hDLE1BQU0sTUFBTSxHQUFHLFlBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsTUFBTSxRQUFRLEdBQUcsZ0JBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFeEMsTUFBTSxXQUFXLEdBQUcsTUFBTSxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEQsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDMUIsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFOUUsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUNmLE1BQU07Z0JBQ04sSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RCLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDO2dCQUN0QixHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDcEIsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUM7Z0JBQ3hCLGVBQWUsRUFBRSxJQUFBLGlCQUFRLEVBQUMsZUFBZSxDQUFDO2dCQUMxQyxDQUFDLEVBQUUsSUFBQSxpQkFBUSxFQUFDLENBQUMsQ0FBQztnQkFDZCxJQUFJO2FBQ0wsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDeEUsTUFBTSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDNUI7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsTUFBTSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRS9DLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwQixDQUFDLENBQUEsQ0FBQTtBQTVEWSxRQUFBLE9BQU8sV0E0RG5CO0FBRU0sTUFBTSxVQUFVLEdBQUcsQ0FBTyxhQUFxQixFQUFFLEVBQUU7SUFDeEQsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUMsNENBQTRDO0lBQzVDLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0lBQ3hFLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0FBQzFFLENBQUMsQ0FBQSxDQUFBO0FBTFksUUFBQSxVQUFVLGNBS3RCO0FBRUQsZ0RBQWdEO0FBQ2hELGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgd2luc3RvbiBmcm9tICd3aW5zdG9uJztcbmltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSAnbHV4b24nO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuaW1wb3J0IHsgcGFyc2VJbnQgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgU2VxdWVsaXplLCBTVFJJTkcsIElOVEVHRVIsIE5VTUJFUiwgREFURU9OTFkgfSBmcm9tICdzZXF1ZWxpemUnO1xuXG5jb25zdCBsb2dnZXIgPSB3aW5zdG9uLmNyZWF0ZUxvZ2dlcih7XG4gIHRyYW5zcG9ydHM6IFtcbiAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoKSxcbiAgXVxufSk7XG5cbmNvbnN0IGdldERhdGFiYXNlTmFtZSA9IChkYXRhRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgcmV0dXJuIGAke2RhdGFEaXJlY3Rvcnl9L2RhaWx5LmRiYDtcbn1cblxuY29uc3QgZ2V0QmFyTW9kZWwgPSBhc3luYyAoc2VxdWVsaXplOiBTZXF1ZWxpemUpID0+IHtcbiAgY29uc3QgQmFyID0gc2VxdWVsaXplLmRlZmluZSgnZGFpbHlfYmFycycsIHtcbiAgICBzeW1ib2w6IFNUUklORyxcbiAgICBvcGVuOiBOVU1CRVIsXG4gICAgaGlnaDogTlVNQkVSLFxuICAgIGxvdzogTlVNQkVSLFxuICAgIGNsb3NlOiBOVU1CRVIsXG4gICAgdm9sdW1lX3dlaWdodGVkOiBJTlRFR0VSLFxuICAgIG46IElOVEVHRVIsXG4gICAgLy8gdW5peF90aW1lOiBJTlRFR0VSLFxuICAgIGRhdGU6IERBVEVPTkxZXG4gIH0pO1xuXG4gIGF3YWl0IHNlcXVlbGl6ZS5zeW5jKCk7XG5cbiAgcmV0dXJuIEJhcjtcbn1cblxuY29uc3QgbG9hZERiID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBjb25zdCBzdG9yYWdlID0gZ2V0RGF0YWJhc2VOYW1lKGRhdGFEaXJlY3RvcnkpO1xuXG4gIGNvbnN0IHNlcXVlbGl6ZSA9IG5ldyBTZXF1ZWxpemUoe1xuICAgIGRpYWxlY3Q6ICdzcWxpdGUnLFxuICAgIHN0b3JhZ2UsXG4gICAgLy8gaHR0cHM6Ly9zZXF1ZWxpemUub3JnL2RvY3MvdjYvZ2V0dGluZy1zdGFydGVkLyNsb2dnaW5nXG4gICAgbG9nZ2luZzogZmFsc2VcbiAgfSk7XG5cbiAgYXdhaXQgc2VxdWVsaXplLmF1dGhlbnRpY2F0ZSgpO1xuXG4gIHJldHVybiBzZXF1ZWxpemU7XG59XG5cbmV4cG9ydCBjb25zdCBidWlsZERiID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBjb25zdCBzZXF1ZWxpemUgPSBhd2FpdCBsb2FkRGIoZGF0YURpcmVjdG9yeSk7XG5cbiAgY29uc3QgQmFyID0gYXdhaXQgZ2V0QmFyTW9kZWwoc2VxdWVsaXplKTtcblxuICBjb25zdCBkaXIgPSBgJHtkYXRhRGlyZWN0b3J5fS8xZGF5YDtcbiAgY29uc3QgZGF0ZUZpbGVuYW1lcyA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG5cbiAgLy8gR2l2ZW4gYSBzZXQgb2YgZmlsZXMgYW5kIGEgZGF0YWJhc2UsIGdldCB0aGUgbWF4aW11bSBkYXRlIGluIHRoZSBkYXRhYmFzZSAmIGxvYWQgZmlsZXMgZnJvbSBmaXZlIGRheXMgYWdvIGlmIHdlIGhhdmUgZGF0YSBpbiB0aGUgZGF0YWJhc2UuXG4gIGNvbnN0IFtbe3N0YXJ0SnNEYXRlfV1dID0gKGF3YWl0IHNlcXVlbGl6ZS5xdWVyeShgc2VsZWN0IG1heChkYXRlKSBhcyBzdGFydEpzRGF0ZSBmcm9tIGRhaWx5X2JhcnNgKSkgYXMgW3tzdGFydEpzRGF0ZTogc3RyaW5nfVtdLCB1bmtub3duXTtcblxuICBjb25zdCBzdGFydCA9IHN0YXJ0SnNEYXRlID8gRGF0ZVRpbWUuZnJvbUZvcm1hdChzdGFydEpzRGF0ZSwgJ3l5eXktTU0tZGQnKS5taW51cyh7J2RheXMnOiA1fSkgOiB1bmRlZmluZWQ7XG5cbiAgY29uc3QgZmlsdGVyZWRGaWxlcyA9IHN0YXJ0ID8gZGF0ZUZpbGVuYW1lcy5maWx0ZXIoKGQpID0+IHtcbiAgICBjb25zdCBkYXRlID0gZC5zcGxpdCgnLmNzdicpWzBdO1xuXG4gICAgaWYgKERhdGVUaW1lLmZyb21JU08oZGF0ZSkuc3RhcnRPZignZGF5JykgPj0gc3RhcnQuc3RhcnRPZignZGF5JykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSkgOiBkYXRlRmlsZW5hbWVzO1xuXG4gIGNvbnN0IGJlZm9yZUJhcnMgPSBhd2FpdCBCYXIuY291bnQoKTtcbiAgaWYgKHN0YXJ0KSB7XG4gICAgYXdhaXQgc2VxdWVsaXplLnF1ZXJ5KGBkZWxldGUgZnJvbSBkYWlseV9iYXJzIHdoZXJlIGRhdGUgPj0gJyR7c3RhcnQuc3RhcnRPZignZGF5JykudG9Gb3JtYXQoJ3l5eXktTU0tZGQnKX0nYCk7XG4gIH1cblxuICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoJ1BSQUdNQSBzeW5jaHJvbm91cyA9IE9GRicpO1xuICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoJ1BSQUdNQSBqb3VybmFsX21vZGUgPSBNRU1PUlknKTtcblxuICBmb3IgKGNvbnN0IGRhdGVGaWxlbmFtZSBvZiBmaWx0ZXJlZEZpbGVzKSB7XG4gICAgY29uc3Qgc3RvY2tzID0gZnMucmVhZEZpbGVTeW5jKGAke2Rpcn0vJHtkYXRlRmlsZW5hbWV9YCkudG9TdHJpbmcoKS5zcGxpdCgnXFxuJykuc2xpY2UoMSk7XG4gICAgY29uc3QgZGF0ZSA9IGRhdGVGaWxlbmFtZS5zcGxpdCgnLmNzdicpWzBdO1xuICAgIGNvbnN0IGRhdGV0aW1lID0gRGF0ZVRpbWUuZnJvbUlTTyhkYXRlKTtcblxuICAgIGNvbnN0IHRyYW5zYWN0aW9uID0gYXdhaXQgc2VxdWVsaXplLnRyYW5zYWN0aW9uKCk7XG4gICAgZm9yIChjb25zdCBzdG9jayBvZiBzdG9ja3MpIHtcbiAgICAgIGNvbnN0IFtzeW1ib2wsIG9wZW4sIGhpZ2gsIGxvdywgY2xvc2UsIHZvbHVtZV93ZWlnaHRlZCwgbl0gPSBzdG9jay5zcGxpdCgnLCcpO1xuXG4gICAgICBhd2FpdCBCYXIuY3JlYXRlKHtcbiAgICAgICAgc3ltYm9sLFxuICAgICAgICBvcGVuOiBwYXJzZUZsb2F0KG9wZW4pLFxuICAgICAgICBoaWdoOiBwYXJzZUZsb2F0KGhpZ2gpLFxuICAgICAgICBsb3c6IHBhcnNlRmxvYXQobG93KSxcbiAgICAgICAgY2xvc2U6IHBhcnNlRmxvYXQoY2xvc2UpLFxuICAgICAgICB2b2x1bWVfd2VpZ2h0ZWQ6IHBhcnNlSW50KHZvbHVtZV93ZWlnaHRlZCksXG4gICAgICAgIG46IHBhcnNlSW50KG4pLFxuICAgICAgICBkYXRlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBsb2dnZXIuaW5mbyhgU2F2ZWQgJHtzdG9ja3MubGVuZ3RofSBzdG9ja3MgdW5kZXIgZGF0ZSAke2RhdGVGaWxlbmFtZX1gKTtcbiAgICBhd2FpdCB0cmFuc2FjdGlvbi5jb21taXQoKTtcbiAgfVxuXG4gIGxvZ2dlci5pbmZvKGBCZWZvcmUgYmFycyAke2JlZm9yZUJhcnN9YCk7XG4gIGxvZ2dlci5pbmZvKGBBZnRlciBiYXJzICR7YXdhaXQgQmFyLmNvdW50KCl9YCk7XG5cbiAgc2VxdWVsaXplLmNsb3NlKCk7XG59XG5cbmV4cG9ydCBjb25zdCBhZGRJbmRleGVzID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBjb25zdCBzZXF1ZWxpemUgPSBhd2FpdCBsb2FkRGIoZGF0YURpcmVjdG9yeSk7XG4gIC8vIGNvbnN0IEJhciA9IGF3YWl0IGdldEJhck1vZGVsKHNlcXVlbGl6ZSk7XG4gIGF3YWl0IHNlcXVlbGl6ZS5xdWVyeShgY3JlYXRlIGluZGV4IGlkeF9iYXJfZGF0ZSBvbiBkYWlseV9iYXJzIChkYXRlKWApO1xuICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoYGNyZWF0ZSBpbmRleCBpZHhfc3ltYm9sIG9uIGRhaWx5X2JhcnMgKHN5bWJvbClgKTtcbn1cblxuLy8gYnVpbGREYihEYXRlVGltZS5ub3coKS5taW51cyh7IG1vbnRoczogMSB9KSk7XG4vLyBhZGRJbmRleGVzKCk7XG4iXX0=