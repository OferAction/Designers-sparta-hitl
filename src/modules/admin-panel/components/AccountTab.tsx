import { useCallback, useMemo } from "react";

import { useToast } from "@/hooks/use-toast";

import { AccountProfileSection } from "./AccountProfileSection";
import DarkThemeImage from "@/assets/themes/dark.png";
import LightThemeImage from "@/assets/themes/light.png";
import SystemThemeImage from "@/assets/themes/mex.png";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/contexts";
import { SettingsTabLayout } from "@/layouts";
import { useGetUserProfile, useUpdateProfile } from "@/services/securityService";
import { cn } from "@/utils";

const themeOptions = [
  { value: "0", label: "System theme", image: SystemThemeImage },
  { value: "1", label: "Light", image: LightThemeImage },
  { value: "2", label: "Dark", image: DarkThemeImage },
] as const;

const THEMES = ["system", "light", "dark"] as const;

interface AccountTabProps {
  handleBack: () => void;
}

export const AccountTab = ({ handleBack }: AccountTabProps) => {
  const { toast } = useToast();
  const { data: currentUser } = useGetUserProfile();

  const { mutate: mutateUpdateProfile, isPending } = useUpdateProfile();
  const { name = "", email = "", profilePicture: avatar = undefined, roleName: role = "" } = currentUser || {};
  const { colorMode, setColorMode } = useTheme();

  const themeValue = useMemo(() => String(THEMES.indexOf(colorMode)), [colorMode]);

  const handleSaveActions = useCallback(async () => {
    const formData = new FormData();
    formData.append("Theme", String(themeValue));

    mutateUpdateProfile(formData, {
      onSuccess: () => {
        toast({ title: "Success", description: "Profile updated successfully" });
      },
      onError: (err) => {
        console.error("Failed to update profile", err);
        toast({ title: "Update failed", description: "Could not save profile changes", variant: "destructive" });
      },
    });
  }, [mutateUpdateProfile, themeValue, toast]);

  return (
    <SettingsTabLayout title="Account">
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="grid md:grid-cols-8 gap-6 px-6 py-8 border-b border-sidebar-border">
          <div className="col-span-2 flex flex-col">
            <span className="text-base text-foreground leading-7">Profile Information</span>
            <span className="text-sm text-muted-foreground leading-5">Manage your name, email, role, and profile picture</span>
          </div>
          <AccountProfileSection className="col-span-6" name={name} email={email} roleBio={role ?? ""} avatar={avatar} showRoleBio={true} />
        </div>
        <div className="grid md:grid-cols-8 gap-6 px-6 py-8">
          <div className="col-span-2 flex flex-col">
            <span className="text-base text-foreground leading-7">Appearance Settings</span>
            <span className="text-sm text-muted-foreground leading-5">Select your preferred theme for the interface</span>
          </div>
          <div className="col-span-6 flex flex-col gap-3">
            <span className="text-foreground text-sm">Themes</span>
            <div className="flex justify-between gap-6">
              <RadioGroup
                className="w-full flex gap-6"
                value={themeValue}
                onValueChange={(value) => {
                  setColorMode(THEMES[Number(value)]);
                }}
              >
                {themeOptions.map((theme) => (
                  <Label
                    key={theme.value}
                    className={cn(
                      "flex flex-1 flex-col items-center justify-between gap-2 p-3 border border-sidebar-border rounded-lg cursor-pointer",
                      themeValue === theme.value && "border border-sidebar-accent-foreground"
                    )}
                    htmlFor={`theme-${theme.value}`}
                  >
                    <div className="flex gap-2 justify-center items-center">
                      <RadioGroupItem key={theme.value} value={theme.value} id={`theme-${theme.value}`}></RadioGroupItem>
                      <span>{theme.label}</span>
                    </div>
                    <img src={theme.image} alt={theme.label} className="w-40 h-22 rounded-sm" />
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center py-4 border-t border-sidebar-border px-6">
        <Button variant="outline" onClick={handleBack}>
          Cancel
        </Button>
        <Button variant="purple" onClick={handleSaveActions} disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </SettingsTabLayout>
  );
};

export default AccountTab;
