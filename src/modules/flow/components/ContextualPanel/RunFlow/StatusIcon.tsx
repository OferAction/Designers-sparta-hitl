import { CheckIcon, XIcon } from "@phosphor-icons/react";

import { Loader } from "@/components/common/Loader";
import { NodeStatus } from "@/store/slices";

interface StatusIconProps {
  status: NodeStatus;
}

export const StatusIcon = ({ status }: StatusIconProps) => {
  switch (status) {
    case "running":
      return (
        <div className="flex items-center justify-center w-5 h-5 rounded-md">
          <Loader size={12} className="flex items-center justify-center rounded-md animate-spin" />
        </div>
      );
    case "success":
      return (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-success/10">
          <CheckIcon size={12} weight="regular" className="text-success" />
        </div>
      );

    case "error":
      return (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-destructive/10">
          <XIcon size={12} weight="regular" className="text-destructive" />
        </div>
      );
    case "idle":
    default:
      return <div />;
  }
};
