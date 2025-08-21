import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced NLP Pipeline for health queries
class HealthNLP {
  private stopwords = new Set([
    'is', 'the', 'my', 'i', 'am', 'have', 'has', 'had', 'a', 'an', 'and', 'or', 
    'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
    'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
  ]);

  private synonymMap = new Map([
    // Medical condition synonyms
    ['bp', 'hypertension'],
    ['high bp', 'hypertension'],
    ['blood pressure', 'hypertension'],
    ['sugar', 'diabetes'],
    ['blood sugar', 'diabetes'],
    ['high sugar', 'diabetes'],
    ['hair fall', 'hair loss'],
    ['hair thinning', 'hair loss'],
    ['tooth pain', 'toothache'],
    ['dental pain', 'toothache'],
    ['stomach pain', 'stomach problems'],
    ['stomach ache', 'stomach problems'],
    ['digestive issues', 'stomach problems'],
    ['indigestion', 'stomach problems'],
    ['joint pain', 'arthritis'],
    ['joint inflammation', 'arthritis'],
    ['breathing problems', 'asthma'],
    ['respiratory issues', 'asthma'],
    ['liver problems', 'jaundice'],
    ['yellowish skin', 'jaundice'],
    ['urinary infection', 'uti'],
    ['bladder infection', 'uti'],
    ['period pain', 'menstrual cramps'],
    ['menstrual pain', 'menstrual cramps'],
    ['monthly pain', 'menstrual cramps'],
    ['cold', 'common cold'],
    ['cough', 'common cold'],
    ['fever', 'fever'],
    ['high temperature', 'fever'],
    ['headache', 'headache'],
    ['migraine', 'headache'],
    ['insomnia', 'sleep problems'],
    ['sleeplessness', 'sleep problems'],
    ['anxiety', 'anxiety'],
    ['stress', 'anxiety'],
    ['depression', 'depression'],
    ['sadness', 'depression']
  ]);

  private stemRules = new Map([
    ['suffering', 'suffer'],
    ['having', 'have'],
    ['feeling', 'feel'],
    ['experiencing', 'experience'],
    ['getting', 'get'],
    ['looking', 'look'],
    ['needing', 'need'],
    ['wanting', 'want'],
    ['trying', 'try']
  ]);

  tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  removeStopwords(tokens: string[]): string[] {
    return tokens.filter(token => !this.stopwords.has(token));
  }

  applySynonyms(tokens: string[]): string[] {
    const result: string[] = [];
    
    for (let i = 0; i < tokens.length; i++) {
      // Check for multi-word synonyms first
      const twoWord = tokens.slice(i, i + 2).join(' ');
      const threeWord = tokens.slice(i, i + 3).join(' ');
      
      if (this.synonymMap.has(threeWord)) {
        result.push(this.synonymMap.get(threeWord)!);
        i += 2; // Skip next 2 tokens
      } else if (this.synonymMap.has(twoWord)) {
        result.push(this.synonymMap.get(twoWord)!);
        i += 1; // Skip next token
      } else if (this.synonymMap.has(tokens[i])) {
        result.push(this.synonymMap.get(tokens[i])!);
      } else {
        result.push(tokens[i]);
      }
    }
    
    return result;
  }

  applyStemming(tokens: string[]): string[] {
    return tokens.map(token => this.stemRules.get(token) || token);
  }

  extractKeywords(query: string): string[] {
    const tokens = this.tokenize(query);
    const withoutStopwords = this.removeStopwords(tokens);
    const withSynonyms = this.applySynonyms(withoutStopwords);
    const stemmed = this.applyStemming(withSynonyms);
    
    // Remove duplicates and return
    return Array.from(new Set(stemmed));
  }

  extractHealthConditions(keywords: string[]): string[] {
    const healthTerms = [
      'diabetes', 'hypertension', 'asthma', 'arthritis', 'jaundice', 'uti',
      'menstrual cramps', 'fever', 'headache', 'toothache', 'hair loss',
      'stomach problems', 'sleep problems', 'anxiety', 'depression', 'common cold'
    ];
    
    return keywords.filter(keyword => 
      healthTerms.some(term => term.includes(keyword) || keyword.includes(term))
    );
  }
}

interface Plant {
  id: number;
  name: string;
  scientific_name?: string;
  benefits: string[];
  components: string;
  created_at: string;
  updated_at: string;
}

interface MatchResult {
  plant: Plant;
  score: number;
  matchedBenefits: string[];
  matchedTerms: string[];
}

