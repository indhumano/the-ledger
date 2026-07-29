// prisma/seed.ts
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; // reuse the already-configured client

async function main() {
    const users = [
        { username: "you", password: "replace-with-real-password", displayName: "You" },
        { username: "husband", password: "replace-with-real-password", displayName: "Husband" },
    ];

    for (const u of users) {
        //const passwordHash = await bcrypt.hash(u.password, 10);
        //await prisma.user.upsert({
        //    where: { username: u.username },
        //    update: { passwordHash, displayName: u.displayName },
        //    create: { username: u.username, passwordHash, displayName: u.displayName },
        //});

        await prisma.user.upsert({
            where: { username: u.username },
            update: {
                passwordHash: u.password,
                displayName: u.displayName,
            },
            create: {
                username: u.username,
                passwordHash: u.password,
                displayName: u.displayName,
            },
        });
    }
}

main()
    .then(() => console.log("Seeded users"))
    .finally(() => prisma.$disconnect());