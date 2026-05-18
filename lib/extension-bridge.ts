import type { BlockedSite } from "@/hooks/use-blocked-sites";

export interface BlockHistoryEntry {
  id: string;
  domain: string;
  url: string;
  timestamp: string;
  context: "standard" | "focus";
}

const ENV_EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID ?? "";

function getCookieValue(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

function getExtensionId(): string {
  if (ENV_EXTENSION_ID.trim().length > 0) return ENV_EXTENSION_ID.trim();
  return getCookieValue("extension_id");
}

export type ExtensionMessageType =
  | "GET_BLOCKED_SITES"
  | "ADD_SITE"
  | "TOGGLE_SITE"
  | "DELETE_SITE"
  | "UPDATE_SITE"
  | "UNLOCK_SITE"
  | "GET_UNLOCK_STATE"
  | "CLEAR_UNLOCK_STATE"
  | "GET_SITE_CONFIG"
  | "GET_BLOCK_HISTORY"
  | "CLEAR_BLOCK_HISTORY"
  | "GET_SETTINGS"
  | "UPDATE_SETTINGS"
  | "GET_FOCUS_SESSION";

export interface GetBlockedSitesMessage {
  type: "GET_BLOCKED_SITES";
}

export interface AddSiteMessage {
  type: "ADD_SITE";
  payload: {
    domain: string;
    category: string;
    blockMode: "timer" | "audio" | "hard";
    timerSeconds: number;
    unlockDurationMinutes: number;
  };
}

export interface ToggleSiteMessage {
  type: "TOGGLE_SITE";
  payload: { id: string };
}

export interface DeleteSiteMessage {
  type: "DELETE_SITE";
  payload: { id: string };
}

export interface UpdateSiteMessage {
  type: "UPDATE_SITE";
  payload: {
    id: string;
    updates: Partial<import("@/hooks/use-blocked-sites").BlockedSite>;
  };
}

export interface UnlockSiteMessage {
  type: "UNLOCK_SITE";
  payload: { domain: string; durationMinutes: number };
}

export interface GetUnlockStateMessage {
  type: "GET_UNLOCK_STATE";
  payload: { domain: string };
}

export interface ClearUnlockStateMessage {
  type: "CLEAR_UNLOCK_STATE";
  payload: { domain: string };
}

export interface GetSiteConfigMessage {
  type: "GET_SITE_CONFIG";
  payload: { domain: string };
}

export interface GetBlockHistoryMessage {
  type: "GET_BLOCK_HISTORY";
}

export interface ClearBlockHistoryMessage {
  type: "CLEAR_BLOCK_HISTORY";
}

export interface ExtensionSettings {
  showTranslation: boolean;
  showTransliteration: boolean;
  blockingEnabled: boolean;
}

export interface GetSettingsMessage {
  type: "GET_SETTINGS";
}

export interface UpdateSettingsMessage {
  type: "UPDATE_SETTINGS";
  payload: Partial<ExtensionSettings>;
}

export interface GetFocusSessionMessage {
  type: "GET_FOCUS_SESSION";
}

export type ExtensionMessage =
  | GetBlockedSitesMessage
  | AddSiteMessage
  | ToggleSiteMessage
  | DeleteSiteMessage
  | UpdateSiteMessage
  | UnlockSiteMessage
  | GetUnlockStateMessage
  | ClearUnlockStateMessage
  | GetSiteConfigMessage
  | GetBlockHistoryMessage
  | ClearBlockHistoryMessage
  | GetSettingsMessage
  | UpdateSettingsMessage
  | GetFocusSessionMessage;

export interface ExtensionSuccessResponse<T = unknown> {
  ok: true;
  data: T;
}

export interface ExtensionErrorResponse {
  ok: false;
  error: string;
}

export type ExtensionResponse<T = unknown> =
  | ExtensionSuccessResponse<T>
  | ExtensionErrorResponse;

export function isExtensionRuntimeAvailable(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.runtime !== "undefined" &&
    typeof chrome.runtime.sendMessage === "function" &&
    getExtensionId().length > 0
  );
}

