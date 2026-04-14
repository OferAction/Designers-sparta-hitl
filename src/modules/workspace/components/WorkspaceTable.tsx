import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileRowSkeleton } from "@/modules/workspace/components/files";
import { FolderRowSkeleton } from "@/modules/workspace/components/folders";

type WorkspaceTableProps = {
  children: React.ReactNode;
  loading?: boolean;
};

const SkeletonBody = () => {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <FolderRowSkeleton key={index} />
      ))}
      <FileRowSkeleton />
    </>
  );
};

export function WorkspaceTable({ children, loading }: WorkspaceTableProps) {
  return (
    <div className="w-full px-11 py-16">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left py-3 px-4 text-muted-foreground font-medium">Name</TableHead>
            <TableHead className="text-left py-3 px-4 text-muted-foreground font-medium">Last Modified</TableHead>
            <TableHead className="text-left py-3 px-4 text-muted-foreground font-medium">Version</TableHead>
            <TableHead className="text-left py-3 px-4 text-muted-foreground font-medium">Collaborators</TableHead>
            <TableHead className="text-left py-3 px-4 text-muted-foreground font-medium"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{loading ? <SkeletonBody /> : children}</TableBody>
      </Table>
    </div>
  );
}
