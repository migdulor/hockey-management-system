"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var postgres_1 = require("@vercel/postgres");
require("dotenv/config");
function checkTables() {
    return __awaiter(this, void 0, void 0, function () {
        var tablesResult, tablesToCheck, _i, tablesToCheck_1, tableName, columnsResult, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔍 Consultando estructura de tablas existentes...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, (0, postgres_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      SELECT table_name \n      FROM information_schema.tables \n      WHERE table_schema = 'public' \n      ORDER BY table_name\n    "], ["\n      SELECT table_name \n      FROM information_schema.tables \n      WHERE table_schema = 'public' \n      ORDER BY table_name\n    "])))];
                case 2:
                    tablesResult = _a.sent();
                    console.log('📋 Tablas disponibles:');
                    tablesResult.rows.forEach(function (row) {
                        console.log("  - ".concat(row.table_name));
                    });
                    tablesToCheck = ['formations', 'formation_players', 'teams', 'players', 'users'];
                    _i = 0, tablesToCheck_1 = tablesToCheck;
                    _a.label = 3;
                case 3:
                    if (!(_i < tablesToCheck_1.length)) return [3 /*break*/, 8];
                    tableName = tablesToCheck_1[_i];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, postgres_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n          SELECT column_name, data_type, is_nullable, column_default\n          FROM information_schema.columns \n          WHERE table_name = ", "\n          ORDER BY ordinal_position\n        "], ["\n          SELECT column_name, data_type, is_nullable, column_default\n          FROM information_schema.columns \n          WHERE table_name = ", "\n          ORDER BY ordinal_position\n        "])), tableName)];
                case 5:
                    columnsResult = _a.sent();
                    if (columnsResult.rows.length > 0) {
                        console.log("\n\uD83D\uDCCA Estructura de tabla '".concat(tableName, "':"));
                        columnsResult.rows.forEach(function (col) {
                            console.log("  ".concat(col.column_name, ": ").concat(col.data_type, " ").concat(col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'));
                        });
                    }
                    else {
                        console.log("\n\u274C Tabla '".concat(tableName, "' no existe"));
                    }
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.log("\n\u274C Error consultando tabla '".concat(tableName, "': ").concat(error_1.message));
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_2 = _a.sent();
                    console.error('❌ Error general:', error_2.message);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
checkTables().catch(console.error);
var templateObject_1, templateObject_2;
