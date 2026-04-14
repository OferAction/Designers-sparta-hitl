import { useMemo, useState, useEffect } from "react";

import { FileCardDefaultIcon as FileCardDefaultSvg } from "@/lib/icons";

interface FileCardPreviewProps {
  thumbnail?: string;
}

const DefaultThumbnail = () => {
  const [ellipse1, ellipse2] = useMemo(() => {
    const edges = ["top", "right", "bottom", "left"] as const;
    const edge = edges[Math.floor(Math.random() * edges.length)];
    const pos = Math.random() * 90 + 10;

    let e1, e2;
    if (edge === "top") {
      e1 = { top: "0%", left: `${pos}%` };
      e2 = { top: "100%", left: `${100 - pos + 10}%` };
    } else if (edge === "bottom") {
      e1 = { top: "100%", left: `${pos}%` };
      e2 = { top: "0%", left: `${100 - pos + 10}%` };
    } else if (edge === "left") {
      e1 = { left: "0%", top: `${pos}%` };
      e2 = { left: "100%", top: `${100 - pos + 10}%` };
    } else {
      e1 = { left: "100%", top: `${pos}%` };
      e2 = { left: "0%", top: `${100 - pos + 10}%` };
    }
    return [e1, e2];
  }, []);

  return (
    <>
      {/* Ellipse 1 */}
      <div
        className="absolute w-[78%] h-[62%] bg-[#DA4791] opacity-10 rounded-full blur-[60px]"
        style={{
          top: ellipse1.top,
          left: ellipse1.left,
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Ellipse 2 (mirrored) */}
      <div
        className="absolute w-[78%] h-[62%] bg-[#52C5E0] opacity-10 rounded-full blur-[60px]"
        style={{
          top: ellipse2.top,
          left: ellipse2.left,
          transform: "translate(-50%, -50%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center z-5 ">
        <FileCardDefaultSvg className="w-full h-full" />
      </div>
    </>
  );
};

export const FileCardPreview = ({ thumbnail }: FileCardPreviewProps) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [thumbnail]);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden rounded-b-none rounded-t-xl">
      {thumbnail && !imgError ? (
        <img src={thumbnail} alt="Preview" className="relative z-0 w-full h-full object-cover origin-left" onError={() => setImgError(true)} />
      ) : (
        <DefaultThumbnail />
      )}
    </div>
  );
};
