const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface GenerateRequest {
  prompt: string;
  model: string;
  max_tokens?: number;
  temperature?: number;
}

export interface GenerateResponse {
  success: boolean;
  content: string;
  model: string;
  provider: string;
}

export const generateContent = async (request: GenerateRequest): Promise<GenerateResponse> => {
  const response = await fetch(`${API_BASE}/api/ai/generate-simple`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

// Additional API functions for other features
export const getAvailableModels = async () => {
  const response = await fetch(`${API_BASE}/api/v1/ai/models`);
  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }
  return response.json();
};

export const getUserStats = async () => {
  const response = await fetch(`${API_BASE}/api/v1/ai/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }
  return response.json();
};