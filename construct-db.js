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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RydWN0LWRiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uc3RydWN0LWRiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSw0Q0FBb0I7QUFDcEIsc0RBQThCO0FBQzlCLGlDQUFpQztBQUdqQyxtQ0FBa0M7QUFDbEMseUNBQXlFO0FBRXpFLE1BQU0sTUFBTSxHQUFHLGlCQUFPLENBQUMsWUFBWSxDQUFDO0lBQ2xDLFVBQVUsRUFBRTtRQUNWLElBQUksaUJBQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO0tBQ2pDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxlQUFlLEdBQUcsQ0FBQyxhQUFxQixFQUFFLEVBQUU7SUFDaEQsT0FBTyxHQUFHLGFBQWEsV0FBVyxDQUFDO0FBQ3JDLENBQUMsQ0FBQTtBQUVELE1BQU0sV0FBVyxHQUFHLENBQU8sU0FBb0IsRUFBRSxFQUFFO0lBQ2pELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO1FBQ3pDLE1BQU0sRUFBRSxrQkFBTTtRQUNkLElBQUksRUFBRSxrQkFBTTtRQUNaLElBQUksRUFBRSxrQkFBTTtRQUNaLEdBQUcsRUFBRSxrQkFBTTtRQUNYLEtBQUssRUFBRSxrQkFBTTtRQUNiLGVBQWUsRUFBRSxtQkFBTztRQUN4QixDQUFDLEVBQUUsbUJBQU87UUFDVixzQkFBc0I7UUFDdEIsSUFBSSxFQUFFLG9CQUFRO0tBQ2YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFdkIsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDLENBQUEsQ0FBQTtBQUVELE1BQU0sTUFBTSxHQUFHLENBQU8sYUFBcUIsRUFBRSxFQUFFO0lBQzdDLGdDQUFnQztJQUM5QixzQkFBc0I7SUFDeEIsSUFBSTtJQUVKLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUUvQyxNQUFNLFNBQVMs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LElBQUEsaUJBQVEsRUFBQyxlQUFlLENBQUM7Z0JBQzFDLENBQUMsRUFBRSxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxDQUFDO2dCQUNkLElBQUk7YUFDTCxDQUFDLENBQUM7U0FDSjtRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxNQUFNLENBQUMsTUFBTSxzQkFBc0IsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUN4RSxNQUFNLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUM1QjtJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxNQUFNLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFL0MsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3BCLENBQUMsQ0FBQSxDQUFBO0FBMURZLFFBQUEsT0FBTyxXQTBEbkI7QUFFRCxNQUFNLFVBQVUsR0FBRyxDQUFPLGFBQXFCLEVBQUUsRUFBRTtJQUNqRCxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5Qyw0Q0FBNEM7SUFDNUMsTUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7SUFDeEUsTUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7QUFDMUUsQ0FBQyxDQUFBLENBQUE7QUFFRCxnREFBZ0Q7QUFDaEQsZUFBZSIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgd2luc3RvbiBmcm9tICd3aW5zdG9uJztcbmltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSAnbHV4b24nO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuaW1wb3J0IHsgcGFyc2VJbnQgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgU2VxdWVsaXplLCBTVFJJTkcsIElOVEVHRVIsIE5VTUJFUiwgREFURU9OTFkgfSBmcm9tICdzZXF1ZWxpemUnO1xuXG5jb25zdCBsb2dnZXIgPSB3aW5zdG9uLmNyZWF0ZUxvZ2dlcih7XG4gIHRyYW5zcG9ydHM6IFtcbiAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoKSxcbiAgXVxufSk7XG5cbmNvbnN0IGdldERhdGFiYXNlTmFtZSA9IChkYXRhRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgcmV0dXJuIGAke2RhdGFEaXJlY3Rvcnl9L2RhaWx5LmRiYDtcbn1cblxuY29uc3QgZ2V0QmFyTW9kZWwgPSBhc3luYyAoc2VxdWVsaXplOiBTZXF1ZWxpemUpID0+IHtcbiAgY29uc3QgQmFyID0gc2VxdWVsaXplLmRlZmluZSgnZGFpbHlfYmFycycsIHtcbiAgICBzeW1ib2w6IFNUUklORyxcbiAgICBvcGVuOiBOVU1CRVIsXG4gICAgaGlnaDogTlVNQkVSLFxuICAgIGxvdzogTlVNQkVSLFxuICAgIGNsb3NlOiBOVU1CRVIsXG4gICAgdm9sdW1lX3dlaWdodGVkOiBJTlRFR0VSLFxuICAgIG46IElOVEVHRVIsXG4gICAgLy8gdW5peF90aW1lOiBJTlRFR0VSLFxuICAgIGRhdGU6IERBVEVPTkxZXG4gIH0pO1xuXG4gIGF3YWl0IHNlcXVlbGl6ZS5zeW5jKCk7XG5cbiAgcmV0dXJuIEJhcjtcbn1cblxuY29uc3QgbG9hZERiID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICAvLyBpZiAoZnMuZXhpc3RzU3luYyhzdG9yYWdlKSkge1xuICAgIC8vIGZzLnJtU3luYyhzdG9yYWdlKTtcbiAgLy8gfVxuXG4gIGNvbnN0IHN0b3JhZ2UgPSBnZXREYXRhYmFzZU5hbWUoZGF0YURpcmVjdG9yeSk7XG5cbiAgY29uc3Qgc2VxdWVsaXplID0gbmV3IFNlcXVlbGl6ZSh7XG4gICAgZGlhbGVjdDogJ3NxbGl0ZScsXG4gICAgc3RvcmFnZSxcbiAgICAvLyBodHRwczovL3NlcXVlbGl6ZS5vcmcvZG9jcy92Ni9nZXR0aW5nLXN0YXJ0ZWQvI2xvZ2dpbmdcbiAgICBsb2dnaW5nOiBmYWxzZVxuICB9KTtcblxuICBhd2FpdCBzZXF1ZWxpemUuYXV0aGVudGljYXRlKCk7XG5cbiAgcmV0dXJuIHNlcXVlbGl6ZTtcbn1cblxuZXhwb3J0IGNvbnN0IGJ1aWxkRGIgPSBhc3luYyAoZGF0YURpcmVjdG9yeTogc3RyaW5nLCBzdGFydD86IERhdGVUaW1lKSA9PiB7XG4gIGNvbnN0IHNlcXVlbGl6ZSA9IGF3YWl0IGxvYWREYihkYXRhRGlyZWN0b3J5KTtcblxuICBjb25zdCBCYXIgPSBhd2FpdCBnZXRCYXJNb2RlbChzZXF1ZWxpemUpO1xuXG4gIGNvbnN0IGRpciA9ICcuLi9kYXRhLzFkYXknO1xuICBjb25zdCBkYXRlRmlsZW5hbWVzID0gZnMucmVhZGRpclN5bmMoZGlyKTtcblxuICBjb25zdCBmaWx0ZXJlZEZpbGVzID0gc3RhcnQgPyBkYXRlRmlsZW5hbWVzLmZpbHRlcigoZCkgPT4ge1xuICAgIGNvbnN0IGRhdGUgPSBkLnNwbGl0KCcuY3N2JylbMF07XG5cbiAgICBpZiAoRGF0ZVRpbWUuZnJvbUlTTyhkYXRlKS5zdGFydE9mKCdkYXknKSA8PSBzdGFydC5zdGFydE9mKCdkYXknKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9KSA6IGRhdGVGaWxlbmFtZXM7XG5cbiAgY29uc3QgYmVmb3JlQmFycyA9IGF3YWl0IEJhci5jb3VudCgpO1xuICBpZiAoc3RhcnQpIHtcbiAgICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoYGRlbGV0ZSBmcm9tIGRhaWx5X2JhcnMgd2hlcmUgZGF0ZSA+PSAnJHtzdGFydC5zdGFydE9mKCdkYXknKS50b0Zvcm1hdCgneXl5eS1NTS1kZCcpfSdgKTtcbiAgfVxuXG4gIGF3YWl0IHNlcXVlbGl6ZS5xdWVyeSgnUFJBR01BIHN5bmNocm9ub3VzID0gT0ZGJyk7XG4gIGF3YWl0IHNlcXVlbGl6ZS5xdWVyeSgnUFJBR01BIGpvdXJuYWxfbW9kZSA9IE1FTU9SWScpO1xuXG4gIGZvciAoY29uc3QgZGF0ZUZpbGVuYW1lIG9mIGZpbHRlcmVkRmlsZXMpIHtcbiAgICBjb25zdCBzdG9ja3MgPSBmcy5yZWFkRmlsZVN5bmMoYCR7ZGlyfS8ke2RhdGVGaWxlbmFtZX1gKS50b1N0cmluZygpLnNwbGl0KCdcXG4nKS5zbGljZSgxKTtcbiAgICBjb25zdCBkYXRlID0gZGF0ZUZpbGVuYW1lLnNwbGl0KCcuY3N2JylbMF07XG4gICAgY29uc3QgZGF0ZXRpbWUgPSBEYXRlVGltZS5mcm9tSVNPKGRhdGUpO1xuXG4gICAgY29uc3QgdHJhbnNhY3Rpb24gPSBhd2FpdCBzZXF1ZWxpemUudHJhbnNhY3Rpb24oKTtcbiAgICBmb3IgKGNvbnN0IHN0b2NrIG9mIHN0b2Nrcykge1xuICAgICAgY29uc3QgW3N5bWJvbCwgb3BlbiwgaGlnaCwgbG93LCBjbG9zZSwgdm9sdW1lX3dlaWdodGVkLCBuXSA9IHN0b2NrLnNwbGl0KCcsJyk7XG4gICAgICAvLyBpZiAoc3ltYm9sICE9PSAnU1BZJykge1xuICAgICAgLy8gICBjb250aW51ZTtcbiAgICAgIC8vIH1cblxuICAgICAgYXdhaXQgQmFyLmNyZWF0ZSh7XG4gICAgICAgIHN5bWJvbCxcbiAgICAgICAgb3BlbjogcGFyc2VGbG9hdChvcGVuKSxcbiAgICAgICAgaGlnaDogcGFyc2VGbG9hdChoaWdoKSxcbiAgICAgICAgbG93OiBwYXJzZUZsb2F0KGxvdyksXG4gICAgICAgIGNsb3NlOiBwYXJzZUZsb2F0KGNsb3NlKSxcbiAgICAgICAgdm9sdW1lX3dlaWdodGVkOiBwYXJzZUludCh2b2x1bWVfd2VpZ2h0ZWQpLFxuICAgICAgICBuOiBwYXJzZUludChuKSxcbiAgICAgICAgZGF0ZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgbG9nZ2VyLmluZm8oYFNhdmVkICR7c3RvY2tzLmxlbmd0aH0gc3RvY2tzIHVuZGVyIGRhdGUgJHtkYXRlRmlsZW5hbWV9YCk7XG4gICAgYXdhaXQgdHJhbnNhY3Rpb24uY29tbWl0KCk7XG4gIH1cblxuICBsb2dnZXIuaW5mbyhgQmVmb3JlIGJhcnMgJHtiZWZvcmVCYXJzfWApO1xuICBsb2dnZXIuaW5mbyhgQWZ0ZXIgYmFycyAke2F3YWl0IEJhci5jb3VudCgpfWApO1xuXG4gIHNlcXVlbGl6ZS5jbG9zZSgpO1xufVxuXG5jb25zdCBhZGRJbmRleGVzID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBjb25zdCBzZXF1ZWxpemUgPSBhd2FpdCBsb2FkRGIoZGF0YURpcmVjdG9yeSk7XG4gIC8vIGNvbnN0IEJhciA9IGF3YWl0IGdldEJhck1vZGVsKHNlcXVlbGl6ZSk7XG4gIGF3YWl0IHNlcXVlbGl6ZS5xdWVyeShgY3JlYXRlIGluZGV4IGlkeF9iYXJfZGF0ZSBvbiBkYWlseV9iYXJzIChkYXRlKWApO1xuICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoYGNyZWF0ZSBpbmRleCBpZHhfc3ltYm9sIG9uIGRhaWx5X2JhcnMgKHN5bWJvbClgKTtcbn1cblxuLy8gYnVpbGREYihEYXRlVGltZS5ub3coKS5taW51cyh7IG1vbnRoczogMSB9KSk7XG4vLyBhZGRJbmRleGVzKClcbiJdfQ==