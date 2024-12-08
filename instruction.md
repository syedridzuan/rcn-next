Project: Recipe Web Application (Next.js)

Context:
Building a modern recipe web application using Next.js 15, TypeScript, and Prisma. The app allows users to view, create, and interact with recipes through comments. The application features structured recipe data with support for grouped sections (e.g., separate ingredients for main dish and sauce).

Tech Stack & Versions:
- Next.js 15.0.3
- TypeScript
- NextAuth.js v5 beta (5.0.0-beta.25)
- Prisma v6.0.0 with SQLite
- Tailwind CSS
- shadcn/ui components

Database Schema Overview:
- Users (authentication and roles)
- Recipes (with slugs for SEO-friendly URLs)
- Categories
- Recipe Sections (ingredients and instructions, supporting grouped content)
- Comments

Current Features:
1. Recipe Detail Page with:
   - SEO optimized metadata
   - OpenGraph tags
   - Schema.org markup
   - Responsive design
   - Print functionality
   - Comment system with optimistic updates
   - Structured recipe sections (grouped ingredients and instructions)
   - Recipe meta information (prep time, cook time, servings)

2. Comment System:
   - Rate limiting
   - Input validation
   - Error handling
   - Authentication integration

Recent Implementation:
- SEO-friendly URL slugs for recipes
- Full recipe detail page with structured sections
- Enhanced recipe organization with grouped ingredients sections
- Recipe meta cards for cooking information
- Comment functionality with real-time updates
- Database seeding with sample data

Key Files Location:
- Recipe Detail Page: app/recipes/[slug]/page.tsx
- Recipe Sections: app/recipes/[slug]/recipe-sections.tsx
- Recipe Meta Cards: app/recipes/[slug]/recipe-meta-cards.tsx
- Comment Form: app/recipes/[slug]/comment-form.tsx
- Comments API: app/api/comments/route.ts
- Database Schema: prisma/schema.prisma
- Seed File: prisma/seed.ts

