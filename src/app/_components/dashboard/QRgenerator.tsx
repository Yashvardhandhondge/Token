// pages/qr-code.tsx

import React, { useState } from 'react';
import QRCode from 'qrcode.react';

const QRCodeGenerator: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h1>QR Code Generator</h1>
      {/* <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Enter a number"
        style={{ padding: '10px', fontSize: '16px', marginBottom: '20px' }}
      /> */}
      {inputValue && <QRCode value={inputValue} />}
    </div>
  );
};

export default QRCodeGenerator;
