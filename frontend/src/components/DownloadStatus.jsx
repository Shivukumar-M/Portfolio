import React, { useState } from 'react';

const DownloadStatus = () => {
  const [showStatus, setShowStatus] = useState(false);

  const handleDownloadClick = () => {
    setShowStatus(true);
    setTimeout(() => setShowStatus(false), 5000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showStatus && (
        <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <i className="fas fa-check-circle"></i>
          <span>Portfolio code is being prepared for download...</span>
        </div>
      )}
    </div>
  );
};

export default DownloadStatus;