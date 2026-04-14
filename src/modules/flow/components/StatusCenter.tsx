import { ReactNode } from "react";

import { ArrowSquareLeftIcon, CheckCircleIcon, SpinnerGapIcon, StopIcon, WarningIcon, XCircleIcon } from "@phosphor-icons/react";
import { XIcon as X } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { Button } from "../../../components/ui/button";
import { useSubflowContext } from "../contexts";
import { CloudArrowUpIcon as CloudArroUp } from "@/lib/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FlowStoreState, useFlowStore } from "@/store";
import { contextualMenuActiveActionType } from "@/store/slices";
import { cn } from "@/utils";

// Define types for better type safety
type StatusType =
  | contextualMenuActiveActionType
  | "success"
  | "error"
  | "processing"
  | "analyzing"
  | "orchestrating"
  | "unsavedChanges"
  | "tryingToConnect"
  | "idle";

type StatusConfig = {
  icon?: ReactNode;
  message: string;
  description?: string;
  className?: string;
  ContainerClassName?: string;
  secondaryBtnHandler?: () => void;
  onClick?: () => void;
  secondaryBtnIcon?: ReactNode;
  spinner?: boolean;
};

const selector = ({ contextualMenuActiveAction, setContextualMenuActiveAction }: FlowStoreState) => ({
  contextualMenuActiveAction,
  setContextualMenuActiveAction,
});

export default function StatusCenter() {
  const navigate = useNavigate();
  const { folderId = "", fileId = "" } = useParams();
  const { contextualMenuActiveAction, setContextualMenuActiveAction } = useFlowStore(useShallow(selector));
  const isSubflowNode = useSubflowContext();
  const statusConfigs: Record<StatusType, StatusConfig> = {
    versionHistory: {
      icon: <ArrowSquareLeftIcon className="size-4" />,
      message: "Exit preview mode",
      className: " leading-none medium font-medium ",
      onClick: () => {
        setContextualMenuActiveAction("idle");
        navigate(`/canvas/${folderId}/${fileId}` + (isSubflowNode ? "/subflow" : ""), {
          state: {
            shouldFit: true,
          },
        });
      },
    },
    success: {
      icon: <CheckCircleIcon weight="fill" className="text-success" />,
      className: " leading-6 normal font-normal ",
      message: "Sample run successfully completed",
    },
    error: {
      icon: <XCircleIcon weight="fill" className="text-destructive" />,
      className: " leading-6 normal font-normal ",
      message: "Run failed: Provider does not exist.",
    },
    processing: {
      message: `Processing...`,
      className: "text-primary bg-secondary text-sm leading-6 normal font-medium ",
      spinner: true,
      secondaryBtnHandler: () => {
        console.log("processing");
      },
    },
    analyzing: {
      message: "Analyzing...",
      className: "text-primary bg-secondary text-sm leading-6 normal font-medium ",
      spinner: true,
      secondaryBtnHandler: () => {
        console.log("analyzing");
      },
    },
    orchestrating: {
      message: "Orchestrating...",
      className: "text-primary bg-secondary text-sm leading-6 normal font-medium ",
      spinner: true,
      secondaryBtnHandler: () => {
        console.log("orchestrating");
      },
    },
    unsavedChanges: {
      icon: <WarningIcon className="size-4" weight="fill" />,
      message: "Unsaved Changes",
      className: "text-primary bg-destructive/50 border border-destructive text-sm leading-6 normal font-medium",
      secondaryBtnHandler: () => {
        setContextualMenuActiveAction("idle");
      },
      secondaryBtnIcon: <X className="size-4" />,
      spinner: false,
    },
    tryingToConnect: {
      icon: <CloudArroUp className="size-4" />,
      message: "Trying To Connect",
      className: "text-primary bg-destructive/50 border border-destructive text-sm leading-6 normal font-medium",
      secondaryBtnHandler: () => {
        setContextualMenuActiveAction("idle");
      },
      secondaryBtnIcon: <X className="size-4" />,
      spinner: false,
    },
    idle: {
      icon: null,
      message: "",
      className: "",
    },
  };
  const currentStatus = (contextualMenuActiveAction as StatusType) || "idle";

  const config = statusConfigs[currentStatus];

  if (currentStatus === "idle") return null;
  const {
    message,
    className,
    icon,
    onClick,
    description,
    secondaryBtnHandler,
    secondaryBtnIcon = <StopIcon size={16} weight="fill" />,
    spinner = false,
  } = config;
  if (onClick || secondaryBtnHandler) {
    return (
      <div
        className={cn(
          "bg-secondary flex justify-center gap-0 items-center rounded-md overflow-hidden justify-self-center pointer-events-auto",
          className
        )}
      >
        <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={onClick}>
          <div
            className={cn(
              "flex items-center justify-center px-3 py-2 gap-1 ",
              !["unsavedChanges", "tryingToConnect"].includes(currentStatus) &&
                (secondaryBtnHandler ? "border-r-2 border-r-border" : "border-none bg-accent")
            )}
          >
            {icon}
            <p className="leading-6 font-medium text-foreground text-sm">{message}</p>
            {spinner && <SpinnerGapIcon className="animate-spinSlow text-foreground" />}
          </div>
        </Button>

        {secondaryBtnHandler && (
          <Button
            className="h-fit p-3 rounded-none"
            variant={"link"}
            size={"sm"}
            role="button"
            aria-label="Stop process"
            onClick={secondaryBtnHandler}
          >
            <>{secondaryBtnIcon}</>
          </Button>
        )}
      </div>
    );
  } else {
    return (
      <Alert className="p-4 bg-secondary border-muted rounded-lg">
        <AlertDescription className={cn("flex items-center justify-center gap-3 text-foreground leading-6 text-base", className)}>
          {icon}
          <div className="flex flex-col">
            {message}
            <span className="text-sm text-muted-foreground">{description}</span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
}
