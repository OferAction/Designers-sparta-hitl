import { SpinnerIcon } from "@phosphor-icons/react";

type Props = React.ComponentPropsWithoutRef<typeof SpinnerIcon> & { isFull?: boolean };

export const Spinner = ({ isFull = false, ...props }: Props) => {
  if (isFull) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <SpinnerIcon className="animate-spin" size={16} {...props} />
      </div>
    );
  }
  return <SpinnerIcon className="animate-spin" size={16} {...props} />;
};
