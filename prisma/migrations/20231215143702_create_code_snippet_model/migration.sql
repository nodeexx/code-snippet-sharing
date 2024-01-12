-- CreateTable
CREATE TABLE "code_snippets" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_snippets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "code_snippets_user_id_idx" ON "code_snippets"("user_id");

-- AddForeignKey
ALTER TABLE "code_snippets" ADD CONSTRAINT "code_snippets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
