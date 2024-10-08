// stocks/components/chart/AreaClosedChart.tsx

"use client";
import { memo, useCallback, useMemo, useReducer, useRef } from "react";
import { formatCurrency, formatMarketCap } from '@/lib/formatters';
import { scalePoint } from "d3-scale";
import { bisectRight } from "d3-array";
import { localPoint } from "@visx/event";
import { LinearGradient } from "@visx/gradient";
import { AreaClosed, LinePath } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { ParentSize } from "@visx/responsive";

// UTILS
const toDate = (d: any): string => {
  const date = new Date(d?.date || d);
  if (isNaN(date.getTime())) {
    console.error("Invalid date encountered:", d);
    return new Date().toISOString().split("T")[0];
  }
  return date.toISOString().split("T")[0];
};

const MemoAreaClosed = memo(AreaClosed);
const MemoLinePath = memo(LinePath);

// Helper function to calculate the multiplier
function calculateMultiplier(data: any[], startIndex: number, endIndex: number) {
  const startPrice = data[startIndex]?.close;
  const endPrice = data[endIndex]?.close;
  if (startPrice !== undefined && endPrice !== undefined && startPrice !== 0) {
    return endPrice / startPrice;
  }
  return null;
}

type State = {
  // Drag state
  isDragging: boolean;
  startIndex: number | null;
  endIndex: number | null;
  multiplier: number | null;
  // Hover state
  x: number | undefined;
  y: number | undefined;
  close: number | undefined;
  marketCap: number | undefined;
  date: Date | undefined;
  translate: string;
  hovered: boolean;
  isPointerOver: boolean;
};

function reducer(state: State, action: any): State {
  switch (action.type) {
    case "UPDATE": {
      if (state.isDragging) {
        return state; // Do not update hover when dragging
      }
      // Check if the data has changed
      if (
        state.close === action.close &&
        state.marketCap === action.marketCap &&
        state.date === action.date &&
        state.x === action.x &&
        state.y === action.y
      ) {
        return state; // No change, do not update
      }
      return {
        ...state,
        close: action.close,
        marketCap: action.marketCap,
        date: action.date,
        x: action.x,
        y: action.y,
        translate: `-${(1 - action.x / action.width) * 100}%`,
        hovered: true,
      };
    }
    case "CLEAR": {
      if (state.isDragging) {
        return state; // Do not clear when dragging
      }
      return state; // Do not clear hover state to keep data visible
    }
    case "DRAG_START":
      return {
        ...state,
        isDragging: true,
        startIndex: action.index,
        endIndex: action.index,
        multiplier: null,
      };
    case "DRAG_MOVE": {
      const multiplier = calculateMultiplier(
        action.data,
        state.startIndex!,
        action.index
      );
      // Check if the data has changed
      if (
        state.endIndex === action.index &&
        state.multiplier === multiplier &&
        state.x === action.pointerX &&
        state.y === action.pointerY &&
        state.close === action.data[action.index]?.close &&
        state.marketCap === action.data[action.index]?.marketCap &&
        state.date === action.data[action.index]?.date
      ) {
        return state; // No change, do not update
      }
      return {
        ...state,
        endIndex: action.index,
        multiplier,
        // Update hover state to current pointer
        x: action.pointerX,
        y: action.pointerY,
        close: action.data[action.index]?.close,
        marketCap: action.data[action.index]?.marketCap,
        date: action.data[action.index]?.date,
        hovered: true,
        translate: `-${(1 - action.pointerX / action.width) * 100}%`,
      };
    }
    case "DRAG_END":
      return {
        ...state,
        isDragging: false,
        multiplier: null, // Reset multiplier when dragging ends
      };
    case "POINTER_OVER":
      return {
        ...state,
        isPointerOver: true,
      };
    case "POINTER_OUT":
      return {
        ...state,
        isPointerOver: false,
        // Do not clear hover state to keep data visible
      };
    default:
      return state;
  }
}

interface InteractionsProps {
  width: number;
  height: number;
  xScale: any;
  data: any[];
  dispatch: any;
  state: any;
  onDateHover: any;
}

