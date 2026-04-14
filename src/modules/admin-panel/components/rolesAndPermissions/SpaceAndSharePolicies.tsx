import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_SHARE_POLICY, DEFAULT_SPACE_POLICIES } from "@/modules/admin-panel/types";

interface SpacePoliciesFormProps {
  disabled?: boolean;
}

export const SpaceAndSharePolicies = ({ disabled = true }: SpacePoliciesFormProps) => {
  const showDailyQuota = DEFAULT_SPACE_POLICIES.viewerRunPolicy === "Enabled with quota";

  return (
    <div className="flex flex-col border border-sidebar-border rounded-lg bg-card/50 p-6 gap-8 mb-7">
      <div className="flex flex-col mb-4">
        <div>
          <h3 className="text-2xl font-semibold text-card-foreground pb-6">
            Space policies
            <p className="text-sm font-normal text-muted-foreground ">These rules define how restricted permissions behave</p>
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 max-w-[50%] w-full">
            <Label htmlFor="deletion-policy" className="text-sm font-medium text-foreground">
              Deletion policy
            </Label>
            <Select value={DEFAULT_SPACE_POLICIES.deletionPolicy} disabled={disabled}>
              <SelectTrigger id="deletion-policy" className="bg-background border-input">
                <SelectValue placeholder="Select deletion policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin-only">Admin-only</SelectItem>
                <SelectItem value="Editors">Editors</SelectItem>
                <SelectItem value="Everyone">Everyone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row gap-4 w-full items-end">
            <div className="flex flex-wrap items-end gap-2 max-w-[50%] w-full flex-row mr-12">
              <Label htmlFor="viewer-run-policy" className="text-sm font-medium text-foreground">
                Viewer run policy
              </Label>
              <Select value={DEFAULT_SPACE_POLICIES.viewerRunPolicy} onValueChange={() => {}} disabled={disabled}>
                <SelectTrigger id="viewer-run-policy" className="bg-background border-input min-w-[200px]">
                  <SelectValue placeholder="Select viewer run policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disabled">Disabled</SelectItem>
                  <SelectItem value="Enabled with quota">Enabled with quota</SelectItem>
                  <SelectItem value="Unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showDailyQuota && (
              <div className="flex items-center gap-2 ">
                <Label htmlFor="daily-quota" className="text-sm font-medium whitespace-nowrap">
                  Daily quota
                </Label>
                <Input
                  id="daily-quota"
                  type="number"
                  min={1}
                  value={DEFAULT_SPACE_POLICIES.dailyQuota}
                  onChange={() => {}}
                  disabled={disabled}
                  className="w-16 bg-background border-input text-center"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">runs / user</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-card-foreground mb-1 pt-6 pb-8 ">Share policy</h3>
        <div className="flex flex-col gap-4 ">
          <div className="flex flex-row gap-4 w-full items-end max-w-[50%]">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <Label htmlFor="editor-policy" className="text-sm font-medium text-foreground">
                Editor
              </Label>
              <Select disabled={disabled} value={DEFAULT_SHARE_POLICY.editorPolicy} onValueChange={() => {}}>
                <SelectTrigger id="editor-policy" className="w-full bg-background border-input">
                  <SelectValue placeholder="Select editor policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Can share (view-only)">Can share (view-only)</SelectItem>
                  <SelectItem value="Cannot share">Cannot share</SelectItem>
                  <SelectItem value="Can share (edit)">Can share (edit)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <Label htmlFor="viewer-policy" className="text-sm font-medium text-foreground">
                Viewer
              </Label>
              <Select disabled={disabled} value={DEFAULT_SHARE_POLICY.viewerPolicy} onValueChange={() => {}}>
                <SelectTrigger id="viewer-policy" className="w-full bg-background border-input">
                  <SelectValue placeholder="Select viewer policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Request share (Admin approved)">Request share (Admin approved)</SelectItem>
                  <SelectItem value="Cannot request">Cannot request</SelectItem>
                  <SelectItem value="Can share (view-only)">Can share (view-only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-w-[50%] w-full">
            <Label htmlFor="subflow-edit-policy" className="text-sm font-medium text-foreground">
              Subflow edit policy
            </Label>
            <Select value={DEFAULT_SHARE_POLICY.subflowEditPolicy} onValueChange={() => {}} disabled={disabled}>
              <SelectTrigger id="subflow-edit-policy" className="bg-background border-input">
                <SelectValue placeholder="Select subflow edit policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Explicit permission required">Explicit permission required</SelectItem>
                <SelectItem value="Inherit from parent">Inherit from parent</SelectItem>
                <SelectItem value="Editors can edit">Editors can edit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceAndSharePolicies;
