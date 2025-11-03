// src/services/comparativeService.ts
export interface ComparativeDocument {
  text: string;
  source: 'upload' | 'ocr';
  name: string;
}

export interface ComparisonTableItem {
  criteria: string;
  documents: {
    name: string;
    value: string;
    score: number;
  }[];
}

export interface ComparativeAnalysisResult {
  summary: string;
  comparisonTable: ComparisonTableItem[];
  bestPractices: string[];
  redFlags: string[];
  recommendations: string[];
  overallRanking: {
    name: string;
    rank: number;
    justification: string;
  }[];
  complianceAnalysis?: {
    framework: string;
    status: string;
    details: string;
  }[];
  industryInsights?: string[];
  industry: string;
  template: string;
  analysisId: string;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  criteria: string[];
  compliance: string[];
}

export const compareDocuments = async (
  token: string, 
  documents: ComparativeDocument[],
  industry: string = 'default'
): Promise<ComparativeAnalysisResult> => {
  console.log('🌐 Appel API comparative/compare');
  console.log('🌐 URL:', `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/comparative/compare`);
  console.log('🌐 Documents envoyés:', documents.length);
  console.log('🌐 Industry:', industry);
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/comparative/compare`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documents, industry }),
  });

  console.log('🌐 Response status:', response.status);
  console.log('🌐 Response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🌐 Error response text:', errorText);
    
    try {
      const errorData = JSON.parse(errorText);
      console.error('🌐 Error data parsed:', errorData);
      throw new Error(errorData.message || 'Erreur lors de l\'analyse comparative');
    } catch (parseError) {
      console.error('🌐 Could not parse error response:', parseError);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }
  }

  const result = await response.json();
  console.log('🌐 Success response:', result);
  return result;
};

export const getIndustryTemplates = async (
  token: string
): Promise<{ templates: IndustryTemplate[] }> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/comparative/templates`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des templates');
  }

  return response.json();
};