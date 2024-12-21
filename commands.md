npx tsx --tsconfig prisma/tsconfig.json prisma/populateRecipesCount.ts

npx prisma migrate dev

npx tsx scripts/updateEnumValues.ts


##WORKS FINE##
npx tsx scripts/fix-tag-slugs.ts 
All existing tags have been assigned a slug.