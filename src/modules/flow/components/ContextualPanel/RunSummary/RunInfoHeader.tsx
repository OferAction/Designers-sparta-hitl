import moment from "moment";

export interface RunInfoHeaderProps {
  startTime: string;
}

export const RunInfoHeader = ({ startTime }: RunInfoHeaderProps) => {
  return (
    <div className="flex flex-col w-full items-start mb-1">
      <span className="text-xs text-sidebar-foreground/70 justify-center flex leading-5 mb-2">{`Last run (${moment(startTime).fromNow()})`}</span>
    </div>
  );
};

export default RunInfoHeader;
