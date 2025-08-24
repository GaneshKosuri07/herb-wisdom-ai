import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Sparkles, AlertTriangle } from "lucide-react";

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  hasDatabase?: boolean;
}

export const SearchForm = ({ onSearch, isLoading, hasDatabase = true }: SearchFormProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && hasDatabase) {
      onSearch(query.trim());
    }
  };

  const examples = [
    "My grandmother is suffering from diabetes",
    "I have trouble sleeping and anxiety",
    "Looking for natural pain relief for arthritis",
    "Digestive issues and stomach problems",
    "Need help with high blood pressure"
  ];

  return (
    <Card className="shadow-medium border-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Search className="w-5 h-5" />
          Find Plant Remedies
        </CardTitle>
        <CardDescription>
          Describe your health concerns in natural language and we'll find matching plant remedies.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="health-query" className="text-sm font-medium">
              Describe your health concern
            </Label>
            <Textarea
              id="health-query"
              placeholder="e.g., My grandmother is suffering from diabetes and needs natural support..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={!hasDatabase}
            />
          </div>

          {!hasDatabase && (
            <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm text-warning-foreground">
                Please upload a plant database first to enable searching.
              </span>
            </div>
          )}

          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full"
            disabled={!query.trim() || !hasDatabase || isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Searching...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Find Remedies
              </>
            )}
          </Button>
        </form>

        <div className="mt-6">
          <Label className="text-sm font-medium text-muted-foreground">
            Example queries:
          </Label>
          <div className="mt-2 space-y-2">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setQuery(example)}
                className="block w-full text-left text-sm text-muted-foreground hover:text-primary transition-smooth p-2 rounded hover:bg-secondary/50"
                disabled={!hasDatabase}
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};