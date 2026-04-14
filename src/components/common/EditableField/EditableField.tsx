import { useMemo, useState, useRef, useCallback, useEffect, type MouseEvent } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useEditableFieldContextSelector } from "@/components/common/EditableField/EditableFieldContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, genId } from "@/utils";

const nameSchema = z.string().max(50, "Name must be less than 50 characters").nonempty("Name cannot be empty");

type FormValues = {
  fieldValue: string;
};

interface EditableFieldProps {
  currentValue: string;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  maxLineLength?: number;
  useMultiline?: boolean;
  style?: React.CSSProperties;
  inputClassName?: string;
  highlightParts?: { text: string; isHighlight: boolean }[];
}

export function EditableField({
  currentValue,
  className,
  id,
  children,
  maxLineLength = 20,
  useMultiline = false,
  style = {},
  inputClassName = "",
  highlightParts,
}: EditableFieldProps) {
  const {
    isEditing: controlledIsEditing,
    onEditingChange,
    onEditEnd,
    schema = nameSchema,
    autoFocusOnEdit = false,
    selectTextOnFocus = false,
  } = useEditableFieldContextSelector((ctx) => ({
    isEditing: ctx.isEditing,
    onEditingChange: ctx.onEditingChange,
    onEditEnd: ctx.onEditEnd,
    onEditStart: ctx.onEditStart,
    schema: ctx.schema,
    autoFocusOnEdit: ctx.autoFocusOnEdit,
    selectTextOnFocus: ctx.selectTextOnFocus,
  }));

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    reset,
    watch,
  } = useForm<FormValues>({
    values: {
      fieldValue: currentValue,
    },
    resolver: zodResolver(z.object({ fieldValue: schema })),
    mode: "onChange",
  });

  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const watchedValue = watch("fieldValue");

  const isControlled = controlledIsEditing !== undefined;
  const isEditing = isControlled ? controlledIsEditing : internalIsEditing;

  const inputId = useMemo(() => id || `editable-field-${genId()}`, [id]);

  const onSubmit = (data: FormValues) => {
    if (data.fieldValue !== currentValue && isValid) {
      onEditEnd?.(data.fieldValue);
    }
    const shouldReset = !isValid;
    handleEditEnd(shouldReset);
  };

  const handleEditEnd = (resetValue = false) => {
    if (!isControlled) setInternalIsEditing(false);
    onEditingChange?.(false);
    if (resetValue) reset({ fieldValue: currentValue });
  };

  const maxLength = useMemo(() => {
    if (schema && typeof schema === "object" && "_def" in schema) {
      const def = (schema as any)._def;
      if (def.checks) {
        const maxCheck = def.checks.find((check: any) => check.kind === "max");
        if (maxCheck) return maxCheck.value;
      }
    }
    return 500;
  }, [schema]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const currentLength = e.currentTarget.value.length;

    if (e.key === "Enter" && !errors.fieldValue && !isOverLimit) {
      if (useMultiline && e.shiftKey) {
        return;
      } else if (!useMultiline || (useMultiline && !e.shiftKey)) {
        e.preventDefault();
        handleSubmit(onSubmit)();
        return;
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleEditEnd(true);
      return;
    }

    if (useMultiline && maxLength && currentLength >= maxLength) {
      const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Tab", "Escape"];
      if (!allowedKeys.includes(e.key) && e.key.length === 1) {
        e.preventDefault();
        setIsOverLimit(true);
        return;
      }
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (useMultiline) {
      const currentLength = e.currentTarget.value.length;

      if (maxLength && currentLength > maxLength) {
        setIsOverLimit(true);
        e.currentTarget.value = e.currentTarget.value.slice(0, maxLength);
        e.currentTarget.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (maxLength && currentLength === maxLength) {
        setIsOverLimit(true);
      } else {
        setIsOverLimit(false);
      }
    }
  };

  const handleEditingBackgroundAction = (e: MouseEvent) => {
    e.stopPropagation();
    onSubmit(getValues());
  };

  const { ref: rhfRef, ...fieldReg } = register("fieldValue");

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const setInputRef = useCallback(
    (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      inputRef.current = el;
      rhfRef(el);

      if (el && isEditing && autoFocusOnEdit) {
        if (selectTextOnFocus && "select" in el) {
          (el as HTMLInputElement | HTMLTextAreaElement).select();
        } else {
          el.focus();
        }
      }
    },
    [rhfRef, isEditing, autoFocusOnEdit, selectTextOnFocus]
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const el = inputRef.current;
      el.scrollLeft = el.scrollWidth;
    }
  }, [isEditing]);

  return (
    <div className={cn("flex items-center min-w-0 relative", className)} onDoubleClick={(e) => e.stopPropagation()}>
      {isEditing ? (
        <>
          <div className="fixed left-0 top-0 w-screen h-screen z-[100] cursor-default" onClick={handleEditingBackgroundAction} />
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit(onSubmit)} className="w-full z-[110]">
            <div className="relative">
              <TooltipProvider>
                <Tooltip open={!!errors.fieldValue || (useMultiline && isOverLimit)}>
                  <TooltipTrigger asChild>
                    {useMultiline ? (
                      <Textarea
                        {...fieldReg}
                        autoComplete="off"
                        autoFocus
                        ref={setInputRef}
                        data-editable-field-input={inputId}
                        onInput={handleInput}
                        onBlur={() => {
                          if (getValues("fieldValue") !== currentValue && isValid) {
                            onEditEnd?.(getValues("fieldValue"));
                          }
                          handleEditEnd(!isValid);
                        }}
                        onKeyDown={handleKeyDown}
                        className={cn(
                          "mb-1 min-h-[2.5rem] py-1 px-1 text-base md:text-base leading-7 bg-background border-none focus-visible:ring-offset-background resize-none",
                          (errors.fieldValue || (useMultiline && isOverLimit)) && "focus-visible:ring-destructive"
                        )}
                        rows={Math.min(3, Math.ceil((watchedValue || currentValue).length / maxLineLength))}
                        style={style}
                      />
                    ) : (
                      <Input
                        {...fieldReg}
                        type="text"
                        autoComplete="off"
                        autoFocus
                        ref={setInputRef}
                        variant="tag"
                        data-editable-field-input={inputId}
                        onInput={handleInput}
                        onBlur={() => {
                          if (getValues("fieldValue") !== currentValue && isValid) {
                            onEditEnd?.(getValues("fieldValue"));
                          }
                          handleEditEnd(!isValid);
                        }}
                        onKeyDown={handleKeyDown}
                        className={cn(
                          "h-auto py-1 px-1 pr-[5px] text-base md:text-base leading-7 bg-background border-none focus-visible:ring-offset-background",
                          (errors.fieldValue || (useMultiline && isOverLimit)) && "focus-visible:ring-destructive",
                          inputClassName
                        )}
                        style={style}
                      />
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-destructive text-destructive-foreground border-destructive">
                    <p>{(errors.fieldValue?.message as string) || (useMultiline && isOverLimit ? `Maximum ${maxLength} characters allowed` : "")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </form>
        </>
      ) : (
        children || (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-primary text-base font-normal leading-7 cursor-pointer truncate min-w-0 w-full">
                  {highlightParts
                    ? highlightParts.map((part, index) =>
                        part.isHighlight ? <strong key={index}>{part.text}</strong> : <span key={index}>{part.text}</span>
                      )
                    : currentValue}
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentValue}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      )}
    </div>
  );
}
