// "use client";
// import React, { useState } from "react";
// import Image from 'next/image';
// import { addDays, format } from "date-fns";
// import { Calendar as CalendarIcon } from "lucide-react";
// import { DateRange } from "react-day-picker";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// const HistoryFilter = () => {
//   const [open, setOpen] = useState(false);
//   const [date, setDate] = React.useState<DateRange | undefined>({
//     from: new Date(2022, 0, 20),
//     to: addDays(new Date(2022, 0, 20), 20),
//   });

//   return (
//     <Dialog defaultOpen={open} open={open} onOpenChange={(e) => setOpen(e)}>
//       <DialogTrigger asChild>
//         <button className="h-10 rounded-[10px] text-white px-4 py-2 text-[14px] focus:outline-none">
//           <Image
//             width={20}
//             height={20}
//             src="/icons/filter-icon.svg"
//             alt=""
//           />
//         </button>
//       </DialogTrigger>
//       <DialogContent className="h-[90vh] border-0 bg-[#262626ED] text-white md:w-screen md:max-w-fit">
//                     <DialogHeader>
//                       <DialogTitle className="mb-12 flex justify-between text-[16px] text-white md:text-[24px]">
//                         Filters
//                       </DialogTitle>
//                       <div className="grid gap-2">
//           <div className="flex items-center space-x-2">
//             <CalendarIcon className="h-4 w-4" />
//             <span className={cn("text-white", !date && "text-muted-foreground")}>
//               {date?.from ? (
//                 date.to ? (
//                   <>
//                     {format(date.from, "LLL dd, y")} -{" "}
//                     {format(date.to, "LLL dd, y")}
//                   </>
//                 ) : (
//                   format(date.from, "LLL dd, y")
//                 )
//               ) : (
//                 <span>Pick a date</span>
//               )}
//             </span>
//           </div>
//           <Calendar
//             initialFocus
//             mode="range"
//             defaultMonth={date?.from}
//             selected={date}
//             onSelect={setDate}
//             numberOfMonths={2}
//           />
//         </div>
//         <div>
//         <p className="text-[16px] uppercase font-semibold text-white mb-8 tracking-[0.2em] text-black md:text-[20px]">
//          Wallets
//           </p>
//         <div className="mb-6 flex flex-col items-center justify-start gap-4 px-4 md:flex-row md:gap-12">
//         <div className="flex items-center bg-[#38F68F] px-4 py-2">
//           <p className="text-[14px] uppercase font-semibold tracking-[0.2em] text-black md:text-[16px]">
//           EVERYONE
//           </p>
//         </div>
//         <p className="text-[14px] uppercase font-semibold tracking-[0.2em] text-white md:text-[16px]">
//         Past Transactions
//         </p>
//       </div>
//         </div>
//         <div className="flex justify-end"> 
//         <div className="mb-6 flex flex-col items-center justify-start gap-4 px-4 md:flex-row md:gap-12">
//         <div className="flex items-center border rounded-[8px] border-[#38F68F] px-4 py-2">
//           <p className="text-[14px] uppercase font-semibold tracking-[0.2em] text-white md:text-[16px]">
//           Reset
//           </p>
//         </div>
//         <div className="flex items-center rounded-[8px] bg-[#38F68F] px-4 py-2">
//           <p className="text-[14px] uppercase font-semibold tracking-[0.2em] text-black md:text-[16px]">
//           Apply
//           </p>
//         </div>
//       </div>
//         </div>
//                     </DialogHeader>
//                   </DialogContent>
//     </Dialog>
//   );
// };

// export default HistoryFilter;


