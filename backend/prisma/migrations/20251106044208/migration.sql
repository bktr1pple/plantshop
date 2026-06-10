/*
  Warnings:

  - Added the required column `images` to the `Plant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Plant` ADD COLUMN `images` TEXT NOT NULL;