function sendToExtension<T>(
  message: ExtensionMessage,
): Promise<ExtensionResponse<T>> {
  return new Promise((resolve) => {
    if (!isExtensionRuntimeAvailable()) {
      resolve({ ok: false, error: "Extension runtime is not available." });
      return;
    }

    try {
      chrome.runtime.sendMessage(
        getExtensionId(),
        message,
        (response: ExtensionResponse<T>) => {
          if (chrome.runtime.lastError) {
            resolve({
              ok: false,
              error:
                chrome.runtime.lastError.message ??
                "Unknown chrome.runtime error.",
            });
            return;
          }

          if (response === undefined) {
            resolve({
              ok: false,
              error:
                "No response from extension. Is the extension installed and active?",
            });
            return;
          }

          resolve(response);
        },
      );
    } catch (err) {
      resolve({
        ok: false,
        error: err instanceof Error ? err.message : "Unexpected error.",
      });
    }
  });
}

export async function fetchBlockedSitesFromExtension(): Promise<
  ExtensionResponse<BlockedSite[]>
> {
  return sendToExtension<BlockedSite[]>({ type: "GET_BLOCKED_SITES" });
}

export async function addSiteViaExtension(
  domain: string,
  category: string,
  blockMode: "timer" | "audio" | "hard" = "timer",
  timerSeconds = 30,
  unlockDurationMinutes = 5,
): Promise<ExtensionResponse<BlockedSite[]>> {
  return sendToExtension<BlockedSite[]>({
    type: "ADD_SITE",
    payload: {
      domain,
      category,
      blockMode,
      timerSeconds,
      unlockDurationMinutes,
    },
  });
}

export async function toggleSiteViaExtension(
  id: string,
): Promise<ExtensionResponse<BlockedSite[]>> {
  return sendToExtension<BlockedSite[]>({
    type: "TOGGLE_SITE",
    payload: { id },
  });
}

export async function deleteSiteViaExtension(
  id: string,
): Promise<ExtensionResponse<BlockedSite[]>> {
  return sendToExtension<BlockedSite[]>({
    type: "DELETE_SITE",
    payload: { id },
  });
}

export async function updateSiteViaExtension(
  id: string,
  updates: Partial<BlockedSite>,
): Promise<ExtensionResponse<BlockedSite[]>> {
  return sendToExtension<BlockedSite[]>({
    type: "UPDATE_SITE",
    payload: { id, updates },
  });
}

export async function unlockSiteViaExtension(
  domain: string,
  durationMinutes: number,
): Promise<ExtensionResponse<null>> {
  return sendToExtension<null>({
    type: "UNLOCK_SITE",
    payload: { domain, durationMinutes },
  });
}

export interface UnlockState {
  unlockedUntil: number | null;
}

export async function getUnlockStateViaExtension(
  domain: string,
): Promise<ExtensionResponse<UnlockState>> {
  return sendToExtension<UnlockState>({
    type: "GET_UNLOCK_STATE",
    payload: { domain },
  });
}

export async function clearUnlockStateViaExtension(
  domain: string,
): Promise<ExtensionResponse<null>> {
  return sendToExtension<null>({
    type: "CLEAR_UNLOCK_STATE",
    payload: { domain },
  });
}

export interface SiteConfig {
  blockMode: "timer" | "audio" | "hard";
  timerSeconds: number;
  unlockDurationMinutes: number;
}

export async function getSiteConfigViaExtension(
  domain: string,
): Promise<ExtensionResponse<SiteConfig>> {
  return sendToExtension<SiteConfig>({
    type: "GET_SITE_CONFIG",
    payload: { domain },
  });
}

export async function fetchBlockHistoryFromExtension(): Promise<
  ExtensionResponse<BlockHistoryEntry[]>
> {
  return sendToExtension<BlockHistoryEntry[]>({ type: "GET_BLOCK_HISTORY" });
}

export async function clearBlockHistoryViaExtension(): Promise<
  ExtensionResponse<null>
> {
  return sendToExtension<null>({ type: "CLEAR_BLOCK_HISTORY" });
}

export async function getSettingsFromExtension(): Promise<
  ExtensionResponse<ExtensionSettings>
> {
  return sendToExtension<ExtensionSettings>({ type: "GET_SETTINGS" });
}

export async function updateSettingsViaExtension(
  settings: Partial<ExtensionSettings>,
): Promise<ExtensionResponse<ExtensionSettings>> {
  return sendToExtension<ExtensionSettings>({
    type: "UPDATE_SETTINGS",
    payload: settings,
  });
}

export interface FocusSession {
  isActive: boolean;
  phase: "focus" | "break" | null;
  phaseEndTime: number;
}

export interface FocusSessionResponse {
  isActive: boolean;
  session: FocusSession | null;
}

export async function getFocusSessionViaExtension(): Promise<
  ExtensionResponse<FocusSessionResponse>
> {
  return sendToExtension<FocusSessionResponse>({ type: "GET_FOCUS_SESSION" });
}
