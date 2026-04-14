export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // can refine to a Permission[] later
  isActive: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  deletedOn: string | null;
}

// UI-friendly option shape for role dropdowns
export interface RoleOption {
  id: string;
  value: string;
  label: string;
}
