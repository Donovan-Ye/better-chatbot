import { UIResource, UI_RESOURCE_PREFIX } from "./types";

export const isTextParsable = (text: string) => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

export const parseText = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export const isUIResource = (resource: UIResource) => {
  return (
    resource.type === "resource" &&
    resource.resource.uri.startsWith(UI_RESOURCE_PREFIX) &&
    resource.resource.mimeType === "application/json" &&
    isTextParsable(resource.resource.text)
  );
};
