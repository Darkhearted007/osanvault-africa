import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { router } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1DB954",
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    return null;
  }
}

async function registerTokenWithServer(token: string): Promise<void> {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const base = domain ? `https://${domain}` : "";
  const url = `${base}/api/device-tokens`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
  } catch {
  }
}

function handleNotificationNavigation(
  notification: Notifications.Notification
): void {
  const data = notification.request.content.data as Record<string, unknown>;
  if (!data) return;

  const screen = data.screen as string | undefined;
  if (screen === "governance") {
    router.push("/governance" as never);
  } else if (screen === "property" && data.propertyId) {
    router.push(`/property/${data.propertyId}` as never);
  }
}

export function usePushNotifications(): void {
  const [, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        registerTokenWithServer(token);
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((_notification) => {
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationNavigation(response.notification);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}
