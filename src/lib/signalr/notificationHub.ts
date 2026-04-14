import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";

const NOTIFICATION_HUB_URL = import.meta.env.VITE_NOTIFICATION_HUB_URL || "https://genor-test-uaenorth-apim.azure-api.net/notificationHub";

class NotificationHub {
  private connection: HubConnection | null = null;
  private connectionPromise: Promise<void> | null = null;
  private listeners: { [key: string]: Array<(data: any) => void> } = {};

  constructor() {
    // this.connection = new HubConnectionBuilder()
    //   .withUrl(NOTIFICATION_HUB_URL)
    //   .withAutomaticReconnect()
    //   .configureLogging(LogLevel.Information)
    //   .build();

    this.connection = new HubConnectionBuilder()
      .withUrl(NOTIFICATION_HUB_URL, {
        withCredentials: false,
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      // .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    // Setup the notification receiver
    this.connection.on("ReceiveNotification", (notification) => {
      console.log("Received notification:", notification);
      console.log("Configuration:", JSON.parse(notification["configuration"]));
      this.notifyListeners("notification", notification);
    });

    // Connection status events
    this.connection.onreconnecting(() => {
      this.notifyListeners("connectionStatus", "reconnecting");
    });

    this.connection.onreconnected(() => {
      this.notifyListeners("connectionStatus", "connected");
    });

    this.connection.onclose(() => {
      this.notifyListeners("connectionStatus", "disconnected");
    });
  }

  private notifyListeners(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  public addListener(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.removeListener(event, callback);
  }

  public removeListener(event: string, callback: (data: any) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  public async start() {
    if (!this.connection) return;

    if (this.connection.state === HubConnectionState.Connected) {
      return Promise.resolve();
    }

    if (!this.connectionPromise) {
      this.connectionPromise = this.connection
        .start()
        .then(() => {
          this.notifyListeners("connectionStatus", "connected");
        })
        .catch((error) => {
          console.error("Error starting connection:", error);
          this.notifyListeners("connectionStatus", "disconnected");
          this.connectionPromise = null;
          throw error;
        });
    }

    return this.connectionPromise;
  }

  public async stop() {
    if (!this.connection) return;

    if (this.connection.state !== HubConnectionState.Disconnected) {
      await this.connection.stop();
      this.notifyListeners("connectionStatus", "disconnected");
    }
    this.connectionPromise = null;
  }

  public async subscribe(topicName: string, sessionId: string) {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error("Not connected to hub");
    }

    try {
      await this.connection.invoke("Subscribe", topicName, `session_id:${sessionId}`);
      console.log("subscribed to topic", topicName, sessionId);
      return true;
    } catch (error) {
      console.error("Error subscribing:", error);
      throw error;
    }
  }

  public async unsubscribe(topicName: string, sessionId: string) {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error("Not connected to hub");
    }

    try {
      await this.connection.invoke("Unsubscribe", topicName, `session_id:${sessionId}`);
      return true;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      throw error;
    }
  }

  public getConnectionState() {
    return this.connection?.state || HubConnectionState.Disconnected;
  }
}

export const notificationHub = new NotificationHub();
