import { Navbar } from "../../app/_components/common/Navbar";
import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import styles from "@/styles/SpinWheel.module.css";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Confetti from "confetti-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const spinValues = [
  { minDegree: 61, maxDegree: 90, value: 100 },
  { minDegree: 31, maxDegree: 60, value: 200 },
  { minDegree: 0, maxDegree: 30, value: 300 },
  { minDegree: 331, maxDegree: 360, value: 400 },
  { minDegree: 301, maxDegree: 330, value: 500 },
  { minDegree: 271, maxDegree: 300, value: 600 },
  { minDegree: 241, maxDegree: 270, value: 700 },
  { minDegree: 211, maxDegree: 240, value: 800 },
  { minDegree: 181, maxDegree: 210, value: 900 },
  { minDegree: 151, maxDegree: 180, value: 1000 },
  { minDegree: 121, maxDegree: 150, value: 1100 },
  { minDegree: 91, maxDegree: 120, value: 1200 },
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

const index = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { status } = useSession();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (router.isReady) {
      if (status === "unauthenticated") {
        void router.push("/auth/login");
      }
    }
  }, [router, status]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [resultValue, setResultValue] = useState<number | null>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [spinChart, setSpinChart] = useState<Chart | null>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [spinning, setSpinning] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [wonDialogOpen, setWonDialogOpen] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showConfetti, setShowConfetti] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isSpinnerDone, setIsSpinnerDone] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [canSpin, setCanSpin] = useState<boolean>(false);

  const { mutate: getSpinnerValue } = api.global.spinner.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log(data.winningValue);
      setIsSpinnerDone(true);
      setResultValue(data.winningValue);
    },
  });

  const { mutate: getSpinStatus, isPending } = api.global.spinLimit.useMutation(
    {
      onSuccess: (data) => {
        setCanSpin(data.allow);
      },
      onError: (error) => {
        console.error("Error occurred:", error);
      },
    },
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    getSpinStatus();
  }, [getSpinStatus]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (canvasRef.current) {
      const chart = new Chart(canvasRef.current, {
        plugins: [ChartDataLabels],
        type: "pie",
        data: {
          // labels: Array.from({ length: 12 }, (_, i) => (i + 1).toString()),
          labels: Array.from({ length: 12 }, () => "?"),
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

  // const {mutate , isPending}= api.global.spinner.useMutation({
  //   onSuccess: (data: any) => {
  //     console.log(data);
  //   }
  // })

  const generateValue = (angleValue: number) => {
    for (const i of spinValues) {
      if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
        // setResultValue(i.value);
        setWonDialogOpen(true);
        setShowConfetti(true);
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
    getSpinnerValue();
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [screenWidth, setScreenWidth] = useState(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [screenHeight, setScreenHeight] = useState(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth / 1.85);
      setScreenHeight(window.innerHeight);
    };

    // Initial setup
    setScreenWidth(window.innerWidth / 1.85);
    setScreenHeight(window.innerHeight);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [showConfetti]);

  const handleCloseDialog = () => {
    setWonDialogOpen(false);
    router.push("/dashboard");
  };

  return (
    <section className="">
      <Navbar />
      <div className="wheel-bg flex h-screen w-full flex-col bg-opacity-40 pt-20 text-white lg:flex-row">
        <Image src="/icons/back_arrow_white.svg" onClick={()=>router.push('/dashboard')} className="absolute left-[1%] cursor-pointer" height={40} width={40} alt={"back_icon"}/>
        <div className="flex h-full w-full flex-col items-start justify-center px-8 md:w-1/2 md:px-20">
          <p className="text-[20px]">Lorem Ipsum</p>
          <p className="text-[38px] text-[#38F68F] md:text-[64px]">
            Spin & Win
          </p>
          <p className="text-[12px] md:text-[18px]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio
            nobis iure nemo inventore, neque saepe illo commodi dignissimos
            corrupti officiis expedita dolorem illum.
          </p>
          <button
            className={cn(
              "mt-8 rounded-full px-5 py-4 font-[550] text-black",
              canSpin ? "bg-[#38F68F]" : "bg-gray-400",
            )}
            onClick={handleSpin}
            data-tooltip-target="tooltip-default"
            disabled={!canSpin}
          >
            Spin the Wheel
          </button>
        </div>
        <div className="flex h-full w-full justify-center md:w-1/2 md:items-start">
          <div className={styles.wheelContainer}>
            <Image
              height={100}
              width={1000}
              src={"/backgrounds/wheel-ring-bg.png"}
              className={`z-90 img absolute h-[18.5rem] w-[18.5rem] sm:h-[29rem] sm:w-[29rem] md:h-[29rem] md:w-[29rem] ${styles.backgroundImageSpinner}`}
              // style={{ zIndex: "999 !important" }}
              alt={""}
            />
            <Image
              height={1000}
              width={1000}
              src={"/backgrounds/red-dot.png"}
              className={`z-90 absolute top-[42%] md:top-[47%] md:h-[1.8rem] md:w-[1.8rem] md:left-[48%] ${styles.backgroundImage}`}
              // style={{ zIndex: "999 !important" }}
              alt={""}
            />
            <canvas ref={canvasRef} className={`w-[100%] h-[100%] ${styles.spinWheel}`}></canvas>
            <div className={styles.stopper}></div>
          </div>
        </div>
        <Dialog open={wonDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="h-[90vh] w-screen border-0 bg-[#262626ED] text-white md:w-screen md:max-w-fit">
            {showConfetti && (
              <Confetti
                gravity={0.1}
                numberOfPieces={300}
                width={screenWidth}
                height={screenHeight}
              />
            )}
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription className="flex h-full w-full flex-col items-center justify-center px-4 md:w-[100vh]">
                <div className="flex w-full items-center justify-center text-[20px] font-semibold text-white md:text-[40px]">
                  <p>🎉 You’ve Won {resultValue ?? 0} Tokens! 🎉</p>
                </div>
                <div className="mt-12 flex w-3/4 flex-col items-center justify-center text-center leading-9 text-white md:mt-20">
                  <p className="text-[12px] font-semibold md:text-[22px]">
                    These tokens bring you one step closer to unlocking exciting
                    rewards and benefits.
                  </p>
                  <p className="mt-20 text-[12px] md:text-[14px]">
                    Next spin after 24hrs.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default index;