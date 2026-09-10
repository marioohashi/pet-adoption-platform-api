import fs from "node:fs"
import path from "node:path"

import uploadConfig from "@/configs/upload"

export class DiskStorage {
  async saveFile(file: string) {
    await fs.promises.rename(
      path.resolve(uploadConfig.TMP_FOLDER, file),
      path.resolve(uploadConfig.UPLOADS_FOLDER, file)
    )

    return file
  }

  async deleteFile(file: string, type: "tmp" | "upload") {
    const pathFile =
      type === "tmp" ? uploadConfig.TMP_FOLDER : uploadConfig.UPLOADS_FOLDER

    const filePath = path.resolve(pathFile, file)

    try {
      await fs.promises.stat(filePath)
    } catch {
      return
    }

    await fs.promises.unlink(filePath)
  }
}
