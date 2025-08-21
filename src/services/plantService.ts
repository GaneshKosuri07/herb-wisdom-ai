import { supabase } from "@/integrations/supabase/client";

export interface Plant {
  id: number;
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

export const uploadPlantsData = async (plantsData: any[]): Promise<void> => {
  try {
    // Transform the data to match our schema
    const transformedData = plantsData.map(plant => ({
      name: plant.name || plant.plantName,
      scientific_name: plant.scientificName || plant.scientific_name,
      benefits: Array.isArray(plant.benefits) ? plant.benefits : [plant.benefits].filter(Boolean),
      components: Array.isArray(plant.components) ? plant.components.join(', ') : plant.components || '',
      usage_methods: Array.isArray(plant.usageMethods) ? plant.usageMethods : 
                     Array.isArray(plant.usage_methods) ? plant.usage_methods : [],
      precautions: Array.isArray(plant.precautions) ? plant.precautions : [],
      description: plant.description || '',
      image_url: plant.imageUrl || plant.image_url
    }));

    // Insert data into Supabase
    const { error } = await supabase
      .from('plants')
      .insert(transformedData);

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload plants data: ${error.message}`);
    }

    console.log(`Successfully uploaded ${transformedData.length} plants`);
  } catch (error) {
    console.error('Upload service error:', error);
    throw error;
  }
};

export const getPlantsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('plants')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Count error:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Count service error:', error);
    return 0;
  }
};