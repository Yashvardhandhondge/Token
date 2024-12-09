import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import QrScanner from "@/app/_components/common/QrScanner";

const ScanDialog = ({
  handleSearch,
  scanIcon
}: {
  handleSearch: (userId: string) => void;
  scanIcon?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const handleScan = (data: string | null) => {
    if (data) {
      handleSearch(data);
      console.log("QR Code Result:", data); // Log to console
      setOpen(false);
    }
  };
  return (
    <Dialog defaultOpen={open} open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogTrigger asChild>
        <button className="h-10 rounded-[10px] border text-white border-[#38F68F] px-4 py-2 text-[14px] focus:outline-none">
        {scanIcon ? scanIcon : "Scan QR Code"}
        </button>
      </DialogTrigger>
      <DialogContent className="h-[90vh] w-screen border-0 bg-[#262626ED] md:w-screen md:max-w-fit text-white">
        <DialogTitle className="mb-4 text-2xl font-bold">
          QR Code Scanner
        </DialogTitle>
        <QrScanner onScan={handleScan} />
      </DialogContent>
    </Dialog>
  );
};

export default ScanDialog;