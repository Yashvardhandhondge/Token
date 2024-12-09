import { Navbar } from '../../app/_components/common/Navbar';
import React, { useEffect, useState } from 'react';
import styles from '../../styles/ScratchCard.module.css';
import { api } from '@/trpc/react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';


const ScratchCard = () => {
  const router = useRouter();
  const { status } = useSession();
  useEffect(() => {
    if (router.isReady) {
      if (status === "unauthenticated") {
        void router.push("/auth/login");
      }
    }
  }, [router, status]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prizeValue, setPrizeValue] = useState<any>("0");
  const [canScratch, setCanScratch] = useState<boolean>(false);

  const { mutate: getScratchValue,isPending: isValuePending } = api.global.scratch.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPrizeValue(data.winningValue)
    },
  });

  const { mutate: getScratchStatus, isPending } = api.global.scratchLimit.useMutation({
    onSuccess: (data) => {
      setCanScratch(data.allow);
    },
    onError: (error) => {
      console.error("Error occurred:", error);
    }
  });

  useEffect(() => {
    getScratchStatus();
  }, [getScratchStatus]);

  useEffect(() => {
    const canvasElement = document.getElementById("scratch") as HTMLCanvasElement;
    const canvasContext = canvasElement.getContext("2d")!;
    let isDragging = false;
    const scratchThreshold = 0.3;
    const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const totalPixels = imageData.data.length / 4;

    const initializeCanvas = () => {
      const image = new Image();
      image.src = '/backgrounds/scratch-card.png';

      image.onload = () => {
        canvasContext.drawImage(image, 0, 0, canvasElement.width, canvasElement.height);
        const prizeOptions = [
          "1", "5", "10", "20", "25", "30", "35", "40", "45", "50"
        ];
        const randomPrize = prizeOptions[Math.floor(Math.random() * prizeOptions.length)];
        // setPrizeValue(randomPrize ?? "0");
      };
    };

    const scratch = (x: number, y: number) => {
      if (!canScratch) return; // Ensure you only scratch if canScratch is true

      canvasContext.globalCompositeOperation = "destination-out";
      canvasContext.beginPath();
      canvasContext.arc(x, y, 50, 0, 2 * Math.PI);
      canvasContext.fill();
      checkScratchPercentage();
    };

    const checkScratchPercentage = () => {
      const scratchedImageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
      let scratchedPixels = 0;

      for (let i = 0; i < scratchedImageData.data.length; i += 4) {
        if (scratchedImageData.data[i + 3] === 0) {
          scratchedPixels++;
        }
      }

      const scratchedPercentage = scratchedPixels / totalPixels;

      if (scratchedPercentage >= scratchThreshold) {
        canvasContext.globalCompositeOperation = "destination-out";
        canvasContext.fillStyle = "black";
        canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
      }
    };

    const getMouseCoordinates = (event: MouseEvent | TouchEvent) => {
      const rect = canvasElement.getBoundingClientRect();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      // @ts-expect-error good
      const x = (event.pageX || (event as TouchEvent).touches[0].pageX) - rect.left;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      // @ts-expect-error good
      const y = (event.pageY || (event as TouchEvent).touches[0].pageY) - rect.top;
      return { x, y };
    };
    const handleMouseDown = (event: MouseEvent | TouchEvent) => {
      if (!canScratch) return;
      isDragging = true;
      const { x, y } = getMouseCoordinates(event);
      scratch(x, y);
      if (canScratch) {
        getScratchValue();
      }
    };

    const handleMouseMove = (event: MouseEvent | TouchEvent) => {
      if (isDragging && canScratch) {
        event.preventDefault();
        const { x, y } = getMouseCoordinates(event);
        scratch(x, y);
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseLeave = () => {
      isDragging = false;
    };

    const isTouchDevice = 'ontouchstart' in window;

    canvasElement.addEventListener(isTouchDevice ? "touchstart" : "mousedown", handleMouseDown);
    canvasElement.addEventListener(isTouchDevice ? "touchmove" : "mousemove", handleMouseMove);
    canvasElement.addEventListener(isTouchDevice ? "touchend" : "mouseup", handleMouseUp);
    canvasElement.addEventListener("mouseleave", handleMouseLeave);

    initializeCanvas();

    return () => {
      canvasElement.removeEventListener(isTouchDevice ? "touchstart" : "mousedown", handleMouseDown);
      canvasElement.removeEventListener(isTouchDevice ? "touchmove" : "mousemove", handleMouseMove);
      canvasElement.removeEventListener(isTouchDevice ? "touchend" : "mouseup", handleMouseUp);
      canvasElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [canScratch]);

  return (
    <section className='w-full'>
      <Navbar />
      <div className='w-full flex flex-row'>
      <img src="/icons/back_arrow_white.svg" onClick={()=>router.push('/dashboard')} className="absolute left-[3%] top-[10%] md:left-[2%] z-40 cursor-pointer h-10 w-10" alt={"back_icon"}/>
        <div className='w-[45%] scratch-card-bg md:flex hidden flex-col justify-end items-start text-[48px] text-white'>
          <div className='bg-black bg-opacity-20 shadow-lg backdrop-blur-md border-white border-opacity-30 w-full py-8 px-12'>
            <p>Scratch & Win</p>
          </div>
        </div>
        <div className='w-full md:w-[55%] h-full min-h-screen bg-black pb-12'>
          <div className="flex flex-col justify-end h-full items-end text-white pt-20 md:pt-20 pl-16 pr-6">
            <div className={styles.container}>
              <div className={styles.base}>
                {isValuePending ? 
                <p className="absolute left-[25%] bottom-[11%] text-black py-[10px] font-bold text-[12px]">loading</p>
                :
                <h3 className="absolute left-[25%] bottom-[11%] text-black font-bold text-[44px]">{prizeValue}</h3>
                }
              </div>
              <canvas
                id="scratch"
                width="500"
                height="500"
                className={styles.scratch}
              ></canvas>
              {!canScratch &&
            <p className="uppercase text-black absolute top-[35%] -left-[172px] w-[21.5rem] text-center bg-white py-2">unlocks after 24hrs</p>
              }
            </div>
            <div className="h-[80vh] flex justify-end items-end text-center">
              <span className="flex"><p className="p-2 border-[1px] rounded-full h-6 w-6 text-center flex justify-center items-center">i</p> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</span>
            </div>
              
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScratchCard;
