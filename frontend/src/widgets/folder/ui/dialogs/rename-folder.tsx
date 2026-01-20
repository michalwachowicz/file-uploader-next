"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { renameFolderSchema, RenameFolderInput } from "@file-uploader/shared";
import { renameFolder } from "@/features/folder/api";
import { Dialog, DialogActions } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useRouter } from "next/navigation";
import { DialogProps } from "@/widgets/folder/ui/dialogs/dialog-props";

export function RenameFolderDialog({ ref, currentFolderId }: DialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<RenameFolderInput>({
    resolver: zodResolver(renameFolderSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  const onSubmitForm = async (data: RenameFolderInput) => {
    if (!currentFolderId) return;

    try {
      setIsSubmitting(true);
      setApiError(undefined);

      await renameFolder(currentFolderId, data);

      setIsOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Failed to rename folder",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
    setApiError(undefined);
  };

  return (
    <Dialog
      ref={ref}
      title='Rename Folder'
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          reset();
          setApiError(undefined);
        }
      }}
    >
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <div>
          <Input
            type='text'
            placeholder='Enter new folder name'
            label='New Folder Name'
            id='new-folder-name'
            {...register("name")}
            error={errors.name || apiError}
          />
        </div>

        <DialogActions>
          <Button
            type='button'
            onClick={handleClose}
            className='bg-slate-700 hover:bg-slate-600'
          >
            Cancel
          </Button>

          <Button type='submit' disabled={isSubmitting || !isValid}>
            {isSubmitting ? "Renaming..." : "Rename"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
