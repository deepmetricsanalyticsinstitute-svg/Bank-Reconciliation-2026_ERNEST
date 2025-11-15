import React from 'react';

type ModelType = 'flash' | 'pro';

interface ModelToggleProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export const ModelToggle: React.FC<ModelToggleProps> = ({ selectedModel, onModelChange }) => {
  const baseClasses = "px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800";
  const activeClasses = "bg-indigo-600 text-white shadow";
  const inactiveClasses = "bg-slate-700 text-slate-300 hover:bg-slate-600";

  return (
    <div>
        <div className="text-center mb-2">
            <h4 className="text-md font-semibold text-slate-200">Processing Mode</h4>
            <p className="text-xs text-slate-400">'Accuracy' is better for complex files.</p>
        </div>
        <div className="flex items-center p-1 bg-slate-900/80 rounded-lg border border-slate-700">
            <button
                onClick={() => onModelChange('flash')}
                className={`${baseClasses} ${selectedModel === 'flash' ? activeClasses : inactiveClasses}`}
                aria-pressed={selectedModel === 'flash'}
            >
                Speed
            </button>
            <button
                onClick={() => onModelChange('pro')}
                className={`${baseClasses} ${selectedModel === 'pro' ? activeClasses : inactiveClasses}`}
                aria-pressed={selectedModel === 'pro'}
            >
                Accuracy
            </button>
        </div>
    </div>
  );
};
