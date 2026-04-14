import React from "react";

import { cn } from "@/utils";

type Props = React.PropsWithChildren<React.HTMLAttributes<HTMLElement>> & {
  padBottom?: boolean;
};
export const SectionContainer: React.FC<Props> = ({ children, className, padBottom = true, ...rest }) => {
  return (
    <section className={cn("px-4 border-b border-sidebar-border bg-sidebar", className, { "pb-3": padBottom })} {...rest}>
      {children}
    </section>
  );
};
