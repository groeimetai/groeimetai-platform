import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import apiSandbox, { 
  SandboxRequest, 
  SandboxResponse, 
  ApiProvider,
  UsageMetrics,
  RateLimitConfig 
} from '@/services/apiSandboxService';

export interface ApiSandboxState {
  loading: boolean;
  error: string | null;
  usage: UsageMetrics | null;
  providers: ApiProvider[];
  mockMode: boolean;
}

export interface ApiMethod {
  name: string;
  description: string;
  parameters: Record<string, any>;
  example: any;
}

export interface ApiSandboxHook {
  // State
  state: ApiSandboxState;
  
  // Core methods
  request: (request: SandboxRequest) => Promise<SandboxResponse>;
  
  // Provider methods with auto-complete
  openai: {
    chat: (messages: any[], options?: any) => Promise<SandboxResponse>;
    completions: (prompt: string, options?: any) => Promise<SandboxResponse>;
    embeddings: (input: string | string[], options?: any) => Promise<SandboxResponse>;
    images: {
      generate: (prompt: string, options?: any) => Promise<SandboxResponse>;
      edit: (image: string, prompt: string, options?: any) => Promise<SandboxResponse>;
    };
    audio: {
      transcribe: (audio: Blob, options?: any) => Promise<SandboxResponse>;
      translate: (audio: Blob, options?: any) => Promise<SandboxResponse>;
    };
  };
  
  anthropic: {
    messages: (messages: any[], options?: any) => Promise<SandboxResponse>;
    complete: (prompt: string, options?: any) => Promise<SandboxResponse>;
  };
  
  google: {
    generateContent: (prompt: string, options?: any) => Promise<SandboxResponse>;
    generateContentStream: (prompt: string, options?: any) => Promise<SandboxResponse>;
    embedContent: (content: string, options?: any) => Promise<SandboxResponse>;
  };
  
  // Utility methods
  refreshUsage: () => Promise<void>;
  setMockMode: (enabled: boolean) => void;
  estimateCost: (provider: string, model: string, tokens: number) => number;
  getAvailableModels: (provider: ApiProvider['name']) => string[];
  
  // Configuration
  initializeUser: (config?: Partial<RateLimitConfig>) => Promise<void>;
  storeApiKey: (provider: string, apiKey: string) => Promise<void>;
}

