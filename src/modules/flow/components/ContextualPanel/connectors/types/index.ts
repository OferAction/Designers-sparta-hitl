import { EmailConnectorUser } from "@/modules/flow/services/connectors/types";

export interface EditModeState extends EmailConnectorUser {
  isEdit: boolean;
}
