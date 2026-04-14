import { useEffect } from "react";

import { useSearchParams } from "react-router-dom";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function VHFilteration() {
  const [searchParams, setSearchParams] = useSearchParams();
  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams);
  };

  useEffect(() => {
    return () => {
      setSearchParams({});
    };
  }, []);
  return (
    <div className="flex items-center  gap-3 text-sidebar-accent-foreground">
      <span className="text-sm text-popover-foreground">Show</span>
      <Select onValueChange={(val) => updateSearchParam("allUsers", val)}>
        <SelectTrigger className="w-fit bg-background text-foreground py-2.5 leading-5">
          <SelectValue placeholder="All users" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">All users</SelectItem>
          <SelectItem value="false">Only Yours</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(val) => updateSearchParam("SavedType", val)}>
        <SelectTrigger className="w-fit bg-background text-foreground py-2.5 leading-5">
          <SelectValue placeholder="All Versions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Versions</SelectItem>
          <SelectItem value="auto">Auto - save</SelectItem>
          <SelectItem value="publish">Publish Auto - save</SelectItem>
          <SelectItem value="manual">Manual - save</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default VHFilteration;
