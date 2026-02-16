import svgPaths from "./svg-ns8dizh5nx";

interface VectorProps {
  percentage?: number;
}

export default function Vector({ percentage = 0 }: VectorProps) {
  return (
    <div className="relative size-full" data-name="Vector">
      <div className="absolute bottom-[-2.429%] left-[-1.762%] right-[-1.762%] top-[-2.429%]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 109 37"
        >
          <path
            d={svgPaths.p2d9eef00}
            id="Vector"
            stroke="var(--stroke-0, #545F69)"
            strokeWidth="3.7"
          />
        </svg>
      </div>
    </div>
  );
}