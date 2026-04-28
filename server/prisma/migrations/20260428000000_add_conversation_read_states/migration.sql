-- CreateTable
CREATE TABLE "conversation_read_states" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "lastReadMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_read_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_read_states_conversationId_userId_key" ON "conversation_read_states"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "conversation_read_states_userId_idx" ON "conversation_read_states"("userId");

-- CreateIndex
CREATE INDEX "conversation_read_states_conversationId_userId_idx" ON "conversation_read_states"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "messages_conversationId_senderUserId_createdAt_idx" ON "messages"("conversationId", "senderUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "conversation_read_states" ADD CONSTRAINT "conversation_read_states_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_read_states" ADD CONSTRAINT "conversation_read_states_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
