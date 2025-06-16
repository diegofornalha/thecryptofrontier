"use strict";
/**
 * article api
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const article_1 = __importDefault(require("./routes/article"));
const article_2 = __importDefault(require("./controllers/article"));
const article_3 = __importDefault(require("./services/article"));
exports.default = {
    routes: article_1.default,
    controllers: article_2.default,
    services: article_3.default,
};
