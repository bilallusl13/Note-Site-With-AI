-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserMessages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserMessages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserMessages" ("id", "message") SELECT "id", "message" FROM "UserMessages";
DROP TABLE "UserMessages";
ALTER TABLE "new_UserMessages" RENAME TO "UserMessages";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
