"use client";

import { Table } from "../ui/table";

export default function DataTable({ columns, data = [], actions = [], columnsAfterActions = [] }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-lg bg-white ">
      <Table className="min-w-full text-sm  divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 via-gray-50 to-gray-100">
          <tr>
            {columns.map((col) => {
              const headerNowrapClass =
                col.wrap ? "" : "whitespace-nowrap text-nowrap";

              return (
                <th 
                  key={col.key} 
                  className={`text-xs font-semibold text-gray-700 text-center px-3 py-2 bg-blue-100 ${headerNowrapClass} ${col.className || ""}`} 
                >
                  {col.label}
                </th>
              );
            })}
            {actions.length > 0 && (
              <th className="text-xs font-semibold text-gray-700 text-center whitespace-nowrap text-nowrap px-3 py-2 bg-blue-100 ">
                Actions
              </th>
            )}
            {columnsAfterActions.map((col) => (
              <th 
                key={col.key} 
                className={`text-xs font-semibold text-gray-700 text-center whitespace-nowrap text-nowrap px-3 py-2 bg-blue-100`} 
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + actions.length + columnsAfterActions.length}
                className="text-center text-gray-500 whitespace-nowrap text-nowrap"
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
                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 border-b border-gray-100 bg-blue-50 bg"
              >
                {columns.map((col) => {
                  const defaultCellNowrapClass =
                    col.wrap ? "" : "whitespace-nowrap text-nowrap truncate";
                  const cellClassName =
                    col.cellClassName || defaultCellNowrapClass;

                  return (
                    <td 
                      key={col.key} 
                      className={`text-gray-900 px-2 max-w-[290px] mx-auto ${cellClassName}`} 
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </td>
                  );
                })}
                {actions.length > 0 && (
                  <td className="px-2 py-2 text-center whitespace-nowrap text-nowrap">
                    <div className="flex justify-center gap-2">
                      {actions.map((action, idx) => (
                        <div key={idx}>{action.key({ row, index: rowIndex })}</div>
                      ))}
                    </div>
                  </td>
                )}
                {columnsAfterActions.map((col) => (
                  <td 
                    key={col.key} 
                    className={`text-gray-900 whitespace-nowrap text-nowrap px-2 truncate max-w-[290px] mx-auto`}
                  >
                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
