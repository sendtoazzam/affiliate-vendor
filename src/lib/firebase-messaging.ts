import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from "firebase/messaging";
import { vendorApi } from "./api";

export const firebaseConfig = {
  apiKey: "AIzaSyBn3zLZJGZZx6hW-w3cYbHDPma1THkmsJ0",
  authDomain: "hausflex-618b2.firebaseapp.com",
  projectId: "hausflex-618b2",
  messagingSenderId: "535048747318",
  appId: "1:535048747318:web:f9b1ab8b10d8d25e28db97",
  vapidKey:
    "BBeRzf25rpu5ndiwTKyHY0iPCxdwtn1eDlgbc9rsPY8wMWX1SRUCg7AHyPHRareXQbKoqWov2Dj8qyQ7wtOWvKk",
};

const PUSH_ENABLED_KEY = "vf_vendor_push_enabled";
const PUSH_DEVICE_ID_KEY = "vf_vendor_push_device_id";

class FirebaseMessagingClient {
  private app: FirebaseApp | null = null;
  private messaging: Messaging | null = null;
  private listening = false;

  public getDeviceId(): string {
    if (typeof window === "undefined") return "vendor-web-device";

    let deviceId = localStorage.getItem(PUSH_DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `vendor-web-${crypto.randomUUID()}`;
      localStorage.setItem(PUSH_DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  public isPushEnabled(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(PUSH_ENABLED_KEY) === "true";
  }

  public setPushEnabled(enabled: boolean): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(PUSH_ENABLED_KEY, enabled ? "true" : "false");
  }

  private async initMessaging(): Promise<Messaging | null> {
    if (typeof window === "undefined") return null;
    if (this.messaging) return this.messaging;

    const supported = await isSupported().catch(() => false);
    if (!supported) return null;

    if (!this.app) {
      this.app = initializeApp(firebaseConfig);
    }

    this.messaging = getMessaging(this.app);
    return this.messaging;
  }

  public async requestPermissionAndRegister(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    try {
      const messagingInstance = await this.initMessaging();
      if (!messagingInstance) return false;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        this.setPushEnabled(false);
        return false;
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      const token = await getToken(messagingInstance, {
        vapidKey: firebaseConfig.vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token) return false;

      await vendorApi.registerPushDevice({
        platform: "web",
        fcm_token: token,
        device_id: this.getDeviceId(),
        device_label: navigator.userAgent.slice(0, 255),
        app_version: "vf-vendor-dashboard",
      });

      this.setPushEnabled(true);
      this.listenForForegroundMessages();
      return true;
    } catch (err) {
      console.warn("FCM push registration error:", err);
      return false;
    }
  }

  public async reRegisterIfEnabled(): Promise<void> {
    if (!this.isPushEnabled() || typeof window === "undefined") {
      return;
    }

    if (Notification.permission === "granted") {
      await this.requestPermissionAndRegister();
    }
  }

  public async revokeIfRegistered(): Promise<void> {
    if (typeof window === "undefined") return;
    const deviceId = this.getDeviceId();
    try {
      await vendorApi.revokePushDevice(deviceId);
    } catch {
      // Ignore cleanup error
    }
    this.setPushEnabled(false);
  }

  public listenForForegroundMessages(
    onMessageCallback?: (payload: MessagePayload) => void
  ): void {
    if (typeof window === "undefined" || this.listening) return;

    this.initMessaging().then((messagingInstance) => {
      if (!messagingInstance) return;

      this.listening = true;

      onMessage(messagingInstance, (payload: MessagePayload) => {
        const title =
          payload.notification?.title ||
          (payload.data?.title as string) ||
          "VAMOFLEX Notification";
        const body =
          payload.notification?.body ||
          (payload.data?.message as string) ||
          (payload.data?.body as string) ||
          "";

        // Dispatch custom DOM event so navbar/bell can instantly refresh
        window.dispatchEvent(
          new CustomEvent("vf:notification-received", { detail: payload })
        );

        if (onMessageCallback) {
          onMessageCallback(payload);
        }

        if (Notification.permission === "granted") {
          try {
            new Notification(title, {
              body,
              icon: "/favicon.ico",
              data: payload.data,
            });
          } catch {
            // Some browsers do not allow new Notification in page context
          }
        }
      });
    });
  }
}

export const firebaseMessaging = new FirebaseMessagingClient();
