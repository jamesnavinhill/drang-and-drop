export function isAssistantFeatureEnabled() {
  return process.env.NEXT_PUBLIC_BUILDER_ASSISTANT_ENABLED === "true";
}

export function getAssistantFeatureLabel() {
  return isAssistantFeatureEnabled() ? "Enabled" : "Dormant";
}
