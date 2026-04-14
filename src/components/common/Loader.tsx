import { SpinnerGapIcon } from "@phosphor-icons/react";

type Props = React.ComponentPropsWithoutRef<typeof SpinnerGapIcon> & { isFull?: boolean };

export const Loader = ({ isFull = false, ...props }: Props) => {
  if (isFull) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <SpinnerGapIcon className="animate-spin" size={16} {...props} />
      </div>
    );
  }
  return <SpinnerGapIcon className="animate-spin" size={16} {...props} />;
};
