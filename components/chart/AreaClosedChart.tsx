// stocks/components/chart/AreaClosedChart.tsx

"use client";
import { memo, useCallback, useMemo, useReducer } from "react";
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

function reducer(state: any, action: any) {
  switch (action.type) {
    case "UPDATE": {
      if (state.isStatic) {
        return state; // Do not update when static
      }
      return {
        ...state,
        close: action.close,
        marketCap: action.marketCap, // Add marketCap to state
        date: action.date,
        x: action.x,
        y: action.y,
        translate: `-${(1 - action.x / action.width) * 100}%`,
        hovered: true,
      };
    }
    case "CLEAR": {
      if (state.isStatic) {
        return state; // Do not clear when static
      }
      return {
        ...state,
        x: undefined,
        y: undefined,
        close: undefined, // Clear close
        marketCap: undefined, // Clear marketCap
        hovered: false,
      };
    }
    case "TOGGLE_STATIC": {
      const isStatic = !state.isStatic;
      return {
        ...state,
        isStatic,
        hovered: isStatic ? true : false,
      };
    }
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
  onDateHover: any;
  state: any;
}

function Interactions({
  width,
  height,
  xScale,
  data,
  dispatch,
  onDateHover,
  state,
}: InteractionsProps) {
  const handleMove = useCallback(
    (event: React.PointerEvent<SVGRectElement>) => {
      if (state.isStatic) return; // Do not update hover when static
      const point = localPoint(event);
      if (!point) return;

      const pointer = {
        x: Math.max(0, Math.floor(point.x)),
        y: Math.max(0, Math.floor(point.y)),
      };

      const x0 = pointer.x;
      const dates = data.map((d: any) => xScale(toDate(d)));
      let index = bisectRight(dates, x0) - 1;
      index = Math.max(0, Math.min(index, data.length - 1));

      const d = data[index];
      dispatch({ type: "UPDATE", ...d, ...pointer, width });

      if (onDateHover) {
        onDateHover(index);
      }
    },
    [xScale, data, dispatch, width, onDateHover, state.isStatic]
  );

  const handleLeave = useCallback(() => {
    if (state.isStatic) return; // Do not clear when static
    dispatch({ type: "CLEAR" });
  }, [dispatch, state.isStatic]);

  const handleClick = useCallback(() => {
    dispatch({ type: "TOGGLE_STATIC" });
  }, [dispatch]);

  return (
    <rect
      width={width}
      height={height}
      rx={12}
      ry={12}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={handleClick}
      fill={"transparent"}
    />
  );
}

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

function Area({ mask, id, data, x, y, yScale, color, top }: AreaProps) {
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
}

function GraphSlider({ data, width, height, top, state, dispatch, onDateHover }: any) {
  const xScale = useMemo(
    () => scalePoint<string>().domain(data.map(toDate)).range([0, width]),
    [width, data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [height, 0],
        domain: [
          Math.min(...data.map((d: any) => d.close)),
          Math.max(...data.map((d: any) => d.close)),
        ],
      }),
    [height, data]
  );

  const x = useCallback((d: any) => xScale(toDate(d)), [xScale]);
  const y = useCallback((d: any) => yScale(d.close), [yScale]);

  const pixelTranslate = (parseFloat(state.translate) / 100) * width;
  const style = {
    transform: `translateX(${pixelTranslate}px)`,
  };

  const isIncreasing = data[data.length - 1].close > data[0].close;
  const color = state.hovered || state.isStatic ? "dodgerblue" : isIncreasing ? "green" : "red";

  // Retrieve the formatted date from state
  const myDate = new Date(state.date);
  const formattedDate = myDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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
      {state.x && state.marketCap !== undefined && (
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
          {/* Market Cap Text Positioned Below Close Price */}
          <text
            textAnchor={state.x + 8 > width / 2 ? "end" : "start"}
            x={state.x + 8 > width / 2 ? state.x - 8 : state.x + 6}
            y={20} // Align with date and close price texts' y
            dy={"1em"} // Adjust as needed to position below the close price
            fill={color}
            className="text-base font-medium"
          >
            {formatMarketCap(state.marketCap)}
          </text>
          {/* Close Price Text Positioned Below Date */}
          <text
            textAnchor={state.x + 8 > width / 2 ? "end" : "start"}
            x={state.x + 8 > width / 2 ? state.x - 8 : state.x + 6}
            y={20} // Align with date text's y
            dy={"2.5em"} // Adjust as needed to position below the date
            opacity={.8}
            fill={color}
            className="text-sm font-light"
          >
            {formatCurrency(state.close)}
          </text>
        </g>
      )}
      <Interactions
        width={width}
        height={height}
        data={data}
        xScale={xScale}
        dispatch={dispatch}
        onDateHover={onDateHover}
        state={state}
      />
    </svg>
  );
}

interface ChartData {
  date: Date;
  close: number;
  marketCap: number; // Include marketCap in ChartData
}

interface AreaClosedChartProps {
  data: ChartData[];
  onDateHover: (index: number) => void;
}

export default function AreaClosedChart({ data, onDateHover }: AreaClosedChartProps) {
  const last = data[data.length - 1];

  const initialState = {
    close: last.close,
    marketCap: last.marketCap, // Initialize marketCap
    date: last.date,
    translate: "0%",
    hovered: false,
    isStatic: false,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="w-full min-w-fit">
      {/* Removed the separate date div */}
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
