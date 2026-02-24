-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN DEFAULT false,
    "uuid" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "default_page_uuid" TEXT,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL,
    "permission_type" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "allowed" JSONB NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ownership" (
    "id" SERIAL NOT NULL,
    "owner_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,

    CONSTRAINT "ownership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "components" (
    "id" SERIAL NOT NULL,
    "component" JSONB NOT NULL,
    "user_id" TEXT NOT NULL DEFAULT '',
    "uuid" TEXT NOT NULL,
    "application_id" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "component_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "need_authentication" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "databaseproviders" (
    "provider_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL DEFAULT '',
    "host" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL DEFAULT '',
    "port" INTEGER NOT NULL DEFAULT 0,
    "databasename" TEXT NOT NULL DEFAULT '',
    "provider_type" TEXT NOT NULL DEFAULT '',
    "component_ids" JSONB NOT NULL DEFAULT '[]',
    "user_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "databaseproviders_pkey" PRIMARY KEY ("provider_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "applications_uuid_key" ON "applications"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "components_uuid_key" ON "components"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "pages_uuid_key" ON "pages"("uuid");
