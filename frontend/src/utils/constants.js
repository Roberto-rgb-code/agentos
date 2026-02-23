// Detectar si estamos en Electron y usar la API base correcta
let apiBase = import.meta.env.VITE_API_BASE;
if (!apiBase || apiBase === "/api") {
  // Si estamos en Electron, usar la API base de Electron
  if (window.electronAPI && window.electronAPI.apiBase) {
    apiBase = window.electronAPI.apiBase;
  } else if (window.__ELECTRON_API_BASE__) {
    apiBase = window.__ELECTRON_API_BASE__;
  } else {
    // Fallback: detectar si estamos en localhost:3000 (desarrollo) y usar 3001
    if (window.location.origin === 'http://localhost:3000') {
      apiBase = 'http://localhost:3001/api';
    } else {
      apiBase = "/api";
    }
  }
}
export const API_BASE = apiBase;
export const ONBOARDING_SURVEY_URL = "https://onboarding.anythingllm.com";

export const AUTH_USER = "agentos_user";
export const AUTH_TOKEN = "agentos_authToken";
export const AUTH_TIMESTAMP = "agentos_authTimestamp";
export const COMPLETE_QUESTIONNAIRE = "agentos_completed_questionnaire";
export const SEEN_DOC_PIN_ALERT = "agentos_pinned_document_alert";
export const SEEN_WATCH_ALERT = "agentos_watched_document_alert";
export const LAST_VISITED_WORKSPACE = "agentos_last_visited_workspace";
export const USER_PROMPT_INPUT_MAP = "agentos_user_prompt_input_map";
export const PENDING_HOME_MESSAGE = "agentos_pending_home_message";

export const APPEARANCE_SETTINGS = "agentos_appearance_settings";

export const OLLAMA_COMMON_URLS = [
  "http://127.0.0.1:11434",
  "http://host.docker.internal:11434",
  "http://172.17.0.1:11434",
];

export const LMSTUDIO_COMMON_URLS = [
  "http://localhost:1234/v1",
  "http://127.0.0.1:1234/v1",
  "http://host.docker.internal:1234/v1",
  "http://172.17.0.1:1234/v1",
];

export const KOBOLDCPP_COMMON_URLS = [
  "http://127.0.0.1:5000/v1",
  "http://localhost:5000/v1",
  "http://host.docker.internal:5000/v1",
  "http://172.17.0.1:5000/v1",
];

export const LOCALAI_COMMON_URLS = [
  "http://127.0.0.1:8080/v1",
  "http://localhost:8080/v1",
  "http://host.docker.internal:8080/v1",
  "http://172.17.0.1:8080/v1",
];

export const DPAIS_COMMON_URLS = [
  "http://127.0.0.1:8553/v1/openai",
  "http://0.0.0.0:8553/v1/openai",
  "http://localhost:8553/v1/openai",
  "http://host.docker.internal:8553/v1/openai",
];

export const NVIDIA_NIM_COMMON_URLS = [
  "http://127.0.0.1:8000/v1/version",
  "http://localhost:8000/v1/version",
  "http://host.docker.internal:8000/v1/version",
  "http://172.17.0.1:8000/v1/version",
];

export const DOCKER_MODEL_RUNNER_COMMON_URLS = [
  "http://localhost:12434/engines/llama.cpp/v1",
  "http://127.0.0.1:12434/engines/llama.cpp/v1",
  "http://model-runner.docker.internal/engines/llama.cpp/v1",
  "http://host.docker.internal:12434/engines/llama.cpp/v1",
  "http://172.17.0.1:12434/engines/llama.cpp/v1",
];

export function fullApiUrl() {
  if (API_BASE !== "/api") return API_BASE;
  return `${window.location.origin}/api`;
}

export const POPUP_BROWSER_EXTENSION_EVENT = "NEW_BROWSER_EXTENSION_CONNECTION";
