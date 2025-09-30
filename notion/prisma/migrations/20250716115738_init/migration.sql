/*
  Warnings:

  - A unique constraint covering the columns `[userId,noteId]` on the table `comments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "comments_userId_noteId_key" ON "comments"("userId", "noteId");
