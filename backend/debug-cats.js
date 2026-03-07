const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const recipes = await prisma.recipe.findMany({
        include: { categories: true }
    });

    console.log('Recipes with categories:');
    recipes.forEach(r => {
        console.log(`- ${r.id}: ${r.title} (prepTime: ${r.prepTime}) -> [${r.categories.map(c => c.name).join(', ')}]`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
