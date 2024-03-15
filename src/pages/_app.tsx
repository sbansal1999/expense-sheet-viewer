import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme_provider";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="dark">
				<Component {...pageProps} />
				<ReactQueryDevtools initialIsOpen={false} />
				<Analytics/>
				<SpeedInsights/>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
