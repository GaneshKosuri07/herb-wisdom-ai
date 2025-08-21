import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlantCard } from "./PlantCard";
import { Search, Lightbulb, Target } from "lucide-react";

import { type Plant, type MatchResult } from "@/services/plantService";

interface SearchResultsProps {
  results: MatchResult[];
  query: string;
  searchInsights?: {
    extractedKeywords: string[];
    targetBenefits: string[];
    suggestions: string[];
  };
}

export const SearchResults = ({ results, query, searchInsights }: SearchResultsProps) => {
  if (!query) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <Card className="shadow-medium border-secondary/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Search className="w-5 h-5" />
            Search Results
          </CardTitle>
          <CardDescription>
            Found {results.length} matching plant{results.length !== 1 ? 's' : ''} for: "{query}"
          </CardDescription>
        </CardHeader>
        
        {searchInsights && (
          <CardContent className="space-y-3">
            {searchInsights.extractedKeywords.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                  <Target className="w-4 h-4 text-primary" />
                  Detected Keywords
                </h4>
                <div className="flex flex-wrap gap-1">
                  {searchInsights.extractedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {searchInsights.targetBenefits.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  Searching For
                </h4>
                <div className="flex flex-wrap gap-1">
                  {searchInsights.targetBenefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Results */}
      {results.length === 0 ? (
        <Card className="shadow-medium border-secondary/50">
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground space-y-2">
              <Search className="w-12 h-12 mx-auto opacity-50" />
              <h3 className="text-lg font-semibold">No matches found</h3>
              <p className="text-sm">
                Try rephrasing your query or using different keywords related to your health concern.
              </p>
              {searchInsights && searchInsights.suggestions.length > 0 && (
                <div className="mt-4 text-left max-w-md mx-auto">
                  <h4 className="text-sm font-semibold mb-2">Suggestions:</h4>
                  <ul className="text-xs space-y-1">
                    {searchInsights.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-accent">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <div key={result.plant.id} className="relative">
              <PlantCard 
                plant={result.plant} 
                matchedBenefits={result.matchedBenefits}
              />
              {result.score > 15 && (
                <div className="absolute -top-2 -right-2 bg-success text-success-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-accent">
                  High Match
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <Card className="shadow-soft border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <div className="text-warning text-lg">⚠️</div>
              <div className="text-sm text-warning-foreground">
                <p className="font-semibold mb-1">Important Disclaimer</p>
                <p className="text-xs leading-relaxed">
                  This tool provides information about traditional plant uses and is not a substitute for professional medical advice. 
                  Always consult with a healthcare provider before using any herbal remedies, especially if you have existing health conditions, 
                  take medications, or are pregnant or nursing. Some plants may interact with medications or cause allergic reactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};