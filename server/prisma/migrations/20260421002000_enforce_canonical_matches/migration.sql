WITH ranked_matches AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY LEAST("pet1Id", "pet2Id"), GREATEST("pet1Id", "pet2Id")
            ORDER BY "createdAt" ASC, "id" ASC
        ) AS row_number
    FROM "matches"
)
DELETE FROM "matches"
USING ranked_matches
WHERE "matches"."id" = ranked_matches."id"
    AND ranked_matches.row_number > 1;

UPDATE "matches"
SET
    "pet1Id" = LEAST("pet1Id", "pet2Id"),
    "pet2Id" = GREATEST("pet1Id", "pet2Id")
WHERE "pet1Id" > "pet2Id";

ALTER TABLE "matches" ADD CONSTRAINT "matches_canonical_pet_order_check" CHECK ("pet1Id" < "pet2Id");
