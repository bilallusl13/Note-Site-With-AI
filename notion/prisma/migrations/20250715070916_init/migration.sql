-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "text" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "classname" TEXT NOT NULL DEFAULT 'csci-101',
    "userId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_notes" ("classname", "createdAt", "header", "id", "isPublic", "text", "updatedAt", "userId") SELECT "classname", "createdAt", "header", "id", "isPublic", "text", "updatedAt", "userId" FROM "notes";
DROP TABLE "notes";
ALTER TABLE "new_notes" RENAME TO "notes";
CREATE INDEX "notes_userId_idx" ON "notes"("userId");
CREATE INDEX "notes_classname_idx" ON "notes"("classname");
CREATE INDEX "notes_isPublic_idx" ON "notes"("isPublic");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
