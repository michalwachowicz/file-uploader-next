import { PrismaClient } from "@prisma/client";

// Prisma 7: PrismaClient reads the connection URL from prisma.config.ts
// No need to pass adapter/url here when using the standard Rust engine
// For driver adapters (no-rust-engine), see: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/no-rust-engine
export const prisma = new PrismaClient();
