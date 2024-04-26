import { Inter } from "next/font/google";
import { cn, getFormattedAmount, roundOffDecimalPlaces } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  PaginationState,
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
import ReactECharts from "echarts-for-react";
import {
  ComposeOption,
  LegendComponentOption,
  PieSeriesOption,
  TitleComponentOption,
  TooltipComponentOption,
} from "echarts";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });
const FILTERED_EXPENSES_KEY = "filtered_expenses_key";

export default function Filter() {
  return (
    <div>
      <Head>
        <title>Expense Sheet Viewer - Filter Expenses</title>
      </Head>
      <main className={`${inter.className}`}>
        <FilterExpense />
      </main>
    </div>
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

type ExpensesProp = {
  expenses: Expense[];
};

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

function DisplayFilteredExpenses({ expenses }: ExpensesProp) {
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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnVisibility,
      pagination,
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
        <div className="flex-1 hidden md:block"></div>
        <div className="flex-1 flex justify-center gap-2 lg:gap-4">
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
        <div className="flex-1 flex justify-end px-4">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function DisplayExpensesRelatedStats({ expenses }: ExpensesProp) {
  return (
    <>
      <DisplayTotalSpent expenses={expenses} />
      <DisplaySpendingPatternChartByCategoy expenses={expenses} />
    </>
  );
}

function DisplayTotalSpent({ expenses }: ExpensesProp) {
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

function DisplaySpendingPatternChartByCategoy({ expenses }: ExpensesProp) {
  const { theme } = useTheme();
  const sumsByTypeExceptRent = expenses.reduce((acc, transaction) => {
    if (transaction.type === "Rent") return acc;
    const { amount, type } = transaction;
    acc[type] = (acc[type] || 0) + amount * 100;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(sumsByTypeExceptRent)
    .map((val) => {
      return {
        name: val[0],
        value: roundOffDecimalPlaces(val[1] / 100, 2),
      };
    })
    .sort((a, b) => b.value - a.value);

  type EChartsOption = ComposeOption<
    | TitleComponentOption
    | TooltipComponentOption
    | LegendComponentOption
    | PieSeriesOption
  >;

  const getOption = (): EChartsOption => {
    return {
      tooltip: {
        trigger: "item",
      },
      series: [
        {
          type: "pie",
          data,
        },
      ],
    };
  };

  return <ReactECharts option={getOption()} theme={theme} />;
}
