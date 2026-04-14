import { ReactNode } from "react";

import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ConditionalFieldProps<P> = P extends Record<string, never> ? { fieldProps?: never } : { fieldProps: P };

type BaseBranchDialogProps<T extends FieldValues, P = Record<string, never>> = {
  onClose: () => void;
  title: string;
  description?: ReactNode;
  formMethods: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  submitButtonText: string;
  formFields: React.FC<P>[];
} & ConditionalFieldProps<P>;

export function BaseBranchDialog<T extends FieldValues, P = Record<string, never>>({
  onClose,
  title,
  description,
  formMethods,
  onSubmit,
  submitButtonText,
  formFields,
  fieldProps = {} as P,
}: BaseBranchDialogProps<T, P>) {
  const { handleSubmit } = formMethods;

  return (
    <Dialog modal={false} open={true} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 bg-muted/40 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-md bg-muted/40 backdrop-blur-[20px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="bg-border h-px -mx-6" />
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4">
            {formFields.map((Field, index) => (
              <Field key={index} {...fieldProps} />
            ))}

            <DialogFooter className="col-span-2 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{submitButtonText}</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
