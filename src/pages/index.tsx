import { Inter } from "next/font/google";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorAlert } from "@/components/ErrorAlert";
import { LoadingState } from "@/components/LoadingState";
import { getFormattedAmount } from "@/lib/utils";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });
const LATEST_EXPENSE_KEY = "latest_expense";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Expense Sheet Viewer - Latest Expense</title>
      </Head>
      <main className={`${inter.className}`}>
        <LatestExpense />
      </main>
    </div>
  );
}

type SheetsResponse = {
  schema: string[];
  lastRow: string[];
};

function LatestExpense() {
  const { data, isSuccess, isError } = useQuery({
    queryKey: [LATEST_EXPENSE_KEY],
    queryFn: () =>
      axios.get<SheetsResponse>("/api/latestExpense").then((res) => res.data),
    staleTime: Infinity,
  });

  if (isError) {
    return <ErrorAlert />;
  }

  if (isSuccess) {
    return (
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

