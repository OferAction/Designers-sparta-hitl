import { XIcon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";

import { Loader } from "@/components/common/Loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils";

export type InputFieldVariant = "default";

export type InputFieldProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  validateUrl?: boolean;
  variant?: InputFieldVariant;
  disabled?: boolean;
  viewOnly?: boolean;
  name?: string;
  id?: string;
  className?: string;
  adding?: boolean;
  showLoader?: boolean;
};

function InputField({
  value = "",
  onChange,
  placeholder = "Paste URL",
  label = "Label",
  helperText = "Import from URL",
  error,
  variant = "default",
  disabled = false,
  name,
  id,
  className,
  showLoader = false,
}: InputFieldProps) {
  const inputClasses = cva("w-full rounded-md border transition-colors pl-3 pr-10 py-2", {
    variants: {
      variant: {
        default: "border-input bg-background focus:border-input",
      },
      hasError: {
        true: "border-destructive",
        false: "",
      },
      disabled: {
        true: "opacity-60 cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hasError: false,
      disabled: false,
    },
  });

  return (
    <div className="flex w-full max-w-xl flex-col gap-1.5">
      {label && (
        <Label htmlFor={id ?? name} className={cn(`text-sm text-foreground`, error && "text-destructive")}>
          {label}
        </Label>
      )}

      <div className="relative w-fit">
        <Input
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(inputClasses({ variant, hasError: !!error, disabled }), className)}
          disabled={disabled}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {showLoader && <Loader className="text-foreground" />}

          {value?.length > 0 && (
            <button type="button" onClick={() => onChange?.("")} className="group cursor-pointer text-foreground" aria-label="Clear">
              <XIcon size={16} />
            </button>
          )}
        </div>
      </div>

      {!error ? <div className="text-xs text-foreground">{helperText}</div> : <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}

export default InputField;
