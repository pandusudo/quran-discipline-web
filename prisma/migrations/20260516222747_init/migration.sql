-- CreateEnum
CREATE TYPE "BlockMode" AS ENUM ('timer', 'audio', 'hard');

-- CreateEnum
CREATE TYPE "BlockContext" AS ENUM ('standard', 'focus');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_sites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "addedAt" TIMESTAMP(3) NOT NULL,
    "blockedCount" INTEGER NOT NULL DEFAULT 0,
    "blockMode" "BlockMode" NOT NULL DEFAULT 'timer',
    "timerSeconds" INTEGER NOT NULL DEFAULT 30,
    "unlockDurationMinutes" INTEGER NOT NULL DEFAULT 5,
    "lastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocked_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "context" "BlockContext" NOT NULL DEFAULT 'standard',

    CONSTRAINT "block_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extension_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showTranslation" BOOLEAN NOT NULL DEFAULT true,
    "showTransliteration" BOOLEAN NOT NULL DEFAULT false,
    "blockingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extension_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_externalId_key" ON "users"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_sites_userId_domain_key" ON "blocked_sites"("userId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "extension_settings_userId_key" ON "extension_settings"("userId");

-- AddForeignKey
ALTER TABLE "blocked_sites" ADD CONSTRAINT "blocked_sites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_history" ADD CONSTRAINT "block_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extension_settings" ADD CONSTRAINT "extension_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
