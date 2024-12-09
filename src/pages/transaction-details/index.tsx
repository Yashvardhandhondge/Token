import { Navbar } from "../../app/_components/common/Navbar";
import React from "react";
import { Button } from "../../components/ui/button";
import Image from "next/image";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
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
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <section>
      <Navbar />
      <div className="flex flex-col bg-[#121212] px-16 py-24">
        <div className="rounded-lg bg-[#1c1c1c] p-12">
          <div className="flex w-full flex-col md:w-3/4">
            <Card
              style={{
                width: "100%",
                backgroundColor: "transparent",
                border: "none",
              }}
            >
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ top: 20, right: 0, bottom: 0, left: 0 }}
                    height={360}
                    style={{ width: "100%" }}
                  >
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value as string}
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
            <p className="text-[36px] text-white">Transaction Details</p>
            <div className="flex justify-between pt-10">
              <div className="flex flex-col gap-2 text-[13px] text-black md:flex-row">
                <button className="rounded-full bg-[#38F68F] px-10 py-2">
                  Global
                </button>
                <button className="rounded-full bg-[#282828] px-10 py-2 text-white">
                  USER
                </button>
                <button className="rounded-full bg-[#282828] px-10 py-2 text-white">
                  BURN
                </button>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="h-12 rounded-[4px] bg-[#282828] px-4 py-2 text-white">
                    Filter
                  </button>
                </DialogTrigger>
                <DialogContent className="h-[90vh] w-screen max-w-fit border-0 bg-[#262626ED] bg-black text-white">
                  <DialogHeader>
                    <DialogTitle className="text-[30px] uppercase text-white">
                      Filter
                    </DialogTitle>
                    <DialogDescription className="flex max-h-[75vh] w-full flex-col justify-start overflow-auto rounded-[10px] bg-[#292929] p-2 md:w-[100vh] md:p-8">
                      <DialogTitle className="mb-8 text-[30px] uppercase text-white">
                        Sort By
                      </DialogTitle>
                      <p className="mb-4 text-[24px] uppercase text-white">
                        DATE
                      </p>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="w-[275px] rounded-[16px] bg-[#141414] text-white"
                      />
                      <p className="my-4 text-[24px] uppercase text-white">
                        WALLETS
                      </p>
                      <div className="flex flex-col gap-2 text-[13px] text-black md:flex-row">
                        <button className="rounded-full bg-[#38F68F] px-10 py-2">
                          EVERYONE
                        </button>
                        <button className="rounded-full bg-[#414042] px-10 py-2 text-white">
                          past transactions
                        </button>
                      </div>
                      <p className="my-4 text-[24px] uppercase text-white">
                        TIME
                      </p>
                      <div className="flex flex-col gap-2 text-[13px] text-black md:flex-row">
                        <button className="rounded-full bg-[#38F68F] px-10 py-2">
                          12:00 - 13:00
                        </button>
                        <button className="rounded-full bg-[#414042] px-10 py-2 text-white">
                          13:00 - 14:00
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col items-center justify-center gap-8 text-[13px] text-black md:flex-row">
                        <button className="py-2 text-[20px] text-[#EF1818]">
                          Reset
                        </button>
                        <button className="rounded-[4px] bg-[#414042] px-8 py-2 text-[20px] text-[#38F68F]">
                          Apply
                        </button>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto">
              <div className="my-8 max-h-[400px] overflow-y-auto">
                <table className="min-w-full rounded-[12px] bg-[#2a2a2a] text-white">
                  <thead>
                    <tr className="border-b bg-[#2a2a2a]">
                      <th className="custom-th bg-[#2a2a2a] px-4 py-2">
                        USER ID
                      </th>
                      <th className="custom-th bg-[#2a2a2a] px-4 py-2">
                        AMOUNT
                      </th>
                      <th className="custom-th bg-[#2a2a2a] px-4 py-2">DATE</th>
                      <th className="custom-th bg-[#2a2a2a] px-4 py-2">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => (
                      <tr key={index} className="text-center">
                        <td className="bg-[#2a2a2a] px-4 py-2">{row.userId}</td>
                        <td className="bg-[#2a2a2a] px-4 py-2">{row.amount}</td>
                        <td className="bg-[#2a2a2a] px-4 py-2">{row.date}</td>
                        <td className="bg-[#2a2a2a] px-4 py-2">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Index;
