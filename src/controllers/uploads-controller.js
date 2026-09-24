"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const zod_1 = __importStar(require("zod"));
const upload_1 = __importDefault(require("@/configs/upload"));
const disk_storage_1 = require("@/providers/disk-storage");
const AppError_1 = require("@/utils/AppError");
class UploadsController {
    async create(request, response, next) {
        const diskStorage = new disk_storage_1.DiskStorage();
        try {
            const fileSchema = zod_1.default
                .object({
                filename: zod_1.default.string().min(1, "Arquivo é obrigatório"),
                mimetype: zod_1.default
                    .string()
                    .refine((type) => upload_1.default.ACCEPTED_IMAGE_TYPES.includes(type), "Formato de arquivo inválido. Apenas JPEG, PNG e PDF são permitidos."),
                size: zod_1.default
                    .number()
                    .positive()
                    .refine((size) => size <= upload_1.default.MAX_FILE_SIZE, "Arquivo excede o tamanho máximo de 5MB."),
            })
                .passthrough(); // Permite propriedades adicionais que o multer adiciona ao arquivo
            const file = fileSchema.parse(request.file);
            const filename = await diskStorage.saveFile(file.filename);
            response.status(201).json({ filename });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                if (request.file) {
                    await diskStorage.deleteFile(request.file.filename, "tmp");
                }
                throw new AppError_1.AppError(error.issues[0].message);
            }
            throw error;
        }
    }
}
exports.UploadsController = UploadsController;
