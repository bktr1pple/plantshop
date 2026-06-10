-- Existing bcrypt refresh-token hashes cannot be converted into indexed
-- HMAC digests without the original tokens. Revoke all existing sessions.
DELETE FROM `RefreshToken`;

-- MySQL requires an index whose first column is `userId` while the foreign
-- key exists. Keep a temporary supporting index until the replacement
-- composite indexes have been created.
CREATE INDEX `RefreshToken_userId_migration_guard_idx` ON `RefreshToken`(`userId`);

DROP INDEX `RefreshToken_userId_expiresAt_idx` ON `RefreshToken`;
DROP INDEX `RefreshToken_trustedContextHash_idx` ON `RefreshToken`;

ALTER TABLE `RefreshToken`
    DROP COLUMN `tokenHash`,
    ADD COLUMN `jti` VARCHAR(191) NOT NULL,
    ADD COLUMN `tokenDigest` VARCHAR(191) NOT NULL,
    ADD COLUMN `familyId` VARCHAR(191) NOT NULL,
    ADD COLUMN `revokedAt` DATETIME(3) NULL,
    ADD COLUMN `replacedByTokenId` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

CREATE UNIQUE INDEX `RefreshToken_jti_key` ON `RefreshToken`(`jti`);
CREATE UNIQUE INDEX `RefreshToken_tokenDigest_key` ON `RefreshToken`(`tokenDigest`);
CREATE INDEX `RefreshToken_userId_expiresAt_idx` ON `RefreshToken`(`userId`, `expiresAt`);
CREATE INDEX `RefreshToken_userId_familyId_idx` ON `RefreshToken`(`userId`, `familyId`);
CREATE INDEX `RefreshToken_familyId_revokedAt_idx` ON `RefreshToken`(`familyId`, `revokedAt`);
CREATE INDEX `RefreshToken_trustedContextHash_idx` ON `RefreshToken`(`trustedContextHash`);

DROP INDEX `RefreshToken_userId_migration_guard_idx` ON `RefreshToken`;
