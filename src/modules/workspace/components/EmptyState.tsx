import { FileActionButton, FolderActionButton } from "@/modules/workspace/components/actions";

export interface EmptyStateProps {
  viewType: "folder" | "file" | "archive" | "template";
  title?: string;
  description?: string;
}

export const EmptyState = ({ viewType, title, description }: EmptyStateProps) => {
  if (viewType === "archive") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title || "Archive is empty"}</h2>
        <p className="text-muted-foreground mb-6">{description || "Items you archive will appear here"}</p>
      </div>
    );
  }
  if (viewType === "template") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title || "Templates is empty"}</h2>
        <p className="text-muted-foreground mb-6">{description || "Items you create will appear here"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h2 className="text-2xl font-bold text-foreground mb-6">{viewType === "folder" ? "Let's Start" : "Add a workflow to this project"}</h2>
      {viewType === "folder" ? <FolderActionButton /> : <FileActionButton />}
    </div>
  );
};
