import { useState } from "react";

export type NotificationType = "success" | "error" | "info";
export interface AppNotification {
  type: NotificationType;
  message: string;
}

// Simple auto-dismissing toast notification, used throughout the app via
// showNotification("success" | "error" | "info", "...").
export function useNotification() {
  const [notification, setNotification] = useState<AppNotification | null>(null);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return { notification, setNotification, showNotification };
}
