-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trash" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noteId" TEXT,
    "eventId" TEXT,
    "noteHeader" TEXT,
    "eventTitle" TEXT,
    "deletedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Trash" ("deletedAt", "eventId", "id", "noteHeader", "noteId") SELECT "deletedAt", "eventId", "id", "noteHeader", "noteId" FROM "Trash";
DROP TABLE "Trash";
ALTER TABLE "new_Trash" RENAME TO "Trash";
CREATE UNIQUE INDEX "Trash_noteId_key" ON "Trash"("noteId");
CREATE UNIQUE INDEX "Trash_eventId_key" ON "Trash"("eventId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
