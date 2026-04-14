import moment from "moment";

import { FlowStoreState, useFlowStore } from "@/store";

const saveSelector = (state: FlowStoreState) => ({
  lastSaved: state.lastSaved,
});

export default function LastModified() {
  const { lastSaved } = useFlowStore(saveSelector);

  return (
    <div className="absolute top-3 right-5 flex items-center gap-3">
      {!!lastSaved && <span className="text-sidebar-foreground/70 font-medium text-xs leading-5">Last saved {moment(lastSaved).fromNow()}</span>}
    </div>
  );
}
