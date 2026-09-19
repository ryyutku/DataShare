// src/components/ui/SchemaBuilder.tsx
import React from 'react';
import type { DatasetField, FieldDataType } from '../../types/post';

interface SchemaBuilderProps {
  fields: DatasetField[];
  onChange: (fields: DatasetField[]) => void;
  goalCount: number;
  onGoalChange: (count: number) => void;
}

export const SchemaBuilder: React.FC<SchemaBuilderProps> = ({
  fields,
  onChange,
  goalCount,
  onGoalChange,
}) => {
  const handleAddField = () => {
    const newField: DatasetField = {
      id: crypto.randomUUID(),
      name: '',
      type: 'string',
      description: '',
      required: true,
      exampleValue: '',
    };
    onChange([...fields, newField]);
  };

  const handleUpdateField = (id: string, updates: Partial<DatasetField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleRemoveField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#1A1A1B] border border-[#343536] rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#343536] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[#D7DADC] uppercase tracking-wider flex items-center gap-2">
            <span>📋</span> Dataset Fields / Survey Schema
          </h3>
          <p className="text-xs text-[#818384] mt-0.5">
            Specify the columns or questions you want contributors to submit.
          </p>
        </div>

        {/* Target Responses / Rows Goal */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#818384] font-medium whitespace-nowrap">Target Rows:</label>
          <input
            type="number"
            min="10"
            step="10"
            value={goalCount}
            onChange={(e) => onGoalChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 bg-[#272729] text-[#D7DADC] text-xs px-2.5 py-1.5 rounded-lg border border-[#343536] focus:border-[#FF4500] focus:outline-none"
          />
        </div>
      </div>

      {/* Field Rows List */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-[#343536] rounded-lg text-xs text-[#818384]">
            No fields defined yet. Click below to add the first data column or survey question.
          </div>
        ) : (
          fields.map((field, idx) => (
            <div
              key={field.id}
              className="p-3 bg-[#272729]/60 border border-[#343536] rounded-lg flex flex-col md:flex-row items-start md:items-center gap-3 transition-all"
            >
              <span className="text-xs font-bold text-[#818384] w-5 text-center">{idx + 1}.</span>

              {/* Field Name */}
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Field name (e.g. price, city, photo_url)"
                  value={field.name}
                  onChange={(e) =>
                    handleUpdateField(field.id, {
                      name: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                    })
                  }
                  className="w-full bg-[#1A1A1B] text-[#D7DADC] text-xs rounded-md px-3 py-2 border border-[#343536] focus:border-[#FF4500] focus:outline-none font-mono"
                  required
                />
              </div>

              {/* Field Data Type */}
              <div className="w-full md:w-36">
                <select
                  value={field.type}
                  onChange={(e) =>
                    handleUpdateField(field.id, { type: e.target.value as FieldDataType })
                  }
                  className="w-full bg-[#1A1A1B] text-[#D7DADC] text-xs rounded-md px-2.5 py-2 border border-[#343536] focus:border-[#FF4500] focus:outline-none cursor-pointer"
                >
                  <option value="string">Text (string)</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean (Yes/No)</option>
                  <option value="date">Date</option>
                  <option value="image_url">Image / Media URL</option>
                </select>
              </div>

              {/* Example Value */}
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Example row value (e.g. $45,000)"
                  value={field.exampleValue}
                  onChange={(e) => handleUpdateField(field.id, { exampleValue: e.target.value })}
                  className="w-full bg-[#1A1A1B] text-[#D7DADC] text-xs rounded-md px-3 py-2 border border-[#343536] focus:border-[#FF4500] focus:outline-none"
                />
              </div>

              {/* Required Switch & Delete Button */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <label className="flex items-center gap-1.5 text-xs text-[#818384] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                    className="accent-[#FF4500] rounded"
                  />
                  Req.
                </label>

                <button
                  type="button"
                  onClick={() => handleRemoveField(field.id)}
                  className="text-[#818384] hover:text-red-400 p-1.5 hover:bg-[#1A1A1B] rounded transition"
                  title="Remove Field"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Field Button */}
      <button
        type="button"
        onClick={handleAddField}
        className="self-start px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#272729] hover:bg-[#343536] text-[#D7DADC] border border-[#343536] transition flex items-center gap-1.5"
      >
        <span className="text-[#FF4500] font-bold text-sm">+</span> Add Field
      </button>
    </div>
  );
};