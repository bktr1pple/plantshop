/*
  Warnings:

  - You are about to drop the column `image` on the `Plant` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Plant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Plant` DROP COLUMN `image`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