function calculateRelevanceScore(plant: Plant, keywords: string[]): MatchResult {
  let score = 0;
  const matchedBenefits: string[] = [];
  const matchedTerms: string[] = [];

  // Check benefits (highest weight)
  if (plant.benefits && Array.isArray(plant.benefits)) {
    for (const benefit of plant.benefits) {
      const benefitLower = benefit.toLowerCase();
      for (const keyword of keywords) {
        if (benefitLower.includes(keyword)) {
          score += 10;
          if (!matchedBenefits.includes(benefit)) {
            matchedBenefits.push(benefit);
          }
          if (!matchedTerms.includes(keyword)) {
            matchedTerms.push(keyword);
          }
        }
      }
    }
  }

  // Check plant name (medium weight)
  const nameLower = plant.name.toLowerCase();
  for (const keyword of keywords) {
    if (nameLower.includes(keyword)) {
      score += 5;
      if (!matchedTerms.includes(keyword)) {
        matchedTerms.push(keyword);
      }
    }
  }

  // Check components (low weight)
  if (plant.components) {
    const componentsLower = plant.components.toLowerCase();
    for (const keyword of keywords) {
      if (componentsLower.includes(keyword)) {
        score += 2;
        if (!matchedTerms.includes(keyword)) {
          matchedTerms.push(keyword);
        }
      }
    }
  }

  return {
    plant,
    score,
    matchedBenefits: matchedBenefits.slice(0, 3), // Top 3 matching benefits
    matchedTerms
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      'https://nearpxspglupquaxxayi.supabase.co',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter "q" is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing query: ${query}`);

    // Initialize NLP processor
    const nlp = new HealthNLP();
    
    // Extract keywords using enhanced NLP pipeline
    const keywords = nlp.extractKeywords(query);
    const healthConditions = nlp.extractHealthConditions(keywords);
    
    console.log(`Extracted keywords: ${keywords.join(', ')}`);
    console.log(`Health conditions: ${healthConditions.join(', ')}`);

    // Fetch all plants from database
    const { data: plants, error } = await supabase
      .from('plants')
      .select('*');

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch plants data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!plants || plants.length === 0) {
      return new Response(
        JSON.stringify({ 
          results: [],
          searchInsights: {
            extractedKeywords: keywords,
            targetBenefits: healthConditions,
            suggestions: ['Try uploading plant data first', 'Use more specific health terms']
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate relevance scores for all plants
    const matches: MatchResult[] = plants
      .map(plant => calculateRelevanceScore(plant as Plant, keywords))
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 results

    // Generate image URLs using Unsplash
    const resultsWithImages = matches.map(match => ({
      ...match,
      plant: {
        ...match.plant,
        image_url: `https://source.unsplash.com/featured/400x300/?${encodeURIComponent(match.plant.name)},plant,herb`
      }
    }));

    // Fallback: if no strong matches, try substring matching on plant names
    if (matches.length === 0) {
      console.log('No keyword matches found, trying substring matching...');
      
      const substringMatches = plants
        .filter(plant => 
          keywords.some(keyword => 
            plant.name.toLowerCase().includes(keyword) ||
            keyword.includes(plant.name.toLowerCase())
          )
        )
        .slice(0, 5)
        .map(plant => ({
          plant: {
            ...plant as Plant,
            image_url: `https://source.unsplash.com/featured/400x300/?${encodeURIComponent(plant.name)},plant,herb`
          },
          score: 1,
          matchedBenefits: [],
          matchedTerms: keywords.filter(keyword => 
            plant.name.toLowerCase().includes(keyword) ||
            keyword.includes(plant.name.toLowerCase())
          )
        }));

      if (substringMatches.length > 0) {
        console.log(`Found ${substringMatches.length} substring matches`);
        
        return new Response(
          JSON.stringify({
            results: substringMatches,
            searchInsights: {
              extractedKeywords: keywords,
              targetBenefits: healthConditions,
              suggestions: [
                'Try more specific health terms',
                'Consider using common names for conditions',
                'Example: "diabetes", "high blood pressure", "stomach pain"'
              ]
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    console.log(`Returning ${resultsWithImages.length} matches`);

    return new Response(
      JSON.stringify({
        results: resultsWithImages,
        searchInsights: {
          extractedKeywords: keywords,
          targetBenefits: healthConditions,
          suggestions: healthConditions.length === 0 ? [
            'Try using more specific health terms',
            'Example: "diabetes", "high blood pressure", "stomach pain"'
          ] : []
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in search-remedies function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});