import { Navbar } from "../../app/_components/common/Navbar";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
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

const chartData = [
  { time: "10 am", token: 186 },
  { time: "11 am", token: 305 },
  { time: "12 pm", token: 237 },
  { time: "1 pm", token: 73 },
  { time: "2 pm", token: 209 },
  { time: "3 pm", token: 21 },
  { time: "4 pm", token: 204 },
  { time: "5 pm", token: 234 },
  { time: "6 pm", token: 74 },
  { time: "7 pm", token: 94 },
  { time: "8 pm", token: 35 },
  { time: "9 pm", token: 305 },
];

const chartConfig = {
  token: {
    label: "Token",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const Index = () => {
  const data = [
    {
      userId: "#USER3107L2106",
      amount: "89 TOKENS",
      date: "12/06/2023",
      time: "17:23 PM",
    },
    {
      userId: "#USER3107L2106",
      amount: "89 TOKENS",
      date: "12/06/2023",
      time: "17:23 PM",
    },
    {
      userId: "#USER3107L2106",
      amount: "89 TOKENS",
      date: "12/06/2023",
      time: "17:23 PM",
    },
    {
      userId: "#USER3107L2106",
      amount: "89 TOKENS",
      date: "12/06/2023",
      time: "17:23 PM",
    },
  ];
  const names = ["ARADHANA", "SILVER", "RAVI", "KIRAN", "PRIYA", "RAHUL"];
  return (
    <section>
      <Navbar />
      <div className="flex flex-col bg-[#121212] px-16 py-24">
        <div className="rounded-lg bg-[#1c1c1c] p-12">
          <div>
            <p className="text-[36px] text-white">USER DETAILS</p>
            <span className="py-8 text-[20px] text-white">
              BALANCE: <span className="text-[#38F68F]"> 102 TOKENS</span>
            </span>
            <div className="flex flex-col gap-4 py-8 text-[20px] text-white">
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <p className="w-1/3 rounded-md bg-[#414042] px-12 py-2 text-center text-[20px]">
                  ARADHANA
                </p>
                <p className="w-1/3 rounded-md bg-[#414042] px-12 py-2 text-center text-[20px]">
                  SINGH
                </p>
                <p className="w-1/3 rounded-md bg-[#414042] px-12 py-2 text-center text-[20px]">
                  CITY: KOLKATA
                </p>
              </div>
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <p className="w-1/2 rounded-md bg-[#414042] px-12 py-2 text-center text-[20px]">
                  9123002126
                </p>
                <p className="w-1/2 rounded-md bg-[#414042] px-12 py-2 text-center text-[20px]">
                  ARADHANASINGH@GMAIL.COM
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-10">
              <div className="flex flex-col gap-2 text-[13px] text-black md:flex-row">
                <button className="rounded-full bg-[#38F68F] px-10 py-2">
                  MINING HISTORY
                </button>
                <button className="rounded-full bg-[#282828] px-10 py-2 text-white">
                  TRANSFER HISTORY
                </button>
              </div>
            </div>
            <div className="flex h-full w-full">
              <Card
                style={{
                  width: "100%",
                  height: "80vh",
                  backgroundColor: "transparent",
                  border: "none",
                }}
              >
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <BarChart
                      accessibilityLayer
                      data={chartData}
                      margin={{ top: 20 }}
                      height={360}
                      style={{ maxHeight: "500px" }}
                    >
                      <XAxis
                        dataKey="time"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        tickFormatter={(value) => value}
                        tick={{ fontSize: 16 }}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <CartesianGrid horizontal={false} vertical={false} />
                      <Bar dataKey="token" fill="#38F68F">
                        <LabelList
                          position="top"
                          offset={12}
                          className="fill-foreground"
                          fontSize={16}
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            <div>
              <button className="text-white underline">See all</button>
            </div>
          </div>
          <div className="flex justify-center">
            <Dialog>
              <DialogTrigger
                asChild
                className="mt-4 flex w-full items-center justify-center"
              >
                <button className="flex w-full items-center justify-center rounded-full bg-[#E34D4D] py-2 text-center text-[12px] text-white md:w-1/3 md:py-0 md:text-[26px]">
                  DELETE ACCOUNT
                </button>
              </DialogTrigger>
              <DialogContent className="border-0 bg-[#262626ED] bg-black sm:max-w-[425px] text-white">
                <DialogHeader>
                  <DialogDescription className="mb-16 text-center text-[28px] text-white">
                    Are you sure you want to delete this account?
                  </DialogDescription>
                  <div className="mt-4 flex w-full items-center justify-center">
                    <button className="flex w-full items-center justify-center rounded-full bg-[#E34D4D] text-center text-[12px] text-white md:w-1/3 md:text-[20px]">
                      DELETE
                    </button>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Index;
