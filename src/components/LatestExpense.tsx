import { Inter } from "next/font/google";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

const inter = Inter({ subsets: ["latin"] });
const LATEST_EXPENSE_KEY = "latest_expense";

type SheetsResponse = {
  schema: string[];
  lastRow: string[];
};

export default function LatestExpense() {
  const { data, isSuccess, isError } = useQuery({
    queryKey: [LATEST_EXPENSE_KEY],
    queryFn: getLatestExpense,
    staleTime: Infinity,
  });

  function getLatestExpense() {
    return axios.get<SheetsResponse>("/api/sheets").then((res) => res.data);
  }

  if (isError) {
    return <ErrorAlert />;
  }

  if (isSuccess) {
    return (
      <main className={`${inter.className}`}>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Latest Expense</CardTitle>
              <CardDescription>
                Details related to your last expense
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.lastRow.map((val: string, idx: number) => {
                return (
                  <div
                    key={idx}
                    className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                  >
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {data.schema[idx]}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {getFormattedValue(data.schema[idx], val)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return <LoadingState />;
}

function getFormattedValue(type: string, value: string) {
  if (type === "Timestamp") return getFormattedDate(value);
  if (type === "Amount") return getFormattedAmount(value);
  return value;
}

function getFormattedDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "medium",
  }).format(new Date(dateString));
}

function getFormattedAmount(moneyString: string) {
  return `₹ ${moneyString}`;
}

function LoadingState() {
  return (
    <h3 className="scroll-m-20 font-semibold tracking-tight text-yellow-600">
      Loading...
    </h3>
  );
}

function ErrorAlert() {
  return (
    <Alert variant={"destructive"}>
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Something went wrong. Check the logs...
      </AlertDescription>
    </Alert>
  );
}
