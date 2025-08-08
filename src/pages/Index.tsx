import { useState, useEffect } from "react";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "@/components/SearchResults";
import { findMatchingPlants, getSearchInsights } from "@/utils/nlpMatcher";
import { Leaf, Heart, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-plants.jpg";

interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  benefits: string[];
  components: string[];
  description?: string;
  usageMethods?: string[];
  precautions?: string[];
}

interface MatchResult {
  plant: Plant;
  score: number;
  matchedBenefits: string[];
  matchedTerms: string[];
}

const Index = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [searchResults, setSearchResults] = useState<MatchResult[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Load sample plant data on component mount
  useEffect(() => {
    import("@/data/samplePlants").then(({ samplePlants }) => {
      setPlants(samplePlants);
    });
  }, []);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setCurrentQuery(query);
    
    // Simulate API delay for better UX
    setTimeout(() => {
      const results = findMatchingPlants(query, plants);
      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };

  const searchInsights = currentQuery ? getSearchInsights(currentQuery) : undefined;

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
            hasDatabase={true}
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
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <div className="text-center p-6 bg-card rounded-lg shadow-soft border border-secondary/50">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2">Describe Your Health Concern</h3>
                <p className="text-sm text-muted-foreground">
                  Simply describe your symptoms or health concerns in natural language, and our AI will find matching plant remedies.
                </p>
              </div>
              
              <div className="text-center p-6 bg-card rounded-lg shadow-soft border border-secondary/50">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2">Get Plant Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Receive personalized plant recommendations with images, detailed benefits, active components, and usage instructions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
