"use client";

export default function DataTable({ columns, data = [], actions = [] }) {
  return (
    <table className="min-w-full border text-sm table-fixed">
      <thead>
        <tr>
          {columns.map((col) => {
            const columnStyle = col.style || (col.width ? { width: col.width } : undefined);
            const headerClassName = col.headerClassName || "border px-2 py-1";
            return (
              <th key={col.key} className={headerClassName} style={columnStyle}>
                {col.label}
              </th>
            );
          })}
          {actions.length > 0 && <th className="border px-2 py-1">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length + actions.length}
              className="text-center py-2"
            >
              No data
            </td>
          </tr>
        ) : (
          data?.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => {
                const columnStyle = col.style || (col.width ? { width: col.width } : undefined);
                const cellClassName = col.cellClassName || "border px-2 py-1";
                const wrapperClassName = col.contentClassName || "break-words whitespace-pre-line";
                return (
                  <td key={col.key} className={`${cellClassName} align-top`} style={columnStyle}>
                    <div className={`${wrapperClassName} w-full`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </div>
                  </td>
                );
              })}
              {actions.length > 0 && (
                <td className="border px-2 py-1 flex gap-2 align-top">
                  {actions.map((action, idx) => (
                    <span key={idx}>{action.key({ row })}</span>
                  ))}
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
