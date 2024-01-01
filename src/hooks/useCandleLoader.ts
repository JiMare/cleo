import { getCandles } from "../utils/getCandles";
import { Candle } from "../types/candle";
import { useState, useEffect } from "react";

// DO NOT MODIFY THIS TYPE
type CandleLoaderParams =
	| {
			enabled: false;
			symbol?: string | null;
		}
	| {
			enabled: true;
			symbol: string;
		};

// DO NOT MODIFY THIS TYPE
type CandleLoaderHook =
	| {
			status: "loading" | "idle";
			data: null;
			error: null;
		}
	| {
			status: "error";
			data: null;
			error: string;
		}
	| {
			status: "success";
			data: Candle[];
			error: null;
		};

export function useCandleLoader({ enabled, symbol }: CandleLoaderParams): CandleLoaderHook {
	// Remove all code below this line and replace it with your own implementation

	const [data, setData] = useState<null | (number | null)[]>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<null | string>(null);

	useEffect(() => {
		if (!enabled) {
			setLoading(false);
			setData(null);
			return;
		}

		fetch(`/candles/${symbol}.json`)
			.then(response => {
				if (!response.ok) {
					setError(`Network response was not ok (${response.status})`);
					throw new Error(`Network response was not ok (${response.status})`);
				}
				return response.json();
			})
			.then((data: (number | null)[]) => {
				setData(data);
				setLoading(false);
			})
			.catch(error => {
				console.error("Error fetching data:", error);
				setError("Error fetching data");
				setLoading(false);
			});
	}, [symbol, enabled]);

	if (loading) {
		return {
			status: "loading",
			data: null,
			error: null,
		};
	}

	if (error) {
		return {
			status: "error",
			data: null,
			error: error,
		};
	}

	if (data) {
		const candles = getCandles(data);
		return { status: "success", data: candles, error: null };
	}

	return { status: "idle", data: null, error: null };
}
