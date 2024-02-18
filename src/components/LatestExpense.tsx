import { Inter } from "next/font/google";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const inter = Inter({ subsets: ["latin"] });
const LATEST_EXPENSE_KEY = "latest_expense";

export default function LatestExpense() {
	const { data, isLoading, isError } = useQuery({
		queryKey: [LATEST_EXPENSE_KEY],
		queryFn: getLatestExpense,
	});

	function getLatestExpense() {
		return axios.get("/api/sheets").then((res) => res.data);
	}

	if (isError) {
		return <ErrorAlert />;
	}

	return (
		<main className={`${inter.className}`}>
			{data.map((val: string, idx: number) => {
				return (
					<h3
						className="scroll-m-20 text-2xl font-semibold tracking-tight"
						key={idx}
					>
						{val}
					</h3>
				);
			})}
		</main>
	);
}

const ErrorAlert = () => {
	return (
		<Alert variant={"destructive"}>
			<ExclamationTriangleIcon className="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>
				Something went wrong. Check the logs...
			</AlertDescription>
		</Alert>
	);
};
