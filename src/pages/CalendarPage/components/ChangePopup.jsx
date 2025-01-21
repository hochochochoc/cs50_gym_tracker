import { CheckCircle2 } from "lucide-react";

const ChangePopup = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-80 overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="flex flex-col items-center p-8">
          <CheckCircle2 className="mb-6 h-16 w-16 text-emerald-500" />
          <h2 className="mb-2 text-2xl font-light text-gray-800">
            Plan Updated
          </h2>
          <p className="text-center text-emerald-600 text-opacity-80">
            Your changes have been successfully applied
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePopup;
