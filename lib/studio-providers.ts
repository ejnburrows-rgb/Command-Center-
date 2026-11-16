export const studioProviders = {
  zai: { id: "zai", label: "Z.ai · GLM", env: "ZAI_API_KEY", model: "glm-5.3-flash", page: "https://chat.z.ai/" },
  "zai-coding": { id: "zai-coding", label: "Z.ai Coding Plan", env: "ZAI_CODING_PLAN_KEY", model: "glm-5.3-flash", page: "https://z.ai/manage-apikey/apikey-list" },
  openai: { id: "openai", label: "OpenAI API", env: "OPENAI_API_KEY", model: "gpt-4.1-mini", page: "https://chatgpt.com/" },
  gemini: { id: "gemini", label: "Google Gemini API", env: "GEMINI_API_KEY", model: "gemini-2.5-flash", page: "https://gemini.google.com/" }
} as const;
export type StudioProviderId = keyof typeof studioProviders;
export const studioProviderIds = Object.keys(studioProviders) as StudioProviderId[];
export function isStudioProvider(value: string): value is StudioProviderId {
  return Object.prototype.hasOwnProperty.call(studioProviders, value);
}
export function providerReady(id: StudioProviderId) {
  return Boolean(process.env[studioProviders[id].env]);
}
