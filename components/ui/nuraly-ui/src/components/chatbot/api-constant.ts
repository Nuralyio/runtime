const BASE_URL = 'http://localhost:8383/api/v3/iassistant';

export const API_URLS = {
  BASE_URL,
  GET_CATEGORY_BY_ID: (id: number) => `${BASE_URL}/category/${id}`,
  GET_CONVERSATION_BY_ID: (id: number) => `${BASE_URL}/conversation/${id}`,
  CONVERSATION: `${BASE_URL}/conversations`,
  TEXT_GENERATION: (id:number) => `${BASE_URL}/conversations/${id}/text-generation`,
};

export const MAIN_PROMPT_ID = 300;