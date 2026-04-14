import { ReactNode, FC, useEffect, useRef, useState } from "react";

import { type HubConnection, HubConnectionState, HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";

import { SignalRContext } from "./context";
import { useAuthStore } from "@/store/authStore";

type SignalRProviderProps = {
  children: ReactNode;
};

const HUB_URL =
  import.meta.env.VITE_NOTIFICATION_HUB_URL ||
  (() => {
    throw new Error("VITE_NOTIFICATION_HUB_URL is not defined");
  })();

const createConnection = (token?: string) => {
  const connection = new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      withCredentials: false,
      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
      accessTokenFactory: () => token || "",
    })
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  connection.onreconnecting((error) => {
    console.log("SignalR connection lost, reconnecting...", error);
  });

  connection.onclose((error) => {
    console.log("SignalR connection closed", error);
  });
  return connection;
};

export const SignalRProvider: FC<SignalRProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (!connectionRef.current && accessToken) {
      const start = async () => {
        if (newConnection.state !== HubConnectionState.Disconnected) return;

        try {
          console.log("Starting SignalR connection");
          await newConnection.start();
          console.log("SignalR connection established successfully");
          setConnection(newConnection);
        } catch (err) {
          console.error("Error starting SignalR connection: ", err);
          timeoutId = setTimeout(() => start(), 5000); // Retry after 5 seconds
        }
      };

      const newConnection = createConnection(accessToken);
      connectionRef.current = newConnection;
      start();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);

      if (connectionRef.current) {
        connectionRef.current.stop().catch((err) => console.error("Error stopping connection: ", err));
        connectionRef.current = null;
      }
      setConnection(null);
    };
  }, [accessToken]);

  return <SignalRContext.Provider value={connection}>{children}</SignalRContext.Provider>;
};
