-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "displayJson" TEXT,
    "cameraJson" TEXT,
    "batteryJson" TEXT,
    "soc" TEXT NOT NULL,
    "ramGb" INTEGER NOT NULL,
    "storageGb" INTEGER NOT NULL,
    "weightG" INTEGER,
    "dimsMm" TEXT,
    "releaseDate" DATETIME,
    "imagesJson" TEXT,
    "highlightsJson" TEXT
);
