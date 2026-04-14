import { useLayoutEffect } from "react";

import { CaretUpDownIcon } from "@phosphor-icons/react";

import { useTerminal } from "@/components/common/CodeTerminal/context";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { NonNullableOption as Option } from "@/components/ui/input-tag";

export const ChangeLanguage = ({
  options,
  onChange,
  initialValue,
  value: controlledValue,
  iconClassName,
}: {
  options: Option[];
  onChange?: (language: Option) => void;
  initialValue?: string;
  value?: string;
  iconClassName?: string;
}) => {
  const { setLanguage, language: uncontrolledValue } = useTerminal();
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const currentLanguage = options.find((option) => option.value === value);

  useLayoutEffect(() => {
    if (initialValue) {
      setLanguage(initialValue);
    }
  }, [initialValue, setLanguage]);

  const handleChange = (language: Option) => {
    if (!isControlled) {
      setLanguage(language.value);
    }
    onChange?.(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center justify-center w-fit h-full py-0 px-2 text-sm text-muted-foreground font-medium hover:bg-transparent">
          <CaretUpDownIcon className={iconClassName} />
          {currentLanguage?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => handleChange(option)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
