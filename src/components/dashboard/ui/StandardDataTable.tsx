import React from 'react';
import { Edit, Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface StandardDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function StandardDataTable<T extends { id?: string }>({ 
  data, 
  columns, 
  onRowClick,
  isLoading 
}: StandardDataTableProps<T>) {

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-slate-900 rounded-xl border border-slate-800">
        <p className="text-slate-400">No records found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
          <tr>
            {columns.map((col, i) => (
              <th key={i} scope="col" className="px-6 py-4 font-medium tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {data.map((item, rowIndex) => (
            <tr 
              key={item.id || rowIndex} 
              className={`hover:bg-slate-800/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] || '') : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