const Interactions = memo(function Interactions({
  width,
  height,
  xScale,
  data,
  dispatch,
  state,
  onDateHover,
}: InteractionsProps) {
  const dates = useMemo(() => data.map((d: any) => xScale(toDate(d))), [data, xScale]);
  const pointerMoveRAF = useRef<number | null>(null);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<SVGRectElement>) => {
      const point = localPoint(event);
      if (!point) return;

      const x0 = point.x;
      let index = bisectRight(dates, x0) - 1;
      index = Math.max(0, Math.min(index, data.length - 1));

      dispatch({ type: "DRAG_START", index });
    },
    [dates, data.length, dispatch]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGRectElement>) => {
      if (pointerMoveRAF.current !== null) return;

      pointerMoveRAF.current = requestAnimationFrame(() => {
        pointerMoveRAF.current = null;

        const point = localPoint(event);
        if (!point) return;

        const pointer = {
          x: Math.max(0, Math.floor(point.x)),
          y: Math.max(0, Math.floor(point.y)),
        };

        const x0 = pointer.x;
        let index = bisectRight(dates, x0) - 1;
        index = Math.max(0, Math.min(index, data.length - 1));

        if (state.isDragging) {
          dispatch({
            type: "DRAG_MOVE",
            index,
            data,
            pointerX: pointer.x,
            pointerY: pointer.y,
            width,
          });
          if (onDateHover) {
            onDateHover(index);
          }
        } else {
          dispatch({ type: "UPDATE", ...data[index], ...pointer, width });
          if (onDateHover) {
            onDateHover(index);
          }
        }
      });
    },
    [dates, data, dispatch, state.isDragging, width, onDateHover]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<SVGRectElement>) => {
      if (state.isDragging) {
        dispatch({ type: "DRAG_END" });
        // After drag ends, keep the hover state
      }
    },
    [dispatch, state.isDragging]
  );

  const handlePointerLeave = useCallback(() => {
    dispatch({ type: "POINTER_OUT" });
    // Do not call onDateHover(null); keep the last data visible
  }, [dispatch]);

  const handlePointerEnter = useCallback(() => {
    dispatch({ type: "POINTER_OVER" });
  }, [dispatch]);

  return (
    <rect
      width={width}
      height={height}
      fill="transparent"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
    />
  );
});

interface AreaProps {
  mask?: string;
  id: string;
  data: any[];
  x: any;
  y: any;
  yScale: any;
  color: string;
  top: number;
}

const Area = memo(function Area({ mask, id, data, x, y, yScale, color, top }: AreaProps) {
  return (
    <g strokeLinecap="round" className="stroke-1" transform={`translate(0, ${top})`}>
      <LinearGradient id={id} from={color} fromOpacity={0.6} to={color} toOpacity={0} />
      <MemoAreaClosed
        data={data}
        x={x}
        y={y}
        yScale={yScale}
        stroke="transparent"
        fill={`url(#${id})`}
        mask={mask}
      />
      <MemoLinePath data={data} x={x} y={y} stroke={color} mask={mask} />
    </g>
  );
});

