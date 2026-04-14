import { useEffect } from "react";

import useSetActiveAccount from "./useSetActiveAccount";
import { queryClient } from "@/lib/queryClient";
import { getEmailConnectorUsers } from "@/modules/flow/services/connectors/connectorQueries";
import { useAddUserDisplay } from "@/modules/flow/services/connectors/connectorService";
import type { EmailConnectorUser } from "@/modules/flow/services/connectors/types";
import { useDialogStoreActions } from "@/store";

export const usePopupAuthListener = (opts?: { onSuccess?: (user: EmailConnectorUser) => void; autoClose?: boolean }) => {
  const { handleActiveAccount } = useSetActiveAccount();
  const { closeDialog } = useDialogStoreActions();
  const { mutate: addUserDisplay } = useAddUserDisplay();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const customDisplayName = sessionStorage.getItem("pendingUserDisplay");
      const displayName = customDisplayName?.trim();

      if (event.data.type === "CONNECTOR_AUTH_SUCCESS") {
        const user: EmailConnectorUser = {
          userId: event.data.data.userId,
          userEmail: event.data.data.userEmail,
          userName: event.data.data.userName,
          userDisplayName: displayName || event.data.data.userName,
        };

        addUserDisplay({
          $userId: user.userId,
          $userDisplay: user.userDisplayName || user.userName,
        });

        handleActiveAccount(user);
        if (opts?.onSuccess) {
          opts.onSuccess(user);
        }
        if (opts?.autoClose !== false) {
          closeDialog();
        }
        queryClient.invalidateQueries({ queryKey: getEmailConnectorUsers().queryKey });
      } else if (event.data.type === "CONNECTOR_AUTH_ERROR") {
        console.error("Authentication error:", event.data.error);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [addUserDisplay, closeDialog, handleActiveAccount, opts]);
};

export default usePopupAuthListener;
