import { GTMenuItem } from "../types";
import {
  BooleanTypeIcon as IconBoolean,
  NumberTypeIcon as IconNumber,
  ObjectTypeIcon as IconObject,
  StringTypeIcon as IconString,
} from "@/lib/icons";

export const GT_MENU_ITEMS: GTMenuItem[] = [
  { id: "recents-title", label: "Recents", isGroupTitle: true },

  {
    id: "user_profile",
    label: "User_Profile",
    value: "Daniel_Atimger;Business...",
    icon: <IconObject className="h-4 w-4" />,
    section: "recents",
    type: "object", 
  },
  {
    id: "credits",
    label: "credits",
    value: "17356513",
    icon: <IconString className="h-4 w-4" />,
    section: "recents",
    type: "string", 
  },
  {
    id: "row_id",
    label: "row_id",
    value: "18d4876",
    icon: <IconNumber className="h-4 w-4" />,
    section: "recents",
    type: "number", 
  },

  { id: "all-title", label: "All Properties", isGroupTitle: true },

  {
    id: "need_human",
    label: "need_human",
    value: "True",
    icon: <IconBoolean className="h-4 w-4" />,
    section: "all",
    type: "boolean", 
  },
  {
    id: "first_Name",
    label: "first_Name",
    value: "Daniel",
    icon: <IconObject className="h-4 w-4" />,
    section: "all",
    type: "object", 
  },
  {
    id: "cost_per_user",
    label: "cost_per_user",
    value: "$16,313;$12,463;$138...",
    icon: <IconObject className="h-4 w-4" />,
    section: "all",
    type: "object", 
  },
];