const GraphSlider = memo(function GraphSlider({ data, width, height, top, state, dispatch, onDateHover }: any) {
  const xScale = useMemo(
    () => scalePoint<string>().domain(data.map(toDate)).range([0, width]),
    [width, data]
  );

  const yScale = useMemo(() => {
    const domain = [
      Math.min(...data.map((d: any) => d.close)),
      Math.max(...data.map((d: any) => d.close)),
    ];
    return scaleLinear({
      range: [height, 0],
      domain,
    });
  }, [height, data]);

  const x = useCallback((d: any) => xScale(toDate(d)) ?? 0, [xScale]);
  const y = useCallback((d: any) => yScale(d.close), [yScale]);

  const pixelTranslate = useMemo(() => (parseFloat(state.translate) / 100) * width, [state.translate, width]);
  const style = useMemo(
    () => ({
      transform: `translateX(${pixelTranslate}px)`,
    }),
    [pixelTranslate]
  );

  const isIncreasing = useMemo(() => data[data.length - 1].close > data[0].close, [data]);
  const color = state.hovered ? "dodgerblue" : isIncreasing ? "green" : "red";

  // Retrieve the formatted date from state
  const formattedDate = useMemo(() => {
    const myDate = new Date(state.date);
    return myDate.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [state.date]);

  // Prepare selected data for the selection area
  const selectedData = useMemo(() => {
    if (state.isDragging && state.startIndex !== null && state.endIndex !== null) {
      const start = Math.min(state.startIndex, state.endIndex);
      const end = Math.max(state.startIndex, state.endIndex) + 1;
      return data.slice(start, end);
    }
    return [];
  }, [state.isDragging, state.startIndex, state.endIndex, data]);

  return (
    <svg height={height} width="100%" viewBox={`0 0 ${width} ${height}`}>
      <mask id="mask" className="w-full">
        <rect x={0} y={0} width={width} height="100%" fill="#000" />
        <rect
          id="boundary"
          x={0}
          y={0}
          width={width}
          height="100%"
          fill="#fff"
          style={style}
        />
      </mask>
      <Area
        id="background"
        data={data}
        x={x}
        y={y}
        top={top}
        yScale={yScale}
        color={color}
      />
      <Area
        id="top"
        data={data}
        x={x}
        y={y}
        yScale={yScale}
        top={top}
        color={color}
        mask="url(#mask)"
      />
      {/* Hover line and data */}
      {state.hovered && state.x !== undefined && state.marketCap !== undefined && (
        <g className="marker">
          {/* Vertical Line */}
          <line
            x1={state.x}
            x2={state.x}
            y1={0}
            y2={height}
            stroke={color}
            strokeWidth={2}
          />
          {/* Circle Marker */}
          <circle
            cx={state.x}
            cy={yScale(state.close)}
            r={8}
            fill={color}
            stroke="#FFF"
            strokeWidth={3}
          />
          {/* Date Text Positioned from the Top */}
          <text
            textAnchor={state.x + 8 > width / 2 ? "end" : "start"}
            x={state.x + 8 > width / 2 ? state.x - 8 : state.x + 6}
            y={20} // Fixed position from the top
            dy={"-.6em"} // Adjust as needed
            fill="white" // Keep the date text white
            className="text-sm font-medium bg-black bg-opacity-50 px-1 rounded"
          >
            {formattedDate}
          </text>
          {/* Market Cap Text Positioned Below Date */}
          <text
            textAnchor={state.x + 8 > width / 2 ? "end" : "start"}
            x={state.x + 8 > width / 2 ? state.x - 8 : state.x + 6}
            y={20} // Align with date text's y
            dy={"1em"} // Adjust as needed to position below the date
            fill={color}
            className="text-base font-medium"
          >
            {formatMarketCap(state.marketCap)}
          </text>
          {/* Close Price Text Positioned Below Market Cap */}
          <text
            textAnchor={state.x + 8 > width / 2 ? "end" : "start"}
            x={state.x + 8 > width / 2 ? state.x - 8 : state.x + 6}
            y={20} // Align with date text's y
            dy={"2.5em"} // Adjust as needed to position below the market cap
            opacity={0.8}
            fill={color}
            className="text-sm font-light"
          >
            {formatCurrency(state.close)}
          </text>
          {/* Multiplier Text Positioned Below Close Price */}
          {state.multiplier !== null && (
            <text
              textAnchor={state.x + 8 > width / 2 ? "end" : "start"}
              x={state.x + 8 > width / 2 ? state.x - 8 : state.x + 6}
              y={20} // Align with date text's y
              dy={"4em"} // Adjust as needed to position below the close price
              fill={color}
              className="text-sm font-bold"
            >
              {`${state.multiplier >= 0 ? '' : '-'}${Math.abs(
                state.multiplier.toFixed(2)
              )}x`}
            </text>
          )}
        </g>
      )}
      {/* Render the selection area under the chart line */}
      {state.isDragging && selectedData.length > 0 && (
        <AreaClosed
          data={selectedData}
          x={x}
          y={y}
          yScale={yScale}
          stroke="none"
          fill="rgba(0, 123, 255, 0.3)"
        />
      )}
      <Interactions
        width={width}
        height={height}
        data={data}
        xScale={xScale}
        dispatch={dispatch}
        state={state}
        onDateHover={onDateHover}
      />
    </svg>
  );
});

interface ChartData {
  date: Date;
  close: number;
  marketCap: number;
}

interface AreaClosedChartProps {
  data: ChartData[];
  onDateHover: (index: number | null) => void;
}

export default function AreaClosedChart({ data, onDateHover }: AreaClosedChartProps) {
  const last = data[data.length - 1];

  const initialState: State = {
    close: last.close,
    marketCap: last.marketCap,
    date: last.date,
    translate: "0%",
    hovered: false,
    x: undefined,
    y: undefined,
    isDragging: false,
    startIndex: null,
    endIndex: null,
    multiplier: null,
    isPointerOver: false,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="w-full min-w-fit">
      <div className="h-80">
        {data.length > 0 ? (
          <ParentSize>
            {({ width, height }) => (
              <GraphSlider
                data={data}
                width={width}
                height={height}
                top={0}
                state={state}
                dispatch={dispatch}
                onDateHover={onDateHover}
              />
            )}
          </ParentSize>
        ) : (
          <div className="flex h-80 w-full items-center justify-center">
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
