import { FileCardPreview } from "./FileCardPreview";
import { cn } from "@/utils";

interface CardPreviewProps {
  thumbnail?: (string | undefined)[] | string;
  className?: string;
}

export function CardPreview({ thumbnail, className }: CardPreviewProps) {
  if (Array.isArray(thumbnail)) {
    return (
      <div className={cn("grid grid-cols-2 gap-2 aspect-[16/9]", className)}>
        {thumbnail.map((image, index) => (
          <div key={index} className="w-full overflow-hidden rounded-sm aspect-[16/9] relative">
            <FileCardPreview thumbnail={image} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-sm h-full aspect-[16/9] relative">
      <FileCardPreview thumbnail={thumbnail} />
    </div>
  );
}
