import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface MappingErrorAlertProps {
  onViewMapping: () => void;
}

/**
 * Alert banner displayed when the evaluation response contains mapping errors.
 * Provides a button to navigate to the dataset mapping page for error resolution.
 */
export function MappingErrorAlert({ onViewMapping }: MappingErrorAlertProps) {
  return (
    <div className="px-3 pb-3">
      <Alert className="border-destructive bg-destructive/20">
        <AlertTitle className="text-base text-destructive-foreground">There are mapping errors</AlertTitle>
        <AlertDescription className="text-sm text-secondary-foreground">
          Evaluation will be executed only for valid nodes. See errors in dataset page.
        </AlertDescription>
        <div className="mt-2">
          <Button size="sm" variant="default" className="h-7 px-3 text-xs ml-auto flex" onClick={onViewMapping}>
            View mapping
          </Button>
        </div>
      </Alert>
    </div>
  );
}
