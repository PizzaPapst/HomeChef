
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const recipes = await prisma.recipe.findMany({
        select: { id: true, title: true }
    });
    console.log('Recipes in DB:', JSON.stringify(recipes, null, 2));
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
