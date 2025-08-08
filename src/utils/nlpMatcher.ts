// Simple NLP matching utility for plant remedies
// This provides basic keyword matching and can be enhanced with more sophisticated NLP

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

// Common health condition mappings to plant benefits
const healthConditionMap: { [key: string]: string[] } = {
  // Diabetes and blood sugar
  'diabetes': ['blood sugar control', 'glucose regulation', 'insulin support', 'metabolic health'],
  'blood sugar': ['blood sugar control', 'glucose regulation', 'diabetes support'],
  'glucose': ['glucose regulation', 'blood sugar control', 'insulin support'],
  
  // Pain and inflammation
  'pain': ['pain relief', 'anti-inflammatory', 'analgesic', 'muscle pain'],
  'arthritis': ['anti-inflammatory', 'joint health', 'pain relief', 'mobility'],
  'inflammation': ['anti-inflammatory', 'pain relief', 'swelling reduction'],
  'joint': ['joint health', 'anti-inflammatory', 'mobility', 'arthritis'],
  
  // Digestive issues
  'stomach': ['digestive health', 'stomach comfort', 'nausea relief', 'indigestion'],
  'digestive': ['digestive health', 'stomach comfort', 'gut health', 'bloating'],
  'nausea': ['nausea relief', 'stomach comfort', 'digestive aid'],
  'bloating': ['digestive health', 'gas relief', 'stomach comfort'],
  
  // Sleep and anxiety
  'sleep': ['sleep aid', 'relaxation', 'insomnia', 'calming'],
  'insomnia': ['sleep aid', 'relaxation', 'calming', 'nervous system'],
  'anxiety': ['calming', 'stress relief', 'relaxation', 'nervous system'],
  'stress': ['stress relief', 'calming', 'adaptogenic', 'relaxation'],
  
  // Heart and circulation
  'blood pressure': ['cardiovascular health', 'circulation', 'heart health', 'hypertension'],
  'heart': ['cardiovascular health', 'heart health', 'circulation'],
  'circulation': ['circulation', 'cardiovascular health', 'blood flow'],
  
  // Immune system
  'immune': ['immune support', 'immunity', 'antioxidant', 'immune boost'],
  'cold': ['immune support', 'respiratory health', 'antiviral', 'cold relief'],
  'flu': ['immune support', 'antiviral', 'fever reduction', 'respiratory health'],
  
  // Skin conditions
  'skin': ['skin health', 'topical healing', 'wound healing', 'skin conditions'],
  'wound': ['wound healing', 'topical healing', 'antiseptic', 'skin repair'],
  'burn': ['burns relief', 'skin healing', 'cooling', 'topical healing'],
  
  // General terms
  'elderly': ['circulation', 'joint health', 'immune support', 'energy', 'memory'],
  'grandmother': ['circulation', 'joint health', 'immune support', 'energy'],
  'grandfather': ['circulation', 'joint health', 'immune support', 'energy'],
};

// Normalize text for better matching
const normalizeText = (text: string): string => {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Extract keywords from user query
const extractKeywords = (query: string): string[] => {
  const normalized = normalizeText(query);
  const words = normalized.split(' ');
  
  // Extract relevant health-related keywords
  const keywords: string[] = [];
  
  // Direct keyword matches
  Object.keys(healthConditionMap).forEach(condition => {
    if (normalized.includes(condition)) {
      keywords.push(condition);
    }
  });
  
  // Also extract individual meaningful words
  const meaningfulWords = words.filter(word => 
    word.length > 3 && 
    !['with', 'from', 'have', 'need', 'help', 'suffer', 'problem'].includes(word)
  );
  
  return [...new Set([...keywords, ...meaningfulWords])];
};

// Get benefits associated with keywords
const getBenefitsFromKeywords = (keywords: string[]): string[] => {
  const benefits: string[] = [];
  
  keywords.forEach(keyword => {
    if (healthConditionMap[keyword]) {
      benefits.push(...healthConditionMap[keyword]);
    }
  });
  
  return [...new Set(benefits)];
};

// Calculate match score between query and plant
const calculateMatchScore = (
  plant: Plant, 
  targetBenefits: string[], 
  keywords: string[]
): { score: number; matchedBenefits: string[]; matchedTerms: string[] } => {
  let score = 0;
  const matchedBenefits: string[] = [];
  const matchedTerms: string[] = [];
  
  // Check benefit matches (high weight)
  plant.benefits.forEach(benefit => {
    const normalizedBenefit = normalizeText(benefit);
    
    targetBenefits.forEach(targetBenefit => {
      const normalizedTarget = normalizeText(targetBenefit);
      if (normalizedBenefit.includes(normalizedTarget) || normalizedTarget.includes(normalizedBenefit)) {
        score += 10;
        matchedBenefits.push(benefit);
        matchedTerms.push(targetBenefit);
      }
    });
    
    // Keyword matches in benefits
    keywords.forEach(keyword => {
      if (normalizedBenefit.includes(keyword)) {
        score += 5;
        if (!matchedBenefits.includes(benefit)) {
          matchedBenefits.push(benefit);
        }
        if (!matchedTerms.includes(keyword)) {
          matchedTerms.push(keyword);
        }
      }
    });
  });
  
  // Check name and description matches (medium weight)
  const plantText = normalizeText(`${plant.name} ${plant.scientificName || ''} ${plant.description || ''}`);
  keywords.forEach(keyword => {
    if (plantText.includes(keyword)) {
      score += 3;
      if (!matchedTerms.includes(keyword)) {
        matchedTerms.push(keyword);
      }
    }
  });
  
  // Check component matches (low weight)
  plant.components.forEach(component => {
    const normalizedComponent = normalizeText(component);
    keywords.forEach(keyword => {
      if (normalizedComponent.includes(keyword)) {
        score += 1;
        if (!matchedTerms.includes(keyword)) {
          matchedTerms.push(keyword);
        }
      }
    });
  });
  
  return { score, matchedBenefits: [...new Set(matchedBenefits)], matchedTerms: [...new Set(matchedTerms)] };
};

// Main matching function
export const findMatchingPlants = (query: string, plants: Plant[]): MatchResult[] => {
  if (!query.trim() || plants.length === 0) {
    return [];
  }
  
  const keywords = extractKeywords(query);
  const targetBenefits = getBenefitsFromKeywords(keywords);
  
  const results: MatchResult[] = [];
  
  plants.forEach(plant => {
    const { score, matchedBenefits, matchedTerms } = calculateMatchScore(plant, targetBenefits, keywords);
    
    if (score > 0) {
      results.push({
        plant,
        score,
        matchedBenefits,
        matchedTerms
      });
    }
  });
  
  // Sort by score (descending) and return top matches
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Return top 10 matches
};

// Helper function to get search insights
export const getSearchInsights = (query: string): {
  extractedKeywords: string[];
  targetBenefits: string[];
  suggestions: string[];
} => {
  const keywords = extractKeywords(query);
  const targetBenefits = getBenefitsFromKeywords(keywords);
  
  const suggestions = [
    "Try being more specific about symptoms",
    "Include the affected body part or system",
    "Mention if it's acute or chronic",
    "Add any other related health concerns"
  ];
  
  return {
    extractedKeywords: keywords,
    targetBenefits,
    suggestions
  };
};