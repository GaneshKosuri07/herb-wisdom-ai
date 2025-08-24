import { supabase } from "@/integrations/supabase/client";

export interface Plant {
  id: string;
  name: string;
  scientific_name?: string;
  benefits: string[];
  components: string;
  usage_methods?: string[];
  precautions?: string[];
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MatchResult {
  plant: Plant;
  score: number;
  matchedBenefits: string[];
  matchedTerms: string[];
}

export interface SearchInsights {
  extractedKeywords: string[];
  targetBenefits: string[];
  suggestions: string[];
}

export interface SearchResponse {
  results: MatchResult[];
  searchInsights: SearchInsights;
}

export const searchRemedies = async (query: string): Promise<SearchResponse> => {
  try {
    console.log('Searching for:', query);
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('search-remedies', {
      body: { q: query }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }

    return data as SearchResponse;
  } catch (error) {
    console.error('Search service error:', error);
    throw error;
  }
};