export function useApiSandbox(): ApiSandboxHook {
  const [user] = useAuthState(auth);
  const [state, setState] = useState<ApiSandboxState>({
    loading: false,
    error: null,
    usage: null,
    providers: [],
    mockMode: false,
  });

  // Initialize providers on mount
  useEffect(() => {
    setState(prev => ({
      ...prev,
      providers: apiSandbox.getProviders(),
    }));
  }, []);

  // Refresh usage metrics
  const refreshUsage = useCallback(async () => {
    if (!user) return;

    try {
      const metrics = await apiSandbox.getUsageMetrics(user.uid);
      setState(prev => ({ ...prev, usage: metrics }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [user]);

  // Auto-refresh usage on mount and after requests
  useEffect(() => {
    if (user) {
      refreshUsage();
    }
  }, [user, refreshUsage]);

  // Core request method
  const request = useCallback(async (request: SandboxRequest): Promise<SandboxResponse> => {
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiSandbox.makeRequest(user.uid, request);
      
      // Refresh usage after request
      await refreshUsage();
      
      setState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      
      return {
        success: false,
        error: error.message,
      };
    }
  }, [user, refreshUsage]);

  // OpenAI methods
  const openai = useMemo(() => ({
    chat: async (messages: any[], options: any = {}) => {
      return request({
        provider: 'openai',
        endpoint: '/chat/completions',
        method: 'POST',
        body: {
          model: options.model || 'gpt-3.5-turbo',
          messages,
          ...options,
        },
      });
    },
    
    completions: async (prompt: string, options: any = {}) => {
      return request({
        provider: 'openai',
        endpoint: '/completions',
        method: 'POST',
        body: {
          model: options.model || 'text-davinci-003',
          prompt,
          ...options,
        },
      });
    },
    
    embeddings: async (input: string | string[], options: any = {}) => {
      return request({
        provider: 'openai',
        endpoint: '/embeddings',
        method: 'POST',
        body: {
          model: options.model || 'text-embedding-ada-002',
          input,
          ...options,
        },
      });
    },
    
    images: {
      generate: async (prompt: string, options: any = {}) => {
        return request({
          provider: 'openai',
          endpoint: '/images/generations',
          method: 'POST',
          body: {
            model: options.model || 'dall-e-3',
            prompt,
            n: options.n || 1,
            size: options.size || '1024x1024',
            ...options,
          },
        });
      },
      
      edit: async (image: string, prompt: string, options: any = {}) => {
        return request({
          provider: 'openai',
          endpoint: '/images/edits',
          method: 'POST',
          body: {
            image,
            prompt,
            ...options,
          },
        });
      },
    },
    
    audio: {
      transcribe: async (audio: Blob, options: any = {}) => {
        const formData = new FormData();
        formData.append('file', audio);
        formData.append('model', options.model || 'whisper-1');
        
        if (options.language) {
          formData.append('language', options.language);
        }
        
        return request({
          provider: 'openai',
          endpoint: '/audio/transcriptions',
          method: 'POST',
          body: formData,
        });
      },
      
      translate: async (audio: Blob, options: any = {}) => {
        const formData = new FormData();
        formData.append('file', audio);
        formData.append('model', options.model || 'whisper-1');
        
        return request({
          provider: 'openai',
          endpoint: '/audio/translations',
          method: 'POST',
          body: formData,
        });
      },
    },
  }), [request]);

  // Anthropic methods
  const anthropic = useMemo(() => ({
    messages: async (messages: any[], options: any = {}) => {
      return request({
        provider: 'anthropic',
        endpoint: '/messages',
        method: 'POST',
        body: {
          model: options.model || 'claude-3-haiku-20240307',
          messages,
          max_tokens: options.max_tokens || 1024,
          ...options,
        },
      });
    },
    
    complete: async (prompt: string, options: any = {}) => {
      return request({
        provider: 'anthropic',
        endpoint: '/complete',
        method: 'POST',
        body: {
          model: options.model || 'claude-2.1',
          prompt,
          max_tokens_to_sample: options.max_tokens || 1024,
          ...options,
        },
      });
    },
  }), [request]);

  // Google methods
  const google = useMemo(() => ({
    generateContent: async (prompt: string, options: any = {}) => {
      return request({
        provider: 'google',
        endpoint: `/models/${options.model || 'gemini-pro'}:generateContent`,
        method: 'POST',
        body: {
          contents: [{
            parts: [{
              text: prompt,
            }],
          }],
          ...options,
        },
      });
    },
    
    generateContentStream: async (prompt: string, options: any = {}) => {
      return request({
        provider: 'google',
        endpoint: `/models/${options.model || 'gemini-pro'}:streamGenerateContent`,
        method: 'POST',
        body: {
          contents: [{
            parts: [{
              text: prompt,
            }],
          }],
          ...options,
        },
      });
    },
    
    embedContent: async (content: string, options: any = {}) => {
      return request({
        provider: 'google',
        endpoint: `/models/${options.model || 'embedding-001'}:embedContent`,
        method: 'POST',
        body: {
          content: {
            parts: [{
              text: content,
            }],
          },
          ...options,
        },
      });
    },
  }), [request]);

  // Utility methods
  const setMockMode = useCallback((enabled: boolean) => {
    if (enabled) {
      apiSandbox.enableMockMode();
    } else {
      apiSandbox.disableMockMode();
    }
    setState(prev => ({ ...prev, mockMode: enabled }));
  }, []);

  const estimateCost = useCallback((provider: string, model: string, tokens: number) => {
    return apiSandbox.calculateEstimatedCost(provider, model, tokens);
  }, []);

  const getAvailableModels = useCallback((provider: ApiProvider['name']) => {
    return apiSandbox.getAvailableModels(provider);
  }, []);

  const initializeUser = useCallback(async (config?: Partial<RateLimitConfig>) => {
    if (!user) return;
    
    await apiSandbox.initializeStudent(user.uid, config);
    await refreshUsage();
  }, [user, refreshUsage]);

  const storeApiKey = useCallback(async (provider: string, apiKey: string) => {
    if (!user) return;
    
    await apiSandbox.storeApiKey(user.uid, provider, apiKey);
  }, [user]);

  return {
    state,
    request,
    openai,
    anthropic,
    google,
    refreshUsage,
    setMockMode,
    estimateCost,
    getAvailableModels,
    initializeUser,
    storeApiKey,
  };
}

// Export types for auto-complete
export type OpenAIMethods = ApiSandboxHook['openai'];
export type AnthropicMethods = ApiSandboxHook['anthropic'];
export type GoogleMethods = ApiSandboxHook['google'];