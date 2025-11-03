/* ApprovalsMultiSelect.jsx — paste inline in your AddUniversityDialog component file (or import it) */
import { useState, useMemo } from "react";
import { Controller } from "react-hook-form";

function ApprovalsMultiSelect({ control, register, approvals = [], name = "approval_ids", defaultValue = [] }) {
  // approvals: [{ id, title }, ...]
  // defaultValue can be array of ids or objects; normalize to ids
  const normalizedDefault = useMemo(() => {
    if (!defaultValue) return [];
    if (Array.isArray(defaultValue) && defaultValue.length && typeof defaultValue[0] === "object") {
      return defaultValue.map((a) => a.id);
    }
    return Array.isArray(defaultValue) ? defaultValue : [];
  }, [defaultValue]);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">Approvals</label>

      <Controller
        name={name}
        control={control}
        defaultValue={normalizedDefault}
        render={({ field: { value = [], onChange } }) => {
          // value is array of ids
          const toggle = (id) => {
            const exists = value.some((v) => String(v) === String(id));
            if (exists) {
              onChange(value.filter((v) => String(v) !== String(id)));
            } else {
              onChange([...value, id]);
            }
          };

          return (
            <>
              {/* Dropdown-like list */}
              <div className="relative">
                <div className="w-full border rounded bg-white p-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* show tags inside the box as hint */}
                    {value.length === 0 ? (
                      <span className="text-gray-400 text-sm">Select approvals...</span>
                    ) : (
                      value.map((id) => {
                        const opt = approvals.find((a) => String(a.id) === String(id));
                        return (
                          <span key={id} className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded">
                            <span>{opt ? opt.title : id}</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* dropdown list: you can style this as a dropdown menu */}
                <div className="mt-2 border rounded bg-white max-h-48 overflow-auto">
                  {approvals.map((a) => {
                    const checked = value.some((v) => String(v) === String(a.id));
                    return (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => toggle(a.id)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between ${
                          checked ? "bg-gray-100" : ""
                        }`}
                      >
                        <span>{a.title}</span>
                        <input
                          readOnly
                          type="checkbox"
                          checked={checked}
                          className="pointer-events-none"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected tags with remove button (below the dropdown) */}
              {value.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {value.map((id) => {
                    const opt = approvals.find((a) => String(a.id) === String(id));
                    return (
                      <span key={id} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
                        <span>{opt ? opt.title : id}</span>
                        <button
                          type="button"
                          onClick={() => onChange(value.filter((v) => String(v) !== String(id)))}
                          className="text-xs px-1"
                          aria-label={`Remove ${opt ? opt.title : id}`}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </>
          );
        }}
      />
    </div>
  );
}

export default ApprovalsMultiSelect;
