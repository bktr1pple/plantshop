-- AlterTable
ALTER TABLE `User`
    ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `RefreshToken`
    ADD COLUMN `trustedContextHash` VARCHAR(191) NULL,
    ADD COLUMN `userAgentSummary` VARCHAR(191) NULL,
    ADD COLUMN `lastUsedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `VerificationToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `type` ENUM('EMAIL_VERIFY', 'PASSWORD_RESET') NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `targetEmail` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `consumedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VerificationToken_userId_type_expiresAt_idx`(`userId`, `type`, `expiresAt`),
    INDEX `VerificationToken_userId_type_consumedAt_idx`(`userId`, `type`, `consumedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoginChallenge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `contextHash` VARCHAR(191) NOT NULL,
    `ipHash` VARCHAR(191) NULL,
    `userAgentSummary` VARCHAR(191) NULL,
    `attemptCount` INTEGER NOT NULL DEFAULT 0,
    `maxAttempts` INTEGER NOT NULL DEFAULT 5,
    `expiresAt` DATETIME(3) NOT NULL,
    `consumedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LoginChallenge_userId_expiresAt_idx`(`userId`, `expiresAt`),
    INDEX `LoginChallenge_userId_consumedAt_idx`(`userId`, `consumedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `RefreshToken_userId_expiresAt_idx` ON `RefreshToken`(`userId`, `expiresAt`);

-- CreateIndex
CREATE INDEX `RefreshToken_trustedContextHash_idx` ON `RefreshToken`(`trustedContextHash`);

-- AddForeignKey
ALTER TABLE `VerificationToken` ADD CONSTRAINT `VerificationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoginChallenge` ADD CONSTRAINT `LoginChallenge_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
