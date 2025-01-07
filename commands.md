npx tsx --tsconfig prisma/tsconfig.json prisma/populateRecipesCount.ts

npx prisma migrate dev

npx tsx scripts/updateEnumValues.ts

npx tsx scripts/populateRecipesCount.ts
npx tsx scripts/count-users-recipe.ts

npx tsx scripts/flushRecipeCounters.ts
##WORKS FINE##
npx tsx scripts/fix-tag-slugs.ts
All existing tags have been assigned a slug.

ignore this:

npx tsx scripts/incrementViews.ts
