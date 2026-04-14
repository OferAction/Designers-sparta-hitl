import moment from "moment";

import { LogItem } from "@/modules/flow/services/jobService/types";
import { cn } from "@/utils";

export default function LogTable({ logs }: { logs: LogItem[] }) {
  const levelColors = {
    INFO: "text-foreground",
    DEBUG: "text-teal-500",
    WARNING: "text-warning",
    ERROR: "text-destructive",
    CRITICAL: "text-destructive-hover-destructive font-bold",
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = moment(timestamp);

      const format = date.format("YYYY-MM-DD HH:mm:ss,SSS");
      return format;
    } catch {
      return timestamp;
    }
  };

  return (
    <table className="table-auto w-full border-separate">
      <tbody>
        {logs.map((log, idx) => (
          <tr key={idx} className={cn("pr-4 whitespace-nowrap text-xs align-top", levelColors[log.logLevel] || "text-foreground")}>
            <td className="!text-muted-foreground font-roboto-mono">{formatTimestamp(log.engineTime)}&nbsp;</td>
            <td className="font-roboto-mono">[{log.logLevel}]&nbsp;</td>
            <td className="font-roboto-mono">
              <span>{log.serviceName}&nbsp;</span>
            </td>
            <td className="font-roboto-mono whitespace-normal break-words">{log.message}&nbsp;</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
