import { Candle } from "../types/candle";

export function getCandles(data: (null | number)[]): Candle[] {
    //remove null at beginning
	const startIndex = data.findIndex((element) => element !== null);
	if (startIndex === -1) return [];
	const cleanedData = data.slice(startIndex);

    //parse data to candles
	let i = 0;
	const candles: Candle[] = [];
	while (i < cleanedData.length) {
		if (cleanedData[i] !== null) {
			const candle = {
				open: cleanedData[i] as number,
				high: cleanedData[i + 1] as number,
				low: cleanedData[i + 2] as number,
				close: cleanedData[i + 3] as number,
			};
			candles.push(candle);
			i += 5;
		} else {
			const candle = {
				open: candles[candles.length - 1].close,
				high: candles[candles.length - 1].close,
				low: candles[candles.length - 1].close,
				close: candles[candles.length - 1].close,
			};
			candles.push(candle);
			i++;
		}
	}

	return candles;
}
