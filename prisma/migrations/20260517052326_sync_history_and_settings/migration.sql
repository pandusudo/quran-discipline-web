-- AlterTable
ALTER TABLE "extension_settings" ADD COLUMN     "lastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
