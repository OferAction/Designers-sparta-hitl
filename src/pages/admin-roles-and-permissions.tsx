import { useCallback, useMemo, useRef } from "react";

import { ShareNetworkIcon } from "@phosphor-icons/react";
import { FormProvider, useForm } from "react-hook-form";

import {
  Permissions,
  PermissionsFooter,
  SpaceAndSharePolicies,
  type PermissionsFormValues,
} from "../modules/admin-panel/components/rolesAndPermissions";
import { Button } from "@/components/ui/button";
import { SettingsTabLayout } from "@/layouts";

const AdminRolesAndPermissions = () => {
  const buttonConfig = useMemo(
    () => ({
      label: "Share",
      icon: <ShareNetworkIcon size={16} className="text-purple-accent-foreground" />,
      variant: "purple",
      onClick: () => {},
    }),
    []
  );

  const methods = useForm<PermissionsFormValues>({
    defaultValues: {},
    shouldUnregister: false,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToPermissionTabs = useCallback(() => {
    const container = scrollContainerRef.current;
    const tabsEl = container?.querySelector<HTMLElement>("#permissions-tabs");
    if (!container || !tabsEl) return;

    container.scrollTo({
      top: tabsEl.offsetTop - container.offsetTop,
      behavior: "smooth",
    });
  }, []);

  return (
    <SettingsTabLayout
      title="Roles & Permissions"
      subtitle="Roles & Permissions"
      buttonConfig={
        <Button variant="purple" onClick={buttonConfig.onClick}>
          <div className="flex items-center gap-1">
            {buttonConfig.icon}
            <span className="text-purple-accent-foreground">{buttonConfig.label}</span>
          </div>
        </Button>
      }
    >
      <FormProvider {...methods}>
        <form className="flex min-h-0 flex-1 flex-col relative pb-[72px]">
          <div className="flex min-h-0 flex-1 flex-col">
            <div ref={scrollContainerRef} className="flex-1 overflow-auto flex flex-col gap-8 py-6 px-6">
              <SpaceAndSharePolicies />
              <Permissions onTabChange={scrollToPermissionTabs} />
            </div>
            <PermissionsFooter className="w-full" />
          </div>
        </form>
      </FormProvider>
    </SettingsTabLayout>
  );
};

export default AdminRolesAndPermissions;
