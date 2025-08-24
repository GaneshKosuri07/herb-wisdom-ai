import { useState, useEffect } from "react";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "@/components/SearchResults";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { searchRemedies, type MatchResult, type SearchInsights } from "@/services/plantService";
import { Leaf, Heart, Sparkles, Database, Search, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-plants.jpg";

// Types moved to plantService.ts

const Index = () => {
  const [searchResults, setSearchResults] = useState<MatchResult[]>([]);
  const [searchInsights, setSearchInsights] = useState<SearchInsights | undefined>();
  const [currentQuery, setCurrentQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setCurrentQuery(query);
    
    try {
      const response = await searchRemedies(query);
      setSearchResults(response.results);
      setSearchInsights(response.searchInsights);
      
      if (response.results.length === 0) {
        toast({
          title: "No matches found",
          description: "Try using more specific health terms or upload plant data.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${response.results.length} matching remedies.`,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Please try again or check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Leaf className="w-8 h-8 text-accent" />
              <h1 className="text-4xl lg:text-6xl font-serif font-bold">
                Plant Remedy Finder
              </h1>
              <Heart className="w-8 h-8 text-accent" />
            </div>
            
            <p className="text-xl lg:text-2xl mb-8 text-primary-foreground/90 leading-relaxed">
              Discover natural plant-based remedies for your health concerns using AI-powered matching
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Natural Language Processing</span>
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full">
                <Leaf className="w-4 h-4 text-accent" />
                <span>Traditional Medicine Database</span>
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full">
                <Heart className="w-4 h-4 text-accent" />
                <span>Personalized Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Search Form */}
          <SearchForm 
            onSearch={handleSearch}
            isLoading={isSearching}
          />
          
          {/* Search Results */}
          {(currentQuery || searchResults.length > 0) && (
            <SearchResults 
              results={searchResults}
              query={currentQuery}
              searchInsights={searchInsights}
            />
          )}
          
          {/* App Info */}
          {!currentQuery && (
            <Card className="shadow-medium border-secondary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Search className="w-5 h-5" />
                  How It Works
                </CardTitle>
                <CardDescription>
                  Advanced NLP processes your queries to find the best plant remedies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-accent">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Tokenization & Normalization</h4>
                    <p className="text-xs text-muted-foreground">Breaks down your query into meaningful words</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-accent">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Synonym Mapping</h4>
                    <p className="text-xs text-muted-foreground">Maps terms like "BP" to "hypertension"</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-accent">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Smart Matching</h4>
                    <p className="text-xs text-muted-foreground">Finds relevant plants based on benefits & components</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <div className="mt-12 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2 text-warning-foreground">
              <Shield className="w-4 h-4" />
              <p className="text-sm font-medium">Educational purposes only. Not medical advice.</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Always consult with healthcare professionals before using herbal remedies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
