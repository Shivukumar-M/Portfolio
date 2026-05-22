import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeCard({ username }) {
  if (!username) return null;

  const url = `${window.location.origin}/u/${username}`;

  const download = () => {
    const svg = document.getElementById('portfolio-qr');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${username}-portfolio-qr.png`;
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-5 text-center space-y-3">
      <h4 className="text-white font-semibold text-sm">Portfolio QR Code</h4>
      <div className="flex justify-center">
        <div className="bg-white p-3 rounded-xl inline-block">
          <QRCodeSVG id="portfolio-qr" value={url} size={140} level="H" />
        </div>
      </div>
      <p className="text-slate-400 text-xs">/u/{username}</p>
      <button
        onClick={download}
        className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mx-auto"
      >
        <i className="fas fa-download"></i> Download PNG
      </button>
    </div>
  );
}
