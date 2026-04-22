CREATE TYPE "InteractionType" AS ENUM ('LIKE', 'PASS');

CREATE TABLE "interactions" (
    "id" TEXT NOT NULL,
    "fromPetId" TEXT NOT NULL,
    "toPetId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "interactions_fromPetId_idx" ON "interactions"("fromPetId");

CREATE INDEX "interactions_toPetId_idx" ON "interactions"("toPetId");

CREATE INDEX "interactions_fromPetId_type_idx" ON "interactions"("fromPetId", "type");

CREATE UNIQUE INDEX "interactions_fromPetId_toPetId_key" ON "interactions"("fromPetId", "toPetId");

ALTER TABLE "interactions" ADD CONSTRAINT "interactions_fromPetId_fkey" FOREIGN KEY ("fromPetId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "interactions" ADD CONSTRAINT "interactions_toPetId_fkey" FOREIGN KEY ("toPetId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "interactions" ("id", "fromPetId", "toPetId", "type", "createdAt")
SELECT "id", "fromPetId", "toPetId", 'LIKE'::"InteractionType", CURRENT_TIMESTAMP
FROM "likes"
ON CONFLICT ("fromPetId", "toPetId") DO NOTHING;

INSERT INTO "matches" ("id", "pet1Id", "pet2Id", "createdAt")
SELECT
    CONCAT('match_', md5(LEAST(left_like."fromPetId", left_like."toPetId") || ':' || GREATEST(left_like."fromPetId", left_like."toPetId"))),
    LEAST(left_like."fromPetId", left_like."toPetId"),
    GREATEST(left_like."fromPetId", left_like."toPetId"),
    CURRENT_TIMESTAMP
FROM "likes" left_like
INNER JOIN "likes" right_like
    ON left_like."fromPetId" = right_like."toPetId"
    AND left_like."toPetId" = right_like."fromPetId"
WHERE left_like."fromPetId" < left_like."toPetId"
ON CONFLICT ("pet1Id", "pet2Id") DO NOTHING;
