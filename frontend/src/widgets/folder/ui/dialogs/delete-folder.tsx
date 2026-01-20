"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogActions } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { DialogProps } from "@/widgets/folder/ui/dialogs/dialog-props";
import { deleteFolder } from "@/features/folder/api";

export function DeleteFolderDialog({ ref, currentFolderId }: DialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFolderId) return;

    try {
      setIsSubmitting(true);
      setApiError(undefined);

      await deleteFolder(currentFolderId);

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Failed to delete folder",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setApiError(undefined);
  };

  return (
    <Dialog
      ref={ref}
      title='Delete Folder'
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setApiError(undefined);
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className='mb-6'>
          <p className='text-base text-slate-300'>
            Are you sure you want to delete this folder and all its contents?
            This action is irreversible.
          </p>
          {apiError && <p className='mt-2 text-sm text-red-400'>{apiError}</p>}
        </div>

        <DialogActions>
          <Button
            type='button'
            onClick={handleClose}
            className='bg-slate-700 hover:bg-slate-600'
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type='submit'
            disabled={isSubmitting}
            className='bg-red-600 hover:bg-red-700'
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
