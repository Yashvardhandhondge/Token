import React, { useState, useEffect, useRef } from "react";

import QrScanner from "qr-scanner";
const QrScannerComponent: React.FC<{
  onScan: (data: string | null) => void;
}> = ({ onScan }) => {
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleScan = (data: string) => {
      onScan(data);
      if (scanner) scanner.stop();
    };
    if (videoRef.current && !scanner) {
      setScanner(
        new QrScanner(videoRef.current, (result) => handleScan(result.data), {
          onDecodeError: (error) => {
            console.log(error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }),
      );
    }
    if (scanner) scanner.start();
    return () => {
      if (scanner) scanner.stop();
    };
  }, [onScan, scanner]);

  return (
    <div className="flex flex-col items-center">
      <video id="qr-video" ref={videoRef} />
    </div>
  );
};

export default QrScannerComponent;
