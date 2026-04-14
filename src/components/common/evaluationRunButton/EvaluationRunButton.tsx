import { DataSourceSelector } from "./DataSourceSelector";
import { EvaluationDetails } from "./EvaluationDetails";
import { EvaluationHeader } from "./EvaluationHeader";
import { MappingErrorAlert } from "./MappingErrorAlert";
import { SubsetSelection } from "./SubsetSelection";
import { useEvaluationRun } from "./useEvaluationRun";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Props for the evaluation run button component. */
export type EvaluationRunButtonProps = {
  buttonText?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * Main evaluation run button with popover for configuring dataset source, subset, and evaluation details.
 * Displays a button that opens a popover containing dataset selection, subset/range configuration, and evaluation description.
 */
export const EvaluationRunButton = ({ buttonText = "Evaluate", className, disabled = true }: EvaluationRunButtonProps) => {
  const {
    open,
    setOpen,
    datasetMenuOpen,
    setDatasetMenuOpen,
    selectedDataset,
    activeSubsets,
    radioValue,
    amount,
    setAmount,
    description,
    setDescription,
    evaluateSamplesCount,
    hasMappingErrors,
    isPending,
    handleConnectDataset,
    handleDatasetSourceSelect,
    handleRadioChange,
    handleViewMapping,
    handleEvaluate,
  } = useEvaluationRun();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative flex", className)}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "flex h-full py-2.5 px-3 mr-1 bg-blue-accent/15 rounded-md text-blue-accent shadow-[inset_0px_1px_1px_0px_rgba(248,250,252,0.08)] justify-center",
              open && "invisible"
            )}
            variant="secondary"
            size="lg"
            disabled={disabled}
          >
            {buttonText}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="border border-border-blue rounded-xl max-w-md absolute -top-12 -right-3 shadow-lg w-[320px] bg-blue-background max-h-[600px] p-0"
          align="end"
          side="bottom"
        >
          <EvaluationHeader
            isPending={isPending}
            hasSelectedDataset={!!selectedDataset}
            evaluateSamplesCount={evaluateSamplesCount}
            onCancel={() => setOpen(false)}
            onEvaluate={handleEvaluate}
          />

          <div className="border-t border-border-blue" />

          <div className="max-h-[520px] overflow-y-auto">
            <DataSourceSelector
              datasetMenuOpen={datasetMenuOpen}
              onDatasetMenuOpenChange={setDatasetMenuOpen}
              selectedDatasetName={selectedDataset?.name}
              onSelect={handleDatasetSourceSelect}
              onConnectDataset={handleConnectDataset}
            />

            {hasMappingErrors && <MappingErrorAlert onViewMapping={handleViewMapping} />}

            {selectedDataset && (
              <SubsetSelection
                dataset={selectedDataset}
                activeSubsets={activeSubsets}
                radioValue={radioValue}
                amount={amount}
                onRadioChange={handleRadioChange}
                onAmountChange={setAmount}
              />
            )}

            <div className="border-t border-border-blue" />

            <EvaluationDetails description={description} onDescriptionChange={setDescription} />
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
};

export default EvaluationRunButton;
