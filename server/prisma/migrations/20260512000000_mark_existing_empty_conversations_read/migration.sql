-- Existing empty conversations predate the new-match indicator. Mark only
-- message-less conversations as seen for both matched pet owners so deploying
-- notifications does not turn historical matches into new notifications.
INSERT INTO "conversation_read_states" (
    "id",
    "conversationId",
    "userId",
    "lastReadAt",
    "lastReadMessageId",
    "createdAt",
    "updatedAt"
)
SELECT
    'crs_' || md5(conversations."id" || ':' || owners."userId"),
    conversations."id",
    owners."userId",
    conversations."createdAt",
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "conversations" AS conversations
JOIN "matches" AS matches ON matches."id" = conversations."matchId"
JOIN "Pet" AS pet1 ON pet1."id" = matches."pet1Id"
JOIN "Pet" AS pet2 ON pet2."id" = matches."pet2Id"
CROSS JOIN LATERAL (
    VALUES
        (pet1."ownerId"),
        (pet2."ownerId")
) AS owners("userId")
WHERE NOT EXISTS (
    SELECT 1
    FROM "messages" AS messages
    WHERE messages."conversationId" = conversations."id"
)
AND NOT EXISTS (
    SELECT 1
    FROM "conversation_read_states" AS read_states
    WHERE read_states."conversationId" = conversations."id"
      AND read_states."userId" = owners."userId"
)
ON CONFLICT ("conversationId", "userId") DO NOTHING;
