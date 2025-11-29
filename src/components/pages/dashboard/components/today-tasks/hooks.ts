import { useMemo } from "react";

export const useSparklinePoints = (values: number[], width = 200, height = 80) =>
  useMemo(() => {
    if (values.length <= 1) return "";
    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - (value / 100) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [values, height, width]);

export const useReadableDate = () =>
  useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    []
  );
