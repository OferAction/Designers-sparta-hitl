import { useEffect } from "react";

import { useFormContext, Path, PathValue, RegisterOptions } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils";

interface FormFieldProps<T extends Record<string, any>, K extends Path<T> = Path<T>> {
  name: K;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  defaultValue?: PathValue<T, K>;
  validate?: RegisterOptions<T, K>["validate"];
}

export function FormField<T extends Record<string, any>, K extends Path<T> = Path<T>>({
  name,
  label,
  placeholder,
  disabled,
  required,
  children,
  defaultValue,
  validate,
}: React.PropsWithChildren<FormFieldProps<T, K>>) {
  const {
    register,
    formState: { errors },
    setValue,
    getFieldState,
  } = useFormContext<T>();

  useEffect(() => {
    if (defaultValue === undefined) return;
    const { isDirty } = getFieldState(name);
    if (!isDirty) {
      setValue(name, defaultValue);
    }
  }, [defaultValue, name, setValue, getFieldState]);

  return (
    <>
      <Label htmlFor={name} className={cn(disabled && "pointer-events-none")}>
        {label}
        {required && "*"}
      </Label>
      {children ?? (
        <Input
          variant="tag"
          id={name}
          placeholder={placeholder}
          className="bg-background border-input enabled:hover:border-muted-foreground"
          disabled={disabled}
          defaultValue={defaultValue}
          {...register(name, { required: required ? `${label} is required` : false, validate })}
        />
      )}
      {errors[name] && <span className="text-xs text-destructive col-start-2 -my-2">{String(errors[name]?.message ?? "")}</span>}
    </>
  );
}

export function createTypedFormField<T extends Record<string, any>>() {
  return function TypedFormField<K extends Path<T>>(props: React.PropsWithChildren<FormFieldProps<T, K>>) {
    return <FormField<T, K> {...props} />;
  };
}
