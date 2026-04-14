import { EyeIcon } from "@phosphor-icons/react";

import { Button, ButtonProps } from "@/components/ui/button";

export const VHViewButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      variant="secondary"
      size="icon"
      className="mr-1 hidden group-hover/item:bg-accent group-hover/item:text-accent-foreground group-hover/item:flex"
      {...props}
    >
      <EyeIcon size={16} />
    </Button>
  );
};
