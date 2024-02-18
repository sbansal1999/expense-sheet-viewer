import { Inter } from "next/font/google";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
		return "error...";
	}

	return <main className={`${inter.className}`}>{JSON.stringify(data)}</main>;
}
