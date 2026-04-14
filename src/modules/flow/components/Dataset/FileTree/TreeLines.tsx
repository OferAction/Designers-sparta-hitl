import { TreeLinesProps } from "./types";

export function TreeLines({ level, hasChildren, isLast }: TreeLinesProps) {
  if (level === 0) {
    return hasChildren ? <div className="absolute left-4 bottom-0 w-px h-[20px] bg-border inline-block"></div> : null;
  }

  const indentationLevels = Array.from({ length: level }, (_, index) => index);

  return (
    <div className="absolute left-4 top-0 space-x-4 h-full">
      {indentationLevels.map((levelIndex) => {
        const isCurrentLevel = levelIndex === level - 1;
        const isParentLevel = levelIndex < level - 1;

        if (isParentLevel) {
          return <div key={levelIndex} className="w-px h-full bg-border inline-block" />;
        }

        if (isCurrentLevel) {
          if (isLast) {
            return (
              <div key={levelIndex} className="relative">
                <div className="absolute w-px h-[29px] top-0 bg-border inline-block"></div>
                <div className="absolute left-0 bottom-[26px] w-[8px] h-px bg-border inline-block"></div>
              </div>
            );
          } else if (hasChildren) {
            return <div key={levelIndex} className="absolute w-px h-[20px] bottom-0 bg-border inline-block" />;
          } else {
            return <div key={levelIndex} className="w-px h-full bg-border inline-block" />;
          }
        }

        return null;
      })}
    </div>
  );
}
