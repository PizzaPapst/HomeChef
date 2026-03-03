const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncCategories(recipe) {
    const targetCategories = [];

    // "Schnell" logic
    if (recipe.prepTime && recipe.prepTime <= 30) {
        targetCategories.push('Schnell');
    }

    // Future Logic placeholders
    // if (recipe.isVegetarian) targetCategories.push('Vegetarisch');

    if (targetCategories.length === 0) {
        // Clear categories if none apply (optional, but consistent with RecipesService)
        await prisma.recipe.update({
            where: { id: recipe.id },
            data: { categories: { set: [] } }
        });
        return;
    }

    await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
            categories: {
                set: [], // Clear old
                connectOrCreate: targetCategories.map((name) => ({
                    where: { name },
                    create: { name },
                })),
            },
        },
    });
    console.log(`Synced recipe "${recipe.title}" (ID: ${recipe.id}) with: ${targetCategories.join(', ')}`);
}

async function main() {
    const recipes = await prisma.recipe.findMany();
    console.log(`Found ${recipes.length} recipes to sync.`);

    for (const recipe of recipes) {
        await syncCategories(recipe);
    }

    console.log('Sync completed.');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
