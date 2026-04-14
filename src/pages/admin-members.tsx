import SettingsTabLayout from "../layouts/SettingsPageLayout";
import { UsersTableView } from "../modules/admin-panel/components/dashboard/UsersTableView";

export const MembersTab = () => {
  return (
    <SettingsTabLayout title="Members">
      <div className="flex flex-col h-full">
        <div className="py-6 px-6 overflow-hidden h-full max-h-[calc(100vh-94px)]">
          <UsersTableView showFilter={false} />
        </div>
      </div>
    </SettingsTabLayout>
  );
};

export default MembersTab;
