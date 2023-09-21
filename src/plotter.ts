import type { WaveSide, WaveShape } from "./types";
import { getLengthPercentNumber, average } from "./utils";

export function plotter({
  apexesPixelSet,
  waveLength,
  waveHeight,
  repeatTimes,
  side,
  shape,
  smooth,
}: {
  apexesPixelSet: number[][];
  waveLength: number;
  waveHeight: number;
  repeatTimes: number;
  side: WaveSide;
  shape: WaveShape;
  smooth: boolean | number;
}): string {
  const origin = side === "bottom" ? "-0.1" : "100.1";
  let path = "";
  let sumDistance = 0;

  function getHeightPercent(h: number) {
    const height = side === "bottom" ? h : waveHeight - h;
    return getLengthPercentNumber(height, waveHeight);
  }

  function getDistancePercent(d: number) {
    return getLengthPercentNumber(d, waveLength * repeatTimes);
  }

  path += apexesPixelSet.reduce((acc, [d, h], index, arr) => {
    const halfBetweenPrev = average(d, 0);
    const apexSvgXPercent = getDistancePercent(sumDistance + d);
    const apexSvgYPercent = getHeightPercent(h);

    if (index === 0) return (acc += `${apexSvgYPercent}`);

    const nextIndex = index !== arr.length - 1 ? index + 1 : 1;
    const halfBetweenNext = average(arr[nextIndex][0], 0);
    const prevApexSvgXPercent = getDistancePercent(sumDistance);
    const prevApexSvgYPercent = getHeightPercent(arr[index - 1][1]);
    const middleBetweenPrevSvgX = sumDistance + halfBetweenPrev;

    const smoothness =
      halfBetweenPrev < halfBetweenNext && smooth
        ? ((halfBetweenPrev + halfBetweenNext) / halfBetweenNext) *
          halfBetweenPrev *
          Math.max(0, Math.min(1, Number(smooth)))
        : 0;

    let firstControlPointX: number;
    let firstControlPointY: number;
    let secondControlPointX: number;
    let secondControlPointY: number;

    switch (shape) {
      case "wavy":
        {
          firstControlPointX = getDistancePercent(
            middleBetweenPrevSvgX + smoothness,
          );
          firstControlPointY = prevApexSvgYPercent;

          secondControlPointX = getDistancePercent(
            middleBetweenPrevSvgX - smoothness,
          );
          secondControlPointY = apexSvgYPercent;
        }
        break;

      case "serrated":
        {
          firstControlPointX = prevApexSvgXPercent;
          firstControlPointY = prevApexSvgYPercent;

          secondControlPointX = apexSvgXPercent;
          secondControlPointY = apexSvgYPercent;
        }
        break;

      case "petal":
        {
          firstControlPointX =
            h < arr[index - 1][1] ? apexSvgXPercent : prevApexSvgXPercent;
          firstControlPointY =
            h < arr[index - 1][1] ? prevApexSvgYPercent : apexSvgYPercent;

          secondControlPointX = apexSvgXPercent;
          secondControlPointY = apexSvgYPercent;
        }
        break;
      default: {
        firstControlPointX = getDistancePercent(
          middleBetweenPrevSvgX + smoothness,
        );
        firstControlPointY = prevApexSvgYPercent;

        secondControlPointX = getDistancePercent(
          middleBetweenPrevSvgX - smoothness,
        );
        secondControlPointY = apexSvgYPercent;
      }
    }

    const firstControlPoint = `${firstControlPointX} ${firstControlPointY}`;
    const secondControlPoint = `${secondControlPointX} ${secondControlPointY}`;
    const end = `${apexSvgXPercent} ${apexSvgYPercent}`;

    sumDistance += d;

    return (acc += ` C${firstControlPoint}, ${secondControlPoint}, ${end}`);
  }, "");

  return `M-10 ${origin} L-10 0 L0 ${path} L110 0 L110 ${origin}Z`;
}
