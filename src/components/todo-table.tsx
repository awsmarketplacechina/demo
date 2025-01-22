import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Textarea } from '../components/ui/textarea';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

import { TodoItem } from '../types/todo';

const getColumns = (
  onStatusUpdate?: (task: TodoItem, newStatus: string) => Promise<void>,
  onCommentsUpdate?: (task: TodoItem, newComments: string) => Promise<void>,
  isLoading?: boolean,
  error?: string | null
): ColumnDef<TodoItem>[] => [
  {
    accessorKey: 'taskId',
    header: 'Task ID',
  },
  {
    accessorKey: 'description',
    header: 'Task Description',
  },
  {
    accessorKey: 'reviewWeek',
    header: 'Review Week',
  },
  {
    accessorKey: 'wbrDate',
    header: 'WBR Date',
    cell: ({ row }) => format(row.original.wbrDate, 'MMM dd, yyyy'),
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => format(row.original.dueDate, 'MMM dd, yyyy'),
  },
  {
    accessorKey: 'status',
    header: 'Task Status',
    cell: ({ row }) => {
      const task = row.original;
      return onStatusUpdate ? (
        <Select
          defaultValue={task.status}
          onValueChange={(value) => onStatusUpdate(task, value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        task.status
      );
    },
  },
  {
    accessorKey: 'comments',
    header: 'Comments',
    cell: ({ row }) => {
      const task = row.original;
      return onCommentsUpdate ? (
        <div className="space-y-2">
          <Textarea
            defaultValue={task.comments}
            className="min-h-[100px]"
            onChange={(e) => onCommentsUpdate(task, e.target.value)}
            disabled={isLoading}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
      ) : (
        task.comments
      );
    },
  },
];

interface TodoTableProps {
  data: TodoItem[];
  onStatusUpdate?: (task: TodoItem, newStatus: string) => Promise<void>;
  onCommentsUpdate?: (task: TodoItem, newComments: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function TodoTable({ 
  data,
  onStatusUpdate,
  onCommentsUpdate,
  isLoading,
  error
}: TodoTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = getColumns(onStatusUpdate, onCommentsUpdate, isLoading, error);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Filter by Status:</label>
        <Select
          onValueChange={(value) => {
            table.getColumn('status')?.setFilterValue(value === 'ALL' ? '' : value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
