import { useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { useMicrosoftAuthorizeCallback } from "@/modules/flow/services/connectors/connectorService";
import { useDialogStoreActions } from "@/store";

function ConnectorsCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing authentication...");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const { closeDialog } = useDialogStoreActions();

  const { data } = useMicrosoftAuthorizeCallback(code || "", state || "");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!code) {
          throw new Error("Authorization code not found");
        }
        if (data) {

          sessionStorage.removeItem("pendingUserDisplay");

          setStatus("success");
          setMessage("Authentication successful! Closing window...");

          if (window.opener) {
            window.opener.postMessage(
              {
                type: "CONNECTOR_AUTH_SUCCESS",
                data: {
                  userId: data.userId,
                  userEmail: data.userEmail,
                  userName: data.userName,
                },
              },
              window.location.origin
            );
          }

          setTimeout(() => {
            window.close();
          }, 1000);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Authentication failed");

        if (window.opener) {
          window.opener.postMessage(
            {
              type: "CONNECTOR_AUTH_ERROR",
              error: error instanceof Error ? error.message : "Authentication failed",
            },
            window.location.origin
          );
        }

        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    handleCallback();
  }, [data, code, closeDialog]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {status === "loading" && (
          <>
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          </>
        )}
        {status === "success" && (
          <>
            <div>✅</div>
          </>
        )}
        {status === "error" && (
          <>
            <div>❌</div>
          </>
        )}
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export default ConnectorsCallback;
