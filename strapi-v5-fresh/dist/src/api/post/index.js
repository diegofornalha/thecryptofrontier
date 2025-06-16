"use strict";
/**
 * post api
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const post_1 = __importDefault(require("./routes/post"));
const post_2 = __importDefault(require("./controllers/post"));
const post_3 = __importDefault(require("./services/post"));
exports.default = {
    routes: post_1.default,
    controllers: post_2.default,
    services: post_3.default,
};
