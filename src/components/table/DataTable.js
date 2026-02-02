"use client";

export default function DataTable({ columns, data = [], actions = [] }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-lg bg-white">
      <table className="min-w-full text-sm table-auto divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 via-gray-50 to-gray-100">
          <tr>
            {columns.map((col) => {
              const columnStyle = col.style || (col.width ? { width: col.width } : undefined);
              const headerClassName = col.headerClassName || "px-6 py-4 text-left";
              return (
                <th 
                  key={col.key} 
                  className={`${headerClassName} text-xs font-semibold text-gray-700 uppercase tracking-wider`} 
                  style={columnStyle}
                >
                  {col.label}
                </th>
              );
            })}
            {actions.length > 0 && (
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{ width: "120px" }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + actions.length}
                className="px-6 py-12 text-center text-gray-500"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm font-medium">No data available</p>
                </div>
              </td>
            </tr>
          ) : (
            data?.map((row, rowIndex) => (
              <tr 
                key={row.id ?? rowIndex}
                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 border-b border-gray-100"
              >
                {columns.map((col) => {
                  const columnStyle = col.style || (col.width ? { width: col.width } : undefined);
                  const cellClassName = col.cellClassName || "px-6 py-4";
                  const wrapperClassName = col.contentClassName || "break-words whitespace-pre-line";
                  return (
                    <td 
                      key={col.key} 
                      className={`${cellClassName} align-middle text-gray-900`} 
                      style={columnStyle}
                    >
                      <div className={`${wrapperClassName} w-full`}>
                        {col.render ? col.render(row, rowIndex) : row[col.key]}
                      </div>
                    </td>
                  );
                })}
                {actions.length > 0 && (
                  <td className="px-6 py-4 text-center align-middle">
                    <div className="flex justify-center gap-2">
                      {actions.map((action, idx) => (
                        <div key={idx}>{action.key({ row, index: rowIndex })}</div>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
