-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "location" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'standard',
ADD COLUMN     "videos" TEXT[];
