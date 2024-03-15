import { Inter } from "next/font/google";
import { cn, getFormattedAmount } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { addDays, format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ErrorAlert } from "@/components/ErrorAlert";
import { LoadingState } from "@/components/LoadingState";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const inter = Inter({ subsets: ["latin"] });
const FILTERED_EXPENSES_KEY = "filtered_expenses_key";

export default function Filter() {
  return (
    <main className={`${inter.className}`}>
      <FilterExpense />
    </main>
  );
}

const DateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
});

const ExpensesSchema = z.array(
  z.object({
    timeStamp: z.string(),
    title: z.string(),
    //TODO make this ENUM
    nature: z.string(),
    amount: z.number(),
    //TODO make this ENUM
    type: z.string(),
    paidFrom: z.string(),
  })
);

type Expense = z.infer<typeof ExpensesSchema>[number];

function parseDateRange(dateRange: unknown) {
  return DateRangeSchema.parse(dateRange);
}

function parseExpenses(expenses: unknown) {
  return ExpensesSchema.parse(expenses);
}

function transformExpensesData(expenses: string[][]): Expense[] {
  return expenses
    .map((expense) => {
      const [timeStamp, title, nature, amount, type, paidFrom] = expense;
      return {
        timeStamp: format(new Date(timeStamp), "LLL dd, y h:mm a"),
        title,
        nature,
        amount: parseFloat(amount),
        type,
        paidFrom,
      };
    })
    .filter((expense) => expense.nature === "Debit");
}

function FilterExpense() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  function getFilterExpenseURL(fromDate: Date, toDate: Date) {
    return `/api/expenseBetweenDates?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`;
  }

  function handleFetchData() {
    filteredExpensesResponse.refetch();
  }

  const filteredExpensesResponse = useQuery({
    queryKey: [FILTERED_EXPENSES_KEY],
    queryFn: async () => {
      const parsedDateRange = parseDateRange(date);
      const res = await axios.get(
        getFilterExpenseURL(parsedDateRange.from, parsedDateRange.to)
      );
      const data = res.data;
      return parseExpenses(transformExpensesData(data));
    },
    enabled: false,
  });

  return (
    <div className="m-4 flex flex-col gap-4">
      <p className="text-center ext-2xl capitalize tracking-tight text-blue-600 underline">
        Filter expenses by date
      </p>
      <p className="text-center tracking-tight">
        Pick dates between which you want the expenses
      </p>
      <div className="grid gap-2 justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex justify-center">
        <Button onClick={handleFetchData}>Fetch Data</Button>
      </div>
      <FilteredExpenses response={filteredExpensesResponse} />
    </div>
  );
}

function FilteredExpenses({
  response,
}: {
  response: UseQueryResult<Expense[]>;
}) {
  if (response.isError) return <ErrorAlert />;

  if (response.isSuccess)
    return (
      <>
        <DisplayFilteredExpenses expenses={response.data} />
        <DisplayExpensesRelatedStats expenses={response.data} />
      </>
    );

  if (response.isLoading) return <LoadingState />;

  return <></>;
}

function DisplayFilteredExpenses({ expenses }: { expenses: Expense[] }) {
  function SortableHeader({ column, label }: { column: any; label: string }) {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  }

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "timeStamp",
      header: ({ column }) => <SortableHeader column={column} label="Time" />,
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <SortableHeader column={column} label="Amount" />,
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "paidFrom",
      header: "Paid From",
    },
  ];
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  return (
    <div className="rounded-md border">
      <div className="flex p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
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
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function DisplayExpensesRelatedStats({ expenses }: { expenses: Expense[] }) {
  return (
    <>
      <DisplayTotalSpent expenses={expenses} />
    </>
  );
}

function DisplayTotalSpent({ expenses }: { expenses: Expense[] }) {
  const totalSpentInPaisa = expenses.reduce(
    (currentSum, expense) => (currentSum += expense.amount * 100),
    0
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total spent during the above period:</CardTitle>
      </CardHeader>
      <CardContent>{getFormattedAmount(totalSpentInPaisa / 100)}</CardContent>
    </Card>
  );
}
