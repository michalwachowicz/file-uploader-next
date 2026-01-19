"use client";

import { Dialog, DialogActions } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import { DialogProps } from "@/widgets/folder/ui/dialogs/dialog-props";

export function UploadFileDialog({ ref, currentFolderId }: DialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  console.log("currentFolderId", currentFolderId);

  return (
    <Dialog
      ref={ref}
      title='Upload File'
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <form>
        <DialogActions>
          <Button
            type='button'
            onClick={handleClose}
            className='bg-slate-700 hover:bg-slate-600'
          >
            Cancel
          </Button>

          <Button type='submit'>
            Upload
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}