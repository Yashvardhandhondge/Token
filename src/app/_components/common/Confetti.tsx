"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React ,{useState ,useEffect} from "react";

type ConfettiProps = {
  width: number;
  height: number;
};

const Confetti: React.FC<ConfettiProps> = ({ width, height }) => {
  
    const [screenWidth, setScreenWidth] = useState(0);
    const [screenHeight, setScreenHeight] = useState(0);
    const [showConfetti, setShowConfetti] = useState(true);
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
  
      return () => {
        clearTimeout(timer);
      };
    }, []);
  
    useEffect(() => {
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
        setScreenHeight(window.innerHeight);
      };

      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
  return (
    <div>
        {showConfetti &&
      <Confetti width={screenWidth} height={screenHeight} />}
    </div>
    
  );
};
