// app/(main)/(ads-enabled)/resepi/[slug]/recipe-meta-cards.tsx

import { Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ServingType } from "@prisma/client";

interface RecipeMetaCardsProps {
  prepTime: number | null;
  prepTimeText?: string;
  cookTime: number | null;
  cookTimeText?: string;
  totalTime: number | null;
  totalTimeText?: string; // ← Possibly containing text like "Overnight + 30 min"
  servings: number | null;
  servingType?: ServingType;
}

// Simple numeric-to-text converter for minutes → "X jam Y minit"
function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minit`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) {
    return `${hours} jam`;
  }
  return `${hours} jam ${remaining} minit`;
}

export function RecipeMetaCards({
  prepTime,
  prepTimeText,
  cookTime,
  cookTimeText,
  totalTime,
  totalTimeText,
  servings,
  servingType = "PEOPLE",
}: RecipeMetaCardsProps) {
  // ----- Prep Time -----
  let displayPrep = "N/A";
  if (prepTimeText && prepTimeText.trim() !== "") {
    displayPrep = prepTimeText;
  } else if (prepTime !== null && prepTime > 0) {
    displayPrep = formatTime(prepTime);
  }

  // ----- Cook Time -----
  let displayCook = "N/A";
  if (cookTimeText && cookTimeText.trim() !== "") {
    displayCook = cookTimeText;
  } else if (cookTime !== null && cookTime > 0) {
    displayCook = formatTime(cookTime);
  }

  // ----- Total Time -----
  let displayTotal = "N/A";
  if (totalTimeText && totalTimeText.trim() !== "") {
    displayTotal = totalTimeText;
  } else if (typeof totalTime === "number" && totalTime > 0) {
    displayTotal = formatTime(totalTime);
  }

  // ----- Servings -----
  const displayServings = servings && servings > 0 ? servings : "?";
  let displayServingType = "orang"; // default Malay label

  switch (servingType) {
    case "PIECES":
      displayServingType = "keping";
      break;
    case "SLICES":
      displayServingType = "slices";
      break;
    case "BOWLS":
      displayServingType = "mangkuk";
      break;
    case "GLASSES":
      displayServingType = "gelas";
      break;
    case "PORTIONS":
      displayServingType = "bahagian";
      break;
    case "PEOPLE":
    default:
      displayServingType = "orang";
      break;
  }

  return (
    <>
      {/* Prep Time */}
      <Card className="recipe-card">
        <CardContent className="flex items-center gap-3 p-4">
          <Clock className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-500">Masa Penyediaan</p>
            <p className="font-semibold">{displayPrep}</p>
          </div>
        </CardContent>
      </Card>

      {/* Cook Time */}
      <Card className="recipe-card">
        <CardContent className="flex items-center gap-3 p-4">
          <Clock className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-500">Masa Memasak</p>
            <p className="font-semibold">{displayCook}</p>
          </div>
        </CardContent>
      </Card>

      {/* Total Time */}
      <Card className="recipe-card">
        <CardContent className="flex items-center gap-3 p-4">
          <Clock className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-500">Jumlah Masa</p>
            <p className="font-semibold">{displayTotal}</p>
          </div>
        </CardContent>
      </Card>

      {/* Servings */}
      <Card className="recipe-card">
        <CardContent className="flex items-center gap-3 p-4">
          <Users className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-500">Hidangan</p>
            <p className="font-semibold">
              {displayServings} {displayServingType}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