Component Structure:
- RecipePage (main container)
  ├── RecipeMetaCards (cooking times and servings)
  ├── RecipeSections (grouped ingredients and instructions)
  ├── PrintButton (print functionality)
  └── CommentsWrapper (comment system)


  // This is your Prisma schema file
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// User model with role-based access
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  image         String?
  role          String    @default("USER") // Changed from enum to string
  recipes       Recipe[]
  comments      Comment[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Category model for recipe organization
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  image       String?
  recipes     Recipe[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Main Recipe model
model Recipe {
  id            String          @id @default(cuid())
  title         String
  slug          String   @unique
  description   String?
  language      String          // "en" or "ms"
  cookTime      Int
  prepTime      Int
  servings      Int
  difficulty    String          @default("EASY") // Changed from enum to string
  image         String?
  categoryId    String
  category      Category        @relation(fields: [categoryId], references: [id])
  userId        String
  user          User            @relation(fields: [userId], references: [id])
  sections      RecipeSection[]
  comments      Comment[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

// Recipe Section model for nested ingredients and instructions
model RecipeSection {
  id        String       @id @default(cuid())
  title     String       // e.g., "For the Pancakes", "For the Sauce"
  type      String       // Changed from enum to string: "INGREDIENTS" or "INSTRUCTIONS"
  recipeId  String
  recipe    Recipe       @relation(fields: [recipeId], references: [id])
  items     RecipeItem[]
}

// Recipe Item model for individual ingredients or instruction steps
model RecipeItem {
  id          String        @id @default(cuid())
  content     String        // The ingredient or instruction step
  sectionId   String
  section     RecipeSection @relation(fields: [sectionId], references: [id])
}

// Comment model for recipe discussions
model Comment {
  id        String   @id @default(cuid())
  content   String
  recipeId  String
  recipe    Recipe   @relation(fields: [recipeId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

##Recipe Search Feature Implementation

## Core Requirements

1. Search Interface:
- Implement a global search bar in the header
- Add advanced search filters for:
  - Categories
  - Difficulty levels
  - Cook time ranges
  - Language (en/ms)
- Support instant search with debouncing
- Add search suggestions/autocomplete

## Technical Implementation Details

### 1. Database Query (Prisma)
```typescript
// Add this to prisma/schema.prisma
model Recipe {
  // ... existing fields ...
  
  @@fulltext([title, description]) // Add fulltext search capability
}

// Search query in lib/db/queries.ts
export async function searchRecipes({
  query,
  category,
  difficulty,
  maxCookTime,
  language,
  limit = 10,
  cursor,
}: SearchParams) {
  return await prisma.recipe.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
      AND: [
        category ? { categoryId: category } : {},
        difficulty ? { difficulty } : {},
        maxCookTime ? { cookTime: { lte: maxCookTime } } : {},
        language ? { language } : {},
      ],
    },
    include: {
      category: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: {
      createdAt: 'desc',
    },
  });
}
2. API Route
typescriptCopy// app/api/search/route.ts
import { searchRecipes } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');
  const maxCookTime = searchParams.get('maxCookTime');
  const language = searchParams.get('language');
  const cursor = searchParams.get('cursor');
  const limit = 10;

  const recipes = await searchRecipes({
    query,
    category,
    difficulty,
    maxCookTime: maxCookTime ? parseInt(maxCookTime) : undefined,
    language,
    limit,
    cursor,
  });

  // Handle pagination
  const hasMore = recipes.length > limit;
  const nextCursor = hasMore ? recipes[limit - 1].id : undefined;
  
  return Response.json({
    items: recipes.slice(0, limit),
    nextCursor,
    hasMore,
  });
}
3. Search Components
Search Bar Component
typescriptCopy// components/search/search-bar.tsx
import { useCombobox } from 'downshift';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchIcon } from 'lucide-react';

export function SearchBar() {
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, 300);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (debouncedValue) {
      // Fetch suggestions
      fetch(`/api/search/suggestions?q=${debouncedValue}`)
        .then(res => res.json())
        .then(data => setSuggestions(data));
    }
  }, [debouncedValue]);

  return (
    <div className="relative w-full max-w-lg">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search recipes..."
        className="pl-10"
      />
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      {/* Suggestions dropdown */}
    </div>
  );
}
Search Results Page
typescriptCopy// app/search/page.tsx
import { Suspense } from 'react';
import { SearchFilters } from './search-filters';
import { SearchResults } from './search-results';
import { LoadingResults } from './loading-results';

export default function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <SearchFilters />
        </aside>
        
        <main className="md:col-span-3">
          <Suspense fallback={<LoadingResults />}>
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
4. Search Filters Component
typescriptCopy// components/search/search-filters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SearchFilters() {
  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select>
            {/* Category options */}
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulty</label>
          <Select>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HARD">Hard</SelectItem>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Max Cook Time</label>
          <Slider
            min={0}
            max={180}
            step={15}
            defaultValue={[60]}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Language</label>
          <Select>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ms">Malay</SelectItem>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
5. Infinite Loading Results
typescriptCopy// components/search/search-results.tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { RecipeCard } from '@/components/recipe-card';

export function SearchResults() {
  const { ref, inView } = useInView();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['search', searchParams],
    queryFn: fetchSearchPage,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.pages.map((page) =>
          page.items.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        )}
      </div>
      
      {isFetchingNextPage && <LoadingSpinner />}
      
      <div ref={ref} className="h-10" />
    </div>
  );
}
Additional Features

Recent Searches:

typescriptCopy// hooks/use-recent-searches.ts
export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setSearches(JSON.parse(saved));
    }
  }, []);
  
  const addSearch = (search: string) => {
    const updated = [search, ...searches.filter(s => s !== search)].slice(0, 5);
    setSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };
  
  return { searches, addSearch };
}

Search Analytics:

typescriptCopy// lib/analytics.ts
export async function trackSearch(searchData: SearchAnalyticsData) {
  await prisma.searchAnalytics.create({
    data: {
      query: searchData.query,
      filters: searchData.filters,
      resultCount: searchData.resultCount,
      userId: searchData.userId,
    },
  });
}
Required Updates

Add new schema for search analytics:

prismaCopymodel SearchAnalytics {
  id          String   @id @default(cuid())
  query       String
  filters     Json?
  resultCount Int
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}

Update navigation to include search:

typescriptCopy// components/layout/header.tsx
<header>
  <nav>
    {/* ... */}
    <SearchBar />
    {/* ... */}
  </nav>
</header>
This implementation provides:

Real-time search with debouncing
Advanced filtering options
Infinite scroll pagination
Search suggestions/autocomplete
Recent searches tracking
Search analytics
Mobile-responsive design
Accessibility support





## Recipe CRUD structure focusing on just the essential operations.
Core Structure
Copyapp/
├── dashboard/
│   └── recipes/
│       ├── page.tsx             # List recipes
│       ├── actions.ts           # Server actions
│       ├── new/
│       │   └── page.tsx        # Create recipe
│       └── [id]/
│           ├── edit/
│           │   └── page.tsx    # Edit recipe
│           └── page.tsx        # View recipe details
Basic CRUD Operations

List Recipes (app/dashboard/recipes/page.tsx):


Display recipes in a table
Basic sorting
Simple search
Delete action
Links to create/edit


Create Recipe (app/dashboard/recipes/new/page.tsx):


Basic form with:

Title
Description
Cook time
Prep time
Servings
Difficulty
Ingredients sections
Instructions sections




Edit Recipe (app/dashboard/recipes/[id]/edit/page.tsx):


Same form as create
Pre-populated with recipe data
Update functionality


View Recipe (app/dashboard/recipes/[id]/page.tsx):


Recipe details
Edit button
Delete button
Back to list button

Server Actions (app/dashboard/recipes/actions.ts):
typescriptCopy'use server'

// Create recipe
export async function createRecipe(data: RecipeFormData) {
  // Validate and save recipe
}

// Update recipe
export async function updateRecipe(id: string, data: RecipeFormData) {
  // Validate and update recipe
}

// Delete recipe
export async function deleteRecipe(id: string) {
  // Delete recipe
}
Database Queries (lib/db/queries/recipes.ts):
typescriptCopy// Get all recipes
export async function getRecipes() {
  return await prisma.recipe.findMany({
    include: {
      sections: {
        include: {
          items: true,
        },
      },
    },
  });
}

// Get single recipe
export async function getRecipe(id: string) {
  return await prisma.recipe.findUnique({
    where: { id },
    include: {
      sections: {
        include: {
          items: true,
        },
      },
    },
  });
}
Key Features:

Basic form validation
Error handling
Success messages
Loading states
Simple authorization
Optimistic updates