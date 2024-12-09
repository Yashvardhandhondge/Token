"use client";
import React, { useState, useEffect } from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { api } from '@/trpc/react';

interface GraphItem {
  date: string;
  burnt: number;
  mined: number;
  available: number;
}

const chartConfig: ChartConfig = {
  burnt: {
    label: "Burnt",
    color: "hsl(var(--chart-1))",
  },
  mined: {
    label: "Mined",
    color: "hsl(var(--chart-2))",
  },
  available: {
    label: "Available",
    color: "hsl(var(--chart-3))",
  }
};

interface TextContent {
  title: string;
  available?: string;
  mined?: string;
  burnt?: string;
  color: string;
}

export const GraphSection = () => {
  const { data } = api.global.graph.useQuery<GraphItem[]>();
  const [bgImage, setBgImage] = useState<string>("/backgrounds/hero-green-card.png");
  const [textContent, setTextContent] = useState<TextContent>({
    title: "TOKENS MINED",
    available: "TOKENS MINED: 100,000 TOKENS",
    color: '38F68F'
  });
  const [visibleLines, setVisibleLines] = useState<Set<string>>(new Set(['mined']));

  useEffect(() => {
    if (data && data.length > 0) {
      const latestItem = data[data.length - 1];
      if (latestItem) {
        setTextContent(prev => ({
          ...prev,
          available: `TOKENS AVAILABLE: ${latestItem.available}`,
          mined: `TOKENS MINED: ${latestItem.mined}`,
          burnt: `BURNT TOKENS: ${latestItem.burnt}`,
        }));
      }
    }
  }, [data]);
  

  const chartData: { date: string; burnt: number; mined: number; available: number }[] = data?.map(item => ({
    date: item.date,
    burnt: item.burnt,
    mined: item.mined,
    available: item.available
  })) ?? [];

  const handleButtonClick = (image: string, text: TextContent, lines: string[]) => {
    setBgImage(image);
    setTextContent(text);
    setVisibleLines(new Set(lines));
  };

  return (
    <div className='h-full pb-12 w-full flex flex-col justify-center items-center gap-12 px-8'>
      <div className='flex flex-col md:flex-row gap-12 justify-center items-center'>
        <div className='relative w-full md:w-[30%] flex justify-center'>
          <img src="/backgrounds/hero-green-card.png" className='w-full h-full object-cover' alt="card" />
          <div className='absolute inset-0 flex justify-center items-center flex-col px-8'>
            <h1 className='text-2xl lg:text-4xl font-bold text-[#38F68F]'>PLAY TO EARN INCENTIVE PROGRAM</h1>
            <p className='text-[16px] mt-12 text-[#A7B0AF]'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque culpa hic labore obcaecati.</p>
          </div>
        </div>
        <div className='w-full md:w-auto'>
          <img src="/backgrounds/coin-drop.png" alt="card" className='w-full h-auto md:w-auto md:h-full' />
        </div>
      </div>
      <div className='flex flex-col w-3/4 md:flex-row gap-12 justify-center items-center'>
        <div className='md:w-[60%] w-[150%] h-auto bg-[#202020] pt-8 flex'>
          <div className="w-3/4">
            <Card style={{ backgroundColor: "#202020", border: "none" }}>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value: string) => value.slice(0, 2)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    {visibleLines.has('burnt') && (
                      <Line
                        dataKey="burnt"
                        type="linear"
                        stroke="var(--color-burnt)"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                    {visibleLines.has('mined') && (
                      <Line
                        dataKey="mined"
                        type="linear"
                        stroke="var(--color-mined)"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                    {visibleLines.has('available') && (
                      <Line
                        dataKey="available"
                        type="linear"
                        stroke="var(--color-available)"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          <div className="w-1/4 flex flex-col justify-center items-start gap-8">
            <div className="flex gap-2 justify-center items-center">
              <button
                className="h-[2rem] w-[2rem] rounded-md bg-[#38F68F]"
                onClick={() => handleButtonClick("/backgrounds/hero-green-card.png", {
                  title: "TOKENS MINED",
                  mined: `TOKENS MINED: ${data && data.length > 0 ? data[data.length - 1]?.mined ?? 'N/A' : 'N/A'} TOKENS`,
                  color: '38F68F'
                }, ['mined'])}
              ></button>
              <p className="text-[#38F68F] md:text-[14px] text-[12px]">TOKENS MINED</p>
            </div>
            <div className="flex gap-2 justify-center items-center">
              <button
                className="h-[2rem] w-[2rem] rounded-md bg-[#EF1818]"
                onClick={() => handleButtonClick("/backgrounds/hero-red-card.png", {
                  title: "BURNT TOKENS",
                  burnt: `BURNT TOKENS: ${data && data.length > 0 ? data[data.length - 1]?.burnt : 'N/A'} TOKENS`,
                  color: 'EF1818'
                }, ['burnt'])}
              ></button>
              <p className="text-[#EF1818] md:text-[14px] text-[12px]">BURNT TOKENS</p>
            </div>
            <div className="flex gap-2 justify-center items-center">
              <button
                className="h-[2rem] w-[2rem] rounded-md bg-[#FFF500]"
                onClick={() => handleButtonClick("/backgrounds/hero-yello-card.png", {
                  title: "TOKENS AVAILABLE",
                  available: `TOKENS AVAILABLE: ${data && data.length > 0 ? data[data.length - 1]?.available ?? 'N/A' : 'N/A'}`,
                  color: 'FFF500'
                }, ['available'])}
              ></button>
              <p className="text-[#FFF500] text-[12px]">TOKENS AVAILABLE</p>
            </div>
          </div>
        </div>
        <div className='relative w-full md:w-[30%] flex justify-center'>
          <img src={bgImage} className='w-full h-full object-cover' alt="card" />
          <div className='absolute inset-0 flex justify-center gap-6 items-start flex-col px-8'>
            <h1 className={`text-2xl lg:text-4xl font-bold text-[#${textContent.color}]`}>{textContent.title}</h1>
            {textContent.mined && <p className='md:text-[16px] text-[12px] mt-8 text-white'>{textContent.mined}</p>}
            {textContent.available && <p className='md:text-[16px] text-[12px] text-white'>{textContent.available}</p>}
            {textContent.burnt && <p className='md:text-[16px] text-[12px] text-white'>{textContent.burnt}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
