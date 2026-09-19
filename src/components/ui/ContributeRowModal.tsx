// src/components/ui/ContributeRowModal.tsx
import React, { useState } from 'react';

interface ContributeRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: Record<string, string>;
  exampleRow: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export const ContributeRowModal: React.FC<ContributeRowModalProps> = ({
  isOpen,
  onClose,
  schema,
  exampleRow,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string, type: string) => {
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    } else if (type === 'boolean') {
      parsedValue = value === 'true';
    }
    setFormData((prev) => ({ ...prev, [field]: parsedValue }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await onSubmit(formData);
      setFormData({});
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit row.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#343536] bg-[#1A1A1B] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#343536] pb-3">
          <h2 className="text-base font-bold text-[#D7DADC]">Contribute Dataset Row</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#818384] hover:text-[#D7DADC] text-sm"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-red-900/40 border border-red-800 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="mt-4 flex flex-col gap-3">
          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {Object.entries(schema).map(([field, type]) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#D7DADC] flex justify-between">
                  <span>{field}</span>
                  <span className="text-[10px] text-[#818384] font-mono">({type})</span>
                </label>

                {type === 'boolean' ? (
                  <select
                    value={String(formData[field] ?? 'true')}
                    onChange={(e) => handleChange(field, e.target.value, type)}
                    className="w-full rounded-md border border-[#343536] bg-[#272729] px-3 py-2 text-xs text-[#D7DADC] focus:border-[#FF4500] focus:outline-none"
                  >
                    <option value="true">True / Yes</option>
                    <option value="false">False / No</option>
                  </select>
                ) : (
                  <input
                    type={type === 'number' ? 'number' : 'text'}
                    placeholder={`e.g. ${exampleRow[field] ?? ''}`}
                    value={formData[field] ?? ''}
                    onChange={(e) => handleChange(field, e.target.value, type)}
                    required
                    className="w-full rounded-md border border-[#343536] bg-[#272729] px-3 py-2 text-xs text-[#D7DADC] focus:border-[#FF4500] focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end gap-2 border-t border-[#343536] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#343536] px-4 py-1.5 text-xs font-semibold text-[#818384] hover:bg-[#272729] hover:text-[#D7DADC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#FF4500] px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#E03D00] disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Row'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};