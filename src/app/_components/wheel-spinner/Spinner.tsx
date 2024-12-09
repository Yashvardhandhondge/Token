import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import styles from "../../../styles/SpinWheel.module.css";
import Image from "next/image";
import { api } from "@/trpc/react";

const spinValues = [
  { minDegree: 61, maxDegree: 90, value: 10 },
  { minDegree: 31, maxDegree: 60, value: 20 },
  { minDegree: 0, maxDegree: 30, value: 30 },
  { minDegree: 331, maxDegree: 360, value: 40 },
  { minDegree: 301, maxDegree: 330, value: 50 },
  { minDegree: 271, maxDegree: 300, value: 60 },
  { minDegree: 241, maxDegree: 270, value: 70 },
  { minDegree: 211, maxDegree: 240, value: 80 },
  { minDegree: 181, maxDegree: 210, value: 90 },
  { minDegree: 151, maxDegree: 180, value: 100 },
  { minDegree: 121, maxDegree: 150, value: 110 },
  { minDegree: 91, maxDegree: 120, value: 120 },
];

const size = Array(12).fill(10);
const spinColors = [
  "#004b6e",
  "#00958f",
  "#004b6e",
  "#00958f",
  "#004b6e",
  "#00958f",
  "#004b6e",
  "#00958f",
  "#004b6e",
  "#00958f",
  "#004b6e",
  "#00958f",
];

const SpinWheel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resultValue, setResultValue] = useState<number | null>(null);
  const [spinChart, setSpinChart] = useState<Chart | null>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const chart = new Chart(canvasRef.current, {
        plugins: [ChartDataLabels],
        type: "pie",
        data: {
          labels: Array.from({ length: 12 }, (_, i) => (i + 1).toString()),
          datasets: [
            {
              backgroundColor: spinColors,
              data: size,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          animation: { duration: 0 },
          // rotation: -90 as any,
          plugins: {
            tooltip: { enabled: false },
            legend: { display: false },
            datalabels: {
              rotation: 90,
              color: (context) => {
                return context.dataIndex % 2 === 0 ? "#009895" : "#FEEF9A";
              },
              formatter: (_, context) =>
                context.chart.data.labels?.[context.dataIndex],
              font: { size: 30, weight: "bolder" },
            },
          },
        },
      });
      setSpinChart(chart);
    }
  }, []);

  const generateValue = (angleValue: number) => {
    for (const i of spinValues) {
      if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
        // setResultValue(i.value);
        setSpinning(false);
        break;
      }
    }
  };

  const handleSpin = () => {
    if (spinChart) {
      setSpinning(true);
      setResultValue(null);
      const randomDegree = Math.floor(Math.random() * 360);
      let count = 0;
      let resultValue = 101;
      const rotationInterval = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options = spinChart.options as any;
        if (options.rotation !== undefined) {
          options.rotation += resultValue;
        }
        spinChart.update();
        if ((options.rotation || 0) >= 360) {
          count += 1;
          resultValue -= 5;
          options.rotation = 0;
        } else if (count > 15 && (options.rotation || 0) === randomDegree) {
          generateValue(randomDegree);
          clearInterval(rotationInterval);
        }
      }, 10);
    }
  };

  return (
    <div className={styles.wheelContainer}>
      <Image
        height={1000}
        width={1000}
        src={"/backgrounds/wheel-ring-bg.png"}
        className="z-90 img absolute h-[29rem] w-[29rem]"
        style={{ zIndex: "999 !important" }}
        alt={""}
      />
      <Image
        height={1000}
        width={1000}
        src={"/backgrounds/red-dot.png"}
        className="z-90 absolute top-[41%] h-[1.8rem] w-[1.8rem]"
        style={{ zIndex: "999 !important" }}
        alt={""}
      />
      <canvas ref={canvasRef} className={styles.spinWheel}></canvas>
      <div className={styles.stopper}></div>
      <button
        id="spin_btn"
        className={styles.spinBtn}
        onClick={handleSpin}
        disabled={spinning}
      >
        Spin
      </button>
      <div className={styles.text}>
        <p>{resultValue}</p>
      </div>
    </div>
  );
};

export default SpinWheel;
