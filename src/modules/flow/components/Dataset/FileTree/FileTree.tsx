import { FileTreeProps } from "./types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function FileTree({ children, className }: FileTreeProps) {
  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-muted/40", className)}>
      <div className="px-2 pt-2.5">
        <span className="text-xs font-semibold text-muted-foreground">Zip File Structure</span>
      </div>
      <div className="p-0">
        <Table className="overflow-hidden">
          <TableHeader className="hidden">
            <TableRow>
              <TableHead className="w-full">Structure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      </div>
    </div>
  );
}
