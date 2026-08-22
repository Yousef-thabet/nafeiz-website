ALTER TABLE "contacts"
  ADD COLUMN "companyName" TEXT,
  ADD COLUMN "countryCode" TEXT,
  ADD COLUMN "dialCode" TEXT,
  ADD COLUMN "phoneNumber" TEXT,
  ADD COLUMN "visitedChina" BOOLEAN,
  ADD COLUMN "interests" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "estimatedOrderQuantity" TEXT,
  ADD COLUMN "startTimeline" TEXT,
  ADD COLUMN "productReadiness" TEXT;
