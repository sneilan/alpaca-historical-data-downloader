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
// buildDb(DateTime.now().minus({ months: 1 }));
// addIndexes()
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RydWN0LWRiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uc3RydWN0LWRiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSw0Q0FBb0I7QUFDcEIsc0RBQThCO0FBQzlCLGlDQUFpQztBQUdqQyxtQ0FBa0M7QUFDbEMseUNBQXlFO0FBRXpFLE1BQU0sTUFBTSxHQUFHLGlCQUFPLENBQUMsWUFBWSxDQUFDO0lBQ2xDLFVBQVUsRUFBRTtRQUNWLElBQUksaUJBQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO0tBQ2pDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxlQUFlLEdBQUcsQ0FBQyxhQUFxQixFQUFFLEVBQUU7SUFDaEQsT0FBTyxHQUFHLGFBQWEsV0FBVyxDQUFDO0FBQ3JDLENBQUMsQ0FBQTtBQUVELE1BQU0sV0FBVyxHQUFHLENBQU8sU0FBb0IsRUFBRSxFQUFFO0lBQ2pELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO1FBQ3pDLE1BQU0sRUFBRSxrQkFBTTtRQUNkLElBQUksRUFBRSxrQkFBTTtRQUNaLElBQUksRUFBRSxrQkFBTTtRQUNaLEdBQUcsRUFBRSxrQkFBTTtRQUNYLEtBQUssRUFBRSxrQkFBTTtRQUNiLGVBQWUsRUFBRSxtQkFBTztRQUN4QixDQUFDLEVBQUUsbUJBQU87UUFDVixzQkFBc0I7UUFDdEIsSUFBSSxFQUFFLG9CQUFRO0tBQ2YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFdkIsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDLENBQUEsQ0FBQTtBQUVELE1BQU0sTUFBTSxHQUFHLENBQU8sYUFBcUIsRUFBRSxFQUFFO0lBQzdDLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUUvQyxNQUFNLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQUM7UUFDOUIsT0FBTyxFQUFF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cnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHdpbnN0b24gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gJ2x1eG9uJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCB7IHBhcnNlSW50IH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IFNlcXVlbGl6ZSwgU1RSSU5HLCBJTlRFR0VSLCBOVU1CRVIsIERBVEVPTkxZIH0gZnJvbSAnc2VxdWVsaXplJztcblxuY29uc3QgbG9nZ2VyID0gd2luc3Rvbi5jcmVhdGVMb2dnZXIoe1xuICB0cmFuc3BvcnRzOiBbXG4gICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKCksXG4gIF1cbn0pO1xuXG5jb25zdCBnZXREYXRhYmFzZU5hbWUgPSAoZGF0YURpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gIHJldHVybiBgJHtkYXRhRGlyZWN0b3J5fS9kYWlseS5kYmA7XG59XG5cbmNvbnN0IGdldEJhck1vZGVsID0gYXN5bmMgKHNlcXVlbGl6ZTogU2VxdWVsaXplKSA9PiB7XG4gIGNvbnN0IEJhciA9IHNlcXVlbGl6ZS5kZWZpbmUoJ2RhaWx5X2JhcnMnLCB7XG4gICAgc3ltYm9sOiBTVFJJTkcsXG4gICAgb3BlbjogTlVNQkVSLFxuICAgIGhpZ2g6IE5VTUJFUixcbiAgICBsb3c6IE5VTUJFUixcbiAgICBjbG9zZTogTlVNQkVSLFxuICAgIHZvbHVtZV93ZWlnaHRlZDogSU5URUdFUixcbiAgICBuOiBJTlRFR0VSLFxuICAgIC8vIHVuaXhfdGltZTogSU5URUdFUixcbiAgICBkYXRlOiBEQVRFT05MWVxuICB9KTtcblxuICBhd2FpdCBzZXF1ZWxpemUuc3luYygpO1xuXG4gIHJldHVybiBCYXI7XG59XG5cbmNvbnN0IGxvYWREYiA9IGFzeW5jIChkYXRhRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgY29uc3Qgc3RvcmFnZSA9IGdldERhdGFiYXNlTmFtZShkYXRhRGlyZWN0b3J5KTtcblxuICBjb25zdCBzZXF1ZWxpemUgPSBuZXcgU2VxdWVsaXplKHtcbiAgICBkaWFsZWN0OiAnc3FsaXRlJyxcbiAgICBzdG9yYWdlLFxuICAgIC8vIGh0dHBzOi8vc2VxdWVsaXplLm9yZy9kb2NzL3Y2L2dldHRpbmctc3RhcnRlZC8jbG9nZ2luZ1xuICAgIGxvZ2dpbmc6IGZhbHNlXG4gIH0pO1xuXG4gIGF3YWl0IHNlcXVlbGl6ZS5hdXRoZW50aWNhdGUoKTtcblxuICByZXR1cm4gc2VxdWVsaXplO1xufVxuXG5leHBvcnQgY29uc3QgYnVpbGREYiA9IGFzeW5jIChkYXRhRGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgY29uc3Qgc2VxdWVsaXplID0gYXdhaXQgbG9hZERiKGRhdGFEaXJlY3RvcnkpO1xuXG4gIGNvbnN0IEJhciA9IGF3YWl0IGdldEJhck1vZGVsKHNlcXVlbGl6ZSk7XG5cbiAgY29uc3QgZGlyID0gYCR7ZGF0YURpcmVjdG9yeX0vMWRheWA7XG4gIGNvbnN0IGRhdGVGaWxlbmFtZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIpO1xuXG4gIC8vIEdpdmVuIGEgc2V0IG9mIGZpbGVzIGFuZCBhIGRhdGFiYXNlLCBnZXQgdGhlIG1heGltdW0gZGF0ZSBpbiB0aGUgZGF0YWJhc2UgJiBsb2FkIGZpbGVzIGZyb20gZml2ZSBkYXlzIGFnbyBpZiB3ZSBoYXZlIGRhdGEgaW4gdGhlIGRhdGFiYXNlLlxuICBjb25zdCBbW3tzdGFydEpzRGF0ZX1dXSA9IChhd2FpdCBzZXF1ZWxpemUucXVlcnkoYHNlbGVjdCBtYXgoZGF0ZSkgYXMgc3RhcnRKc0RhdGUgZnJvbSBkYWlseV9iYXJzYCkpIGFzIFt7c3RhcnRKc0RhdGU6IHN0cmluZ31bXSwgdW5rbm93bl07XG5cbiAgY29uc3Qgc3RhcnQgPSBzdGFydEpzRGF0ZSA/IERhdGVUaW1lLmZyb21Gb3JtYXQoc3RhcnRKc0RhdGUsICd5eXl5LU1NLWRkJykubWludXMoeydkYXlzJzogNX0pIDogdW5kZWZpbmVkO1xuXG4gIGNvbnN0IGZpbHRlcmVkRmlsZXMgPSBzdGFydCA/IGRhdGVGaWxlbmFtZXMuZmlsdGVyKChkKSA9PiB7XG4gICAgY29uc3QgZGF0ZSA9IGQuc3BsaXQoJy5jc3YnKVswXTtcblxuICAgIGlmIChEYXRlVGltZS5mcm9tSVNPKGRhdGUpLnN0YXJ0T2YoJ2RheScpID49IHN0YXJ0LnN0YXJ0T2YoJ2RheScpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pIDogZGF0ZUZpbGVuYW1lcztcblxuICBjb25zdCBiZWZvcmVCYXJzID0gYXdhaXQgQmFyLmNvdW50KCk7XG4gIGlmIChzdGFydCkge1xuICAgIGF3YWl0IHNlcXVlbGl6ZS5xdWVyeShgZGVsZXRlIGZyb20gZGFpbHlfYmFycyB3aGVyZSBkYXRlID49ICcke3N0YXJ0LnN0YXJ0T2YoJ2RheScpLnRvRm9ybWF0KCd5eXl5LU1NLWRkJyl9J2ApO1xuICB9XG5cbiAgYXdhaXQgc2VxdWVsaXplLnF1ZXJ5KCdQUkFHTUEgc3luY2hyb25vdXMgPSBPRkYnKTtcbiAgYXdhaXQgc2VxdWVsaXplLnF1ZXJ5KCdQUkFHTUEgam91cm5hbF9tb2RlID0gTUVNT1JZJyk7XG5cbiAgZm9yIChjb25zdCBkYXRlRmlsZW5hbWUgb2YgZmlsdGVyZWRGaWxlcykge1xuICAgIGNvbnN0IHN0b2NrcyA9IGZzLnJlYWRGaWxlU3luYyhgJHtkaXJ9LyR7ZGF0ZUZpbGVuYW1lfWApLnRvU3RyaW5nKCkuc3BsaXQoJ1xcbicpLnNsaWNlKDEpO1xuICAgIGNvbnN0IGRhdGUgPSBkYXRlRmlsZW5hbWUuc3BsaXQoJy5jc3YnKVswXTtcbiAgICBjb25zdCBkYXRldGltZSA9IERhdGVUaW1lLmZyb21JU08oZGF0ZSk7XG5cbiAgICBjb25zdCB0cmFuc2FjdGlvbiA9IGF3YWl0IHNlcXVlbGl6ZS50cmFuc2FjdGlvbigpO1xuICAgIGZvciAoY29uc3Qgc3RvY2sgb2Ygc3RvY2tzKSB7XG4gICAgICBjb25zdCBbc3ltYm9sLCBvcGVuLCBoaWdoLCBsb3csIGNsb3NlLCB2b2x1bWVfd2VpZ2h0ZWQsIG5dID0gc3RvY2suc3BsaXQoJywnKTtcblxuICAgICAgYXdhaXQgQmFyLmNyZWF0ZSh7XG4gICAgICAgIHN5bWJvbCxcbiAgICAgICAgb3BlbjogcGFyc2VGbG9hdChvcGVuKSxcbiAgICAgICAgaGlnaDogcGFyc2VGbG9hdChoaWdoKSxcbiAgICAgICAgbG93OiBwYXJzZUZsb2F0KGxvdyksXG4gICAgICAgIGNsb3NlOiBwYXJzZUZsb2F0KGNsb3NlKSxcbiAgICAgICAgdm9sdW1lX3dlaWdodGVkOiBwYXJzZUludCh2b2x1bWVfd2VpZ2h0ZWQpLFxuICAgICAgICBuOiBwYXJzZUludChuKSxcbiAgICAgICAgZGF0ZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgbG9nZ2VyLmluZm8oYFNhdmVkICR7c3RvY2tzLmxlbmd0aH0gc3RvY2tzIHVuZGVyIGRhdGUgJHtkYXRlRmlsZW5hbWV9YCk7XG4gICAgYXdhaXQgdHJhbnNhY3Rpb24uY29tbWl0KCk7XG4gIH1cblxuICBsb2dnZXIuaW5mbyhgQmVmb3JlIGJhcnMgJHtiZWZvcmVCYXJzfWApO1xuICBsb2dnZXIuaW5mbyhgQWZ0ZXIgYmFycyAke2F3YWl0IEJhci5jb3VudCgpfWApO1xuXG4gIHNlcXVlbGl6ZS5jbG9zZSgpO1xufVxuXG5jb25zdCBhZGRJbmRleGVzID0gYXN5bmMgKGRhdGFEaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICBjb25zdCBzZXF1ZWxpemUgPSBhd2FpdCBsb2FkRGIoZGF0YURpcmVjdG9yeSk7XG4gIC8vIGNvbnN0IEJhciA9IGF3YWl0IGdldEJhck1vZGVsKHNlcXVlbGl6ZSk7XG4gIGF3YWl0IHNlcXVlbGl6ZS5xdWVyeShgY3JlYXRlIGluZGV4IGlkeF9iYXJfZGF0ZSBvbiBkYWlseV9iYXJzIChkYXRlKWApO1xuICBhd2FpdCBzZXF1ZWxpemUucXVlcnkoYGNyZWF0ZSBpbmRleCBpZHhfc3ltYm9sIG9uIGRhaWx5X2JhcnMgKHN5bWJvbClgKTtcbn1cblxuLy8gYnVpbGREYihEYXRlVGltZS5ub3coKS5taW51cyh7IG1vbnRoczogMSB9KSk7XG4vLyBhZGRJbmRleGVzKClcbiJdfQ==