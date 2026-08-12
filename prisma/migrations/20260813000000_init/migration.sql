-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL,
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
    "releaseDate" TIMESTAMP(3),
    "imagesJson" TEXT,
    "highlightsJson" TEXT,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

