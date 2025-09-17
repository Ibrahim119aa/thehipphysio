'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface ColumnDef<T> {
  accessorKey: keyof T | 'actions';
  header: string;
  cell: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchKey: keyof T;
  isLoading: boolean;
}
export function DataTable<T extends object>({
  columns,
  data,
  searchKey,
  isLoading,
}: DataTableProps<T>) {
  const [filter, setFilter] = useState('');

  const filteredData = data?.filter(item =>
    item[searchKey]?.toString()?.toLowerCase()?.includes(filter?.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder={`Filter by ${searchKey.toString()}...`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border bg-white dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.header}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}
                </TableRow>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.header}>{column.cell(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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