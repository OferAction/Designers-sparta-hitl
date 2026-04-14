import { Cell, flexRender } from "@tanstack/react-table";

interface RowCellProps<T> {
  cell: Cell<T, unknown>;
  globalFilter?: string;
}

export const RowCell = <T,>({ cell, globalFilter }: RowCellProps<T>) => {
  const cellWidth = cell.column.getSize();

  // Create extended context with globalFilter
  const context = { ...cell.getContext(), globalFilter };

  return (
    <div
      className="px-2 py-2 flex items-center flex-shrink-0 transition-colors overflow-hidden flex-1"
      style={{ minWidth: `${cellWidth}px` }}
      data-column-id={cell.column.id}
    >
      {flexRender(cell.column.columnDef.cell, context)}
    </div>
  );
};
