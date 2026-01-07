-- CreateTable
CREATE TABLE "pending_invites" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "invited_by" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_invites_token_key" ON "pending_invites"("token");

-- CreateIndex
CREATE INDEX "pending_invites_email_idx" ON "pending_invites"("email");

-- CreateIndex
CREATE INDEX "pending_invites_application_id_idx" ON "pending_invites"("application_id");

-- CreateIndex
CREATE INDEX "pending_invites_token_idx" ON "pending_invites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "pending_invites_email_application_id_key" ON "pending_invites"("email", "application_id");

-- AddForeignKey
ALTER TABLE "pending_invites" ADD CONSTRAINT "pending_invites_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "application_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
