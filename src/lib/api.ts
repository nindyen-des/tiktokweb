const API_URL = import.meta.env.VITE_API_URL || 'https://tiktok-2sbe.onrender.com';

export interface BoostResponse {
  success: boolean;
  message?: string;
  sessionId?: string;
  targetUrl?: string;
  stats?: {
    success: number;
    failed: number;
    totalViews: number;
    totalLikes: number;
  };
  error?: string;
}

export async function startBoost(url: string): Promise<BoostResponse> {
  const response = await fetch(`${API_URL}/start?url=${encodeURIComponent(url)}`);
  return response.json();
}

export async function getBoostStatus(sessionId: string): Promise<BoostResponse> {
  const response = await fetch(`${API_URL}/status/${sessionId}`);
  return response.json();
}

export async function stopBoost(sessionId: string): Promise<BoostResponse> {
  const response = await fetch(`${API_URL}/stop/${sessionId}`);
  return response.json();
}
