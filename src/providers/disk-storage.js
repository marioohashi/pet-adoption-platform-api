"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiskStorage = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const upload_1 = __importDefault(require("@/configs/upload"));
class DiskStorage {
    async saveFile(file) {
        await node_fs_1.default.promises.rename(node_path_1.default.resolve(upload_1.default.TMP_FOLDER, file), node_path_1.default.resolve(upload_1.default.UPLOADS_FOLDER, file));
        return file;
    }
    async deleteFile(file, type) {
        const pathFile = type === "tmp" ? upload_1.default.TMP_FOLDER : upload_1.default.UPLOADS_FOLDER;
        const filePath = node_path_1.default.resolve(pathFile, file);
        try {
            await node_fs_1.default.promises.stat(filePath);
        }
        catch {
            return;
        }
        await node_fs_1.default.promises.unlink(filePath);
    }
}
exports.DiskStorage = DiskStorage;
