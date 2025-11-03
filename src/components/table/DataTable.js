"use client";

export default function DataTable({ columns, data = [], actions = [] }) {
  return (
    <table className="min-w-full border">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="border px-2 py-1">
              {col.label}
            </th> 
          ))}
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
              {columns.map((col) => (
                <td key={col.key} className="border px-2 py-1">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="border px-2 py-1 flex gap-2">
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
