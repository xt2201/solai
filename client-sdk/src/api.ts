import axios from "axios";

export interface ChatRequest {
  prompt: string;
  wallet: string;
  demo?: boolean;
}

export interface ChatResponse {
  response: {
    completion: string;
    citations: Array<{ id: string; excerpt?: string; url?: string }>;
    meta: Record<string, unknown>;
  };
  promptHash: string;
  responseHash: string;
  transaction?: {
    serialized: string;
    recentBlockhash: string;
    feeLamports: number;
    userAccount: string;
    treasury: string;
  };
  demo?: boolean;
  message?: string;
}

export interface InitUserResponse {
  initialized: boolean;
  transaction?: {
    serialized: string;
    recentBlockhash: string;
    userAccount: string;
    treasury: string;
  };
}

export class SolAIApiClient {
  constructor(private readonly baseUrl: string) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { data } = await axios.post<ChatResponse>(`${this.baseUrl}/chat`, request);
    return data;
  }

  async initUser(wallet: string): Promise<InitUserResponse> {
    const { data } = await axios.post<InitUserResponse>(`${this.baseUrl}/accounts/init`, { wallet });
    return data;
  }
}
