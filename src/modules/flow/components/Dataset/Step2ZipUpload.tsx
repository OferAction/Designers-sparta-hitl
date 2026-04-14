import { FileTree, TreeItem } from "./FileTree";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Step2ZipUploadProps {
  selectedZipFile: File | null;
  onZipFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoConnect: boolean;
  onAutoConnectChange: (checked: boolean) => void;
}

export function Step2ZipUpload({ selectedZipFile, onZipFileChange, autoConnect, onAutoConnectChange }: Step2ZipUploadProps) {
  return (
    <div className="flex-1 space-y-4 flex flex-col justify-between pb-4 pt-2 min-h-0">
      <div className="flex flex-col gap-2">
        {/* File Upload Section */}
        <Label htmlFor="zip-upload" className="text-sm font-semibold text-foreground">
          2. Upload ZIP file
        </Label>
        <div className="flex justify-between gap-4">
          <div className="w-[348px] space-y-2">
            <div className="relative">
              <Input id="zip-upload" type="file" accept=".zip" onChange={onZipFileChange} className="hidden" />
              <label
                htmlFor="zip-upload"
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 border rounded-md cursor-pointer",
                  "bg-background hover:bg-accent/50 transition-colors",
                  selectedZipFile ? "border-purple-400 ring-4 ring-muted" : "border-border"
                )}
              >
                <span className="text-sm font-medium text-purple-400">Choose .ZIP file</span>
                <span className={cn("text-sm text-muted-foreground flex-1", selectedZipFile && "text-foreground")}>
                  {selectedZipFile ? selectedZipFile.name : "No file chosen"}
                </span>
              </label>
            </div>
            <p className="text-sm text-muted-foreground">Import a .zip file that is structured due to this instructions</p>
          </div>

          {/* Zip File Structure */}
          <div className="flex-1 flex flex-col space-y-2 min-h-0">
            <FileTree className="max-h-[310px]">
              <TreeItem type="archive" name="dataset_name.zip" level={0} hasChildren />
              <TreeItem type="folder" name="raw_data/" level={1} hasChildren />
              <TreeItem type="file" name="file_001.pdf" level={2} />
              <TreeItem type="file" name="file_002.pdf" level={2} />
              <TreeItem type="file" name="..." level={2} isLast />
            </FileTree>
          </div>
        </div>
      </div>

      {/* Auto-Connect Checkbox */}
      <div className="pt-4">
        <div className="flex items-start gap-3">
          <div className="h-full mt-[3px]">
            <Checkbox id="auto-connect" checked={autoConnect} onCheckedChange={(checked) => onAutoConnectChange(checked === true)} />
          </div>
          <div>
            <Label htmlFor="auto-connect" className="text-sm font-normal text-foreground cursor-pointer leading-5">
              Auto-Connect Dataset when upload is completed
            </Label>
            <p className="text-xs text-muted-foreground leading-5">You'll be notified when this process is done</p>
          </div>
        </div>
      </div>
    </div>
  );
}
