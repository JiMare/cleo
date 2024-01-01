import { useCallback, useEffect, useRef } from "react";
import classes from "./Chart.module.scss";
import { Candle } from "../../types/candle";

interface ChartProps {
	width: number;
	height: number;
	candles: Candle[];
	selectedCandle: number | null;
	onMouseHover: (i: number | null) => void;
}

function Chart({ width, height, candles, selectedCandle, onMouseHover }: ChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const requestRef = useRef<number>();

	const candlePositionsRef = useRef<{ x: number; width: number }[] | null>(null);

	const animate = useCallback(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");

		if (canvas && context) {
			const canvasWidth = canvas.width;
			const canvasHeight = canvas.height;

			context.clearRect(0, 0, canvasWidth, canvasHeight);

			// Find the minimum and maximum prices of all candles
			const { min, max } = candles.reduce(
				({ min, max }, { low, high }) => ({
					min: Math.min(min, low),
					max: Math.max(max, high),
				}),
				{ min: Infinity, max: -Infinity }
			);
			const priceRange = max - min;

			// Calculate the width of each candle in pixels
			const candleGap = canvasWidth / candles.length;
			const candleOffset = candleGap / 2;
			const candleWidth = candleGap * 0.8;

			candlePositionsRef.current = candles.map((_, i) => ({
				x: candleGap * i + candleGap / 2,
				width: candleWidth,
			}));

			// Padding on the top and bottom of the chart in pixels
			const verticalPadding = 20;

			// Height minus total padding
			const availableHeight = canvasHeight - verticalPadding * 2;

			// Interpolate a price to a y coordinate on the chart
			const transformY = (value: number) => availableHeight * ((max - value) / priceRange) + verticalPadding;

			for (let i = 0; i < candles.length; i++) {
				const candle = candles[i];
				// Calculate coordinates of the candle
				const x = candleGap * i + candleOffset;
				const yOpen = transformY(candle.open);
				const yHigh = transformY(candle.high);
				const yLow = transformY(candle.low);
				const yClose = transformY(candle.close);

				// If candle opens and closes at the same price, draw a horizontal line
				if (candle.low === candle.high) {
					context.strokeStyle = "gray";

					context.beginPath();
					context.lineWidth = candleWidth;
					context.moveTo(x, yOpen);
					context.lineTo(x, yOpen + 1);
					context.stroke();

					continue;
				}

				if (selectedCandle === i) {
					context.beginPath();
					context.lineWidth = candleWidth;
					context.strokeStyle = "gray";
					context.moveTo(x, 0);
					context.lineTo(x, canvasHeight);
					context.stroke();
				}

				// If candle closes below its open, it's bearish
				// Otherwise, it's bullish
				// Bullish candles are green, bearish candles are red
				const color = candle.open > candle.close ? "red" : "green";
				context.strokeStyle = color;

				// Draw candle wick
				context.beginPath();
				context.lineWidth = 1;
				context.moveTo(x, yHigh);
				context.lineTo(x, yLow);
				context.stroke();

				// Draw candle body
				context.beginPath();
				context.lineWidth = candleWidth;
				context.moveTo(x, yOpen);
				context.lineTo(x, yClose);
				context.stroke();
			}
		}
	}, [candles, selectedCandle]);

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			const canvas = canvasRef.current;
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;

			const candleIndex = candlePositionsRef?.current?.findIndex(pos => mouseX >= pos.x - pos.width / 2 && mouseX <= pos.x + pos.width / 2);
			if (candleIndex) onMouseHover(candleIndex);
		};

		const canvas = canvasRef.current;
		canvas?.addEventListener("mousemove", handleMouseMove);

		return () => {
			canvas?.removeEventListener("mousemove", handleMouseMove);
		};
	}, [onMouseHover]);

	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate);

		return () => {
			if (typeof requestRef.current === "number") {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [animate]);

	return (
		<canvas
			ref={canvasRef}
			className={classes["chart"]}
			width={width * window.devicePixelRatio}
			height={height * window.devicePixelRatio}
			style={{ width: `${width}px`, height: `${height}px` }}
		/>
	);
}

export default Chart;
