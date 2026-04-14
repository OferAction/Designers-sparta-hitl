import * as Portal from "@radix-ui/react-portal";

import { GenOneIcon } from "@/lib/icons";

const GenOneLoading = () => {
  return (
    <Portal.Root>
    <div className="absolute inset-0 h-screen bg-background/85 flex items-center justify-center z-50">
      <div className="p-6 rounded-lg flex flex-col items-center gap-4 ml-[220px]">
         <GenOneIcon className="size-4" />
        <p className="bg-ai-gradient text-gradient">ActOne is processing...</p>
      </div>
      </div>
    </Portal.Root>
  );
};

export default GenOneLoading;
