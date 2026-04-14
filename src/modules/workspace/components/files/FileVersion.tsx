import { Version } from "@/modules/workspace/types";

export function FileVersion({ version }: { version?: Version }) {
  const { major, minor, patch } = version || { major: 0, minor: 0, patch: 0 };
  return (
    <span className="font-bold text-[#BCC5D1]">
      V{major}.{minor}.{patch}
    </span>
  );
}
