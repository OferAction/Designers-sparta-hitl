import { flexRender, Header } from "@tanstack/react-table";

interface HeaderCellProps<T> {
  header: Header<T, unknown>;
  onColumnHover: (columnId: string | null) => void;
}

export const HeaderCell = <T,>({ header, onColumnHover }: HeaderCellProps<T>) => {
  const columnWidth = header.column.getSize();
  const canSort = header.column.getCanSort();

  const handleClick = () => {
    if (canSort) {
      header.column.toggleSorting();
    }
  };

  return (
    <div
      className={`hover:bg-muted/40 flex-1 text-sm font-medium text-muted-foreground px-2 py-2.5 h-[60px] flex flex-shrink-0 transition-colors relative overflow-hidden ${canSort ? "cursor-pointer select-none" : ""}`}
      style={{ minWidth: `${columnWidth}px` }}
      data-column-id={header.column.id}
      onMouseEnter={() => onColumnHover(header.column.id)}
      onMouseLeave={() => onColumnHover(null)}
      onClick={handleClick}
    >
      <div className="flex gap-1 w-full">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</div>
    </div>
  );
};
