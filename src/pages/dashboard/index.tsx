"use client";

import { Navbar } from "@/app/_components/common/Navbar";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Line, LineChart } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useState, useEffect, ChangeEvent, ChangeEventHandler } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/router";
import { api } from "@/trpc/react";
import {
  userName,
  formatFirestoreTimestamp,
  getAmountAfterTxnCost,
} from "@/utils/random";
import Confetti from "confetti-react";
import { ProfileSidebar } from "@/app/_components/dashboard/ProfileSidebar";
import QRCodeGenerator from "@/app/_components/dashboard/QRgenerator";
import useLocalStorage from "@/hooks/storage/localStorage";
import QRCode from "qrcode.react";
import ScanDialog from "@/app/_components/common/QrScannerPopup";
import { CarouselAds } from "@/app/_components/dashboard/CarousalAds";
import { useSwipeable } from "react-swipeable";
import { TooltipProps } from "recharts";
import MobileNav from "@/app/_components/common/MobileNav";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import TokensCount from "@/app/_components/common/TokensCount";
import PaginatedUserList from "@/app/_components/common/PagedUserList";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TokenChartTooltipContent(props: TooltipProps<any, any>) {
  const { payload, label } = props;
  if (!payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  return (
    <div className="rounded border bg-white p-2 shadow">
      <p className="text-sm font-medium">{`Date: ${data.date}`}</p>
      <p className="text-sm font-medium">{`Tokens: ${data.token}`}</p>
    </div>
  );
}

const chartConfig = {
  token: {
    label: "token",
    color: "hsl(var(--chart-1))",
  },
};

// const [searchParam,setSearchParam]=useState<string>()
interface UserDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: string;
}
export default function Dashboard() {
  const { data: session, status } = useSession();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const router = useRouter();
  const { data: user } = api.user.getUserDetailsByUserId.useQuery();
  const {data:remainingToken } = api.global.getRemainingToken.useQuery();
  const [userIds, setUserIds] = useState<string[]>(["1","2","3","4","5","6","7","8","9","10"]);
  const [amount, setAmount] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false); 
  const [userId] = useLocalStorage<string>("userId", "");
  const [qrUserId, setQrUserId] = useState<string>("12345");
  const [wonDialogOpen, setWonDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);
  const [redeemCode, setRedeemCode] = useState<string>("");
  const [codeRedeemValue, setCodeRedeemValue] = useState<number>(0);
  const [codeRedeemPopup, setCodeRedeemPopup] = useState(false);
  const [profileProgress, setProfileProgress] = useState<number>(0);
  const [addNote, setAddNote] = useState("");
  const [rows, setRows] = useState(3);
  const { data: userDetails } = api.user.getUserDetailsByUserId.useQuery();
  useEffect(() => {
    if (router.isReady) {
      if (status === "unauthenticated") {
        void router.push("/auth/login");
      }
    }
  }, [router, status]);
  useEffect(() => {
    console.log("userDetails", userDetails);
    
    if (userDetails) {
      const fields: (keyof UserDetails)[] = [
        "name",
        "email",
        "phone",
        "address",
        "gender",
      ];
      const completedFields = fields.filter(
        (field) =>
          userDetails[field] !== null && userDetails[field] !== undefined,
      );
      const progress = (completedFields.length / fields.length) * 100;
      setProfileProgress(progress);
    }
  
  }, [userDetails]);

  const { mutate, isPending } = api.user.findUserByUserId.useMutation({
    onSuccess: (data) => {
      setUserIds(data.map((e) => e));
    },
  });
  const { data: allTxn } = api.txn.getLatestTxnByUserId.useQuery({ limit: 10 });
  const {
    data: txn,
    fetchNextPage,
    hasNextPage,
    hasPreviousPage,
  } = api.txn.getLatestTxnByUserIdInf.useInfiniteQuery(
    {
      limit: rows,
    },
    {
      getNextPageParam: (last) => last.lastVisible,
      getPreviousPageParam: (prev) => prev.lastVisible,
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTimestamp = (timestamp: any) => {
    const date = new Date(
      timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000,
    );
    return date.toLocaleString();
  };
  const { data: graph } = api.txn.getTxnGraphByUserId.useQuery();
  const chartData = graph?.map((value, index) => ({
    name: index + 1,
    token: typeof value === "string" ? parseInt(value) : value.amount,
    date: formatTimestamp(value.timestamp),
  }));

  console.log(chartData);

  const { mutate: send } = api.txn.send.useMutation({
    onSuccess: (data) => {
      setShowConfetti(true);
      setWonDialogOpen(true);
    },
  });
  const { mutate: redeemPromoCode } = api.global.promocode.useMutation({
    onSuccess: (data) => {
      console.log(data.value);
      setCodeRedeemValue(data.value);
      setCodeRedeemPopup(true);
    },
  });

  const handleNextPage = async () => {
    await fetchNextPage();
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageNumberClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const { data: transaction } = api.user.getUserDetailsByUserId.useQuery();

  // const userIds = ['#USER3107L2106', '#USER3107L2107', '#USER3107L2108'];
  const [activeSlide, setActiveSlide] = useState(0);

  const handleSlideChange = (index: number) => {
    setActiveSlide(index);
  };

  const handleSpinWheel = () => {
    void router.push("/wheel-spinner");
  };
  const handleScratchCard = () => {
    void router.push("/scratch-card");
  };

  const handleSearch = (userId: string) => {
    if (userId.toString().length < 5) {
      setUserIds([]);
      return;
    }
    mutate({ userId });
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleCoinTransfer = (amount: number, selectedUser: string, from: string) => {
    if (amount < 100) {
      alert("please transfer tokens more than 100");
      return;
    }
    if(from == selectedUser){
      alert("you can't transfer tokens to yourself");
      return;
    }
    if (selectedUser) {
      // send({ to: selectedUser, amt: Number(amount), note: addNote });
      send({ to: selectedUser, amt: Number(amount) });
    }
  };

  useEffect(() => {
    setQrUserId(userId);
  }, []);
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

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(qrUserId)
      .then(() => {
        console.log("logs");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide === 1 ? 0 : 1));
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const numbers = Array.from({ length: 4 }, (_, i) => (i + 1) * 3);

  const handleRedeemCode = () => {
    redeemPromoCode({ code: redeemCode });
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSlideChange((activeSlide + 1) % 2),
    onSwipedRight: () => handleSlideChange((activeSlide - 1 + 2) % 2),
    // preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });


  if(screenWidth < 768){
    return <>
      <MobileNav  handleSearch={handleSearch} userId={userId} userIds={userIds} handleSelectUser={handleSelectUser} setAmount={setAmount} qrUserId={qrUserId} selectedUser={selectedUser} addNote={addNote} handleCoinTransfer={handleCoinTransfer} amount={amount} setAddNote={setAddNote} setSelectedUser={setSelectedUser} />
      <div className='flex flex-col gap-8 p-4 mb-16'>
        <CarouselAds />
        <div className="grid grid-cols-2 gap-8">
          <div className="dashboard-card-bg flex h-[150px] w-full flex-col justify-between rounded-xl border-[1px] border-[#2D2D2D] p-4 md:w-2/5">
                <p className="text-[16px] text-white">Available tokens</p>
                <p className="text-[40px] text-[#38F68F] md:text-[44px]">
                  {user?.balance.toLocaleString() ?? "0"}
                </p>
              
          </div>
          <Carousel>
            <CarouselContent>
            <CarouselItem>
            <div className="dashboard-card-bg flex h-[150px] w-full flex-col rounded-xl border-[1px] border-[#2D2D2D] p-4 md:w-3/5">
              <div className="flex justify-between">
                <p className="mb-4 text-white">Mining History</p>
                
              </div>
              <Card style={{ backgroundColor: "transparent", border: "none" }}>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    style={{ height: "100px", width: "100%" }}
                  >
                    <LineChart data={chartData} style={{ height: "100%" }}>
                      <ChartTooltip
                        cursor={false}
                        content={<TokenChartTooltipContent />}
                      />
                      <Line
                        dataKey="token"
                        type="linear"
                        stroke="var(--color-token)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>  
        <TokensCount burnt={remainingToken?.burnt ?? 0} remainingToken={remainingToken?.remainingToken ?? 0} />
      </div>
      <div className="flex flex-col gap-8 mb-40  text-white md:flex-row">
          <div className="flex h-[500px] w-full flex-col items-center justify-center md:w-2/3">
            <div className="flex w-full flex-row justify-between gap-12 pb-6">
              <p className="text-[20px] font-semibold px-3">Recent Transfers</p>
              {/* <span className="flex gap-2">
                <Image
                  width={20}
                  height={20}
                  src="/icons/filter-icon.svg"
                  alt=""
                />
                <p className="text-[#38F68F]">See all transfers</p>
              </span> */}
            </div>
            <div className="-m-1.5 w-full">
              <div className="inline-block min-w-full p-1.5 ">
                <div className="overflow-hidden">
                  <div className="max-w-[400px] overflow-x-auto md:max-w-full">
                    <table className="min-w-full divide-y divide-[#38F68F] text-[#A7B0AF]">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-[16px] font-medium uppercase text-[#A7B0AF]"
                          >
                            Sender ID
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-[16px] font-medium uppercase text-[#A7B0AF]"
                          >
                            Receiver ID
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-[16px] font-medium uppercase text-[#A7B0AF]"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-end text-[16px] font-medium uppercase text-[#A7B0AF]"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-end text-[16px] font-medium uppercase text-[#A7B0AF]"
                          >
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {txn?.pages[currentPage - 1]?.transactions?.map(
                          (transaction, index) => (
                            <tr key={index}>
                              <td className="whitespace-nowrap px-6 py-4 text-[16px] font-medium text-white">
                                {userName(transaction.from)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-[16px] font-medium text-white">
                                {userName(transaction.to)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-[16px] text-white">
                                {transaction.amount}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-end text-[16px] text-white">
                                {
                                  formatFirestoreTimestamp(
                                    transaction.timestamp,
                                  )?.date
                                }
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-end text-[16px] text-white">
                                {
                                  formatFirestoreTimestamp(
                                    transaction.timestamp,
                                  )?.time
                                }
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8 flex w-full justify-end px-4 py-4 text-[16px]">
                    <Dialog
                      open={wonDialogOpen}
                      onOpenChange={setWonDialogOpen}
                    >
                      <DialogContent className="h-[90vh] w-screen border-0 bg-[#262626ED] text-white md:w-screen md:max-w-fit">
                        <DialogHeader>
                          <DialogDescription className="flex h-full w-full flex-col items-center justify-center px-4 md:w-[100vh]">
                            <div className="flex w-full items-center justify-center text-[40px] font-semibold text-white">
                              <Image
                                width={120}
                                height={120}
                                src="/icons/correct-icon.png"
                                className=""
                                alt="img"
                              />
                            </div>
                            <div className="mt-12 flex w-full items-center justify-center text-[40px] font-bold text-[#38F68F] md:mt-20">
                              <p>{amount ?? 0} Tokens!</p>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={wonDialogOpen}
                      onOpenChange={setWonDialogOpen}
                    >
                      <DialogContent className="h-[90vh] w-screen border-0 bg-[#262626ED] text-white md:w-screen md:max-w-fit">
                        <DialogHeader>
                          <DialogDescription className="flex h-full w-full flex-col items-center justify-center px-4 md:w-[100vh]">
                            <div className="flex w-full items-center justify-center text-[40px] font-semibold text-white">
                              <Image
                                width={120}
                                height={120}
                                src="/icons/correct-icon.png"
                                className=""
                                alt="img"
                              />
                            </div>
                            <div className="mt-12 flex w-full items-center justify-center text-[40px] font-bold text-[#38F68F] md:mt-20">
                              <p>{amount ?? 0} Tokens!</p>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex w-full md:flex-row md:justify-between mb-18">
                    <div className="flex w-full items-center gap-2 text-white px-3">
                      <label>Show rows:</label>
                      <select
                        name="page_number"
                        className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 text-white outline-none"
                        onChange={(e) => {
                          setCurrentPage(1);
                          setRows(e.target.value ? Number(e.target.value) : 10);
                        }}
                      >
                        {numbers.map((number) => (
                          <option
                            key={number}
                            className="text-black"
                            value={number}
                          >
                            {number}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-4 flex w-1/3 items-center justify-between">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="cursor-pointer rounded px-4 py-2 text-white hover:bg-gray-800"
                      >
                        &lt;
                      </button>
                      <div className="flex gap-2">
                        <button
                          className={`rounded px-4 py-2 text-green-500`}
                          disabled={true}
                        >
                          {currentPage}
                        </button>
                      </div>
                      <button
                        onClick={handleNextPage}
                        className="cursor-pointer rounded px-4 py-2 text-white hover:bg-gray-800"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
            <div className="fixed bottom-0 w-full bg-black">
            <div className="flex w-full gap-1">
              <Link href="/wheel-spinner" className="bg-gray-800 text-white text-center flex-1 rounded-none m-2 py-5">
                Spin The Wheel
              
              </Link>
              
              <Link href="/scratch-card" className="bg-gray-800 text-white text-center flex-1 rounded-none m-2 py-5">
                Scratch the Card
              </Link>
            </div>
            <Dialog
                      onOpenChange={(e) =>
                        e === false ? handleSearch("") : null
                      }
                    >
                      <DialogTrigger asChild>
                      <Button className="bg-[#38F68F] rounded-full w-16 h-16 absolute -top-5 left-[50%] translate-x-[-50%]">
              <Image
                width={18}
                height={18}
                src="/icons/exchange-icon.svg"
                alt="exchange"
              />
            </Button>
                      </DialogTrigger>
                      <DialogContent className="h-[90vh] w-screen border-0 bg-[#262626ED] p-10 text-white md:w-screen md:max-w-fit md:p-16">
                        <DialogHeader>
                          <DialogTitle className="flex justify-between text-[30px] text-white md:text-[30px]">
                            <p className="">Transfer Tokens</p>
                            <ScanDialog handleSearch={handleSearch} />
                          </DialogTitle>
                          <div className="relative w-full">
                            <input
                              type="number"
                              placeholder="Recent"
                              onChange={(e) => handleSearch(e.target.value)}
                              className="w-full border-b-[1px] border-[#38F68F] bg-[#232323] px-4 py-1 pr-12 text-white outline-none"
                            />
                            <button className="rounded-[0 12px 12px 0] absolute right-0 top-0 h-full px-4 text-black">
                              <Image
                                alt=""
                                height={18}
                                width={18}
                                src="/icons/search-icon.svg"
                              />
                            </button>
                          </div>
                          <DialogDescription className="flex w-full flex-col justify-center px-4 md:w-[100vh] md:flex-row">
                            <div className="flex w-full flex-col">
                              {/* {userIds.map((userId, index) => (
                                <div
                                  key={index}
                                  className="flex w-full flex-row items-center justify-between gap-4"
                                >
                                  <span className="mt-4 flex w-full items-center gap-2 rounded-[12px] py-3 text-start text-white">
                                    <p className="h-[2rem] w-[2rem] rounded-full bg-white text-[12px] md:text-[18px]"></p>
                                    {userName(userId)}
                                  </span>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <button
                                        className="mt-4 w-full max-w-[250px] rounded-[10px] bg-[#2DC574] py-3 text-center text-[18px] text-black md:w-[250px] md:text-[20px]"
                                        onClick={() => handleSelectUser(userId)}
                                      >
                                        Transfer now
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent className="h-[90vh] w-full border-0 bg-[#262626ED] text-white md:w-screen md:max-w-fit">
                                      <DialogHeader>
                                        <DialogDescription className="flex max-h-[80vh] w-full flex-col justify-center overflow-y-auto px-4 py-40 md:max-h-full md:w-[100vh] md:py-0">
                                          <div className="mt-10 flex flex-row items-center justify-center gap-4 md:mt-20">
                                            <p className="text-[12px] uppercase text-white md:text-[20px]">
                                              Enter Amount :
                                            </p>
                                            <input
                                              minLength={3}
                                              placeholder="8.00"
                                              className="w-1/3 rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 text-end text-[20px] text-white outline-none md:w-1/2 md:text-[24px]"
                                              type="number"
                                              onChange={(
                                                e: ChangeEvent<HTMLInputElement>,
                                              ) => {
                                                setAmount(
                                                  Number(e.target.value),
                                                );
                                              }}
                                            />
                                          </div>
                                          <div className="mt-4 flex flex-row items-center justify-center gap-4 text-white">
                                            <p>
                                              Transfers below 100 are not
                                              allowed.
                                            </p>
                                          </div>

                                          <div className="mt-8 flex w-full flex-col md:flex-row">
                                            <div className="mb-4 flex w-full flex-col items-center justify-center text-white md:mb-0 md:w-1/3">
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>From</p>
                                                <p>
                                                  {userName(qrUserId) ?? ""}
                                                </p>
                                              </div>
                                              <div className="mb-4 mt-4 h-[4rem] w-[4rem] rounded-full bg-white md:mb-8 md:h-[6rem] md:w-[6rem]"></div>
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>Total Sent</p>
                                                <p>{amount ?? 0} Tokens</p>
                                              </div>
                                            </div>
                                            <div className="mb-4 flex w-full items-center justify-center text-center md:mb-0 md:w-1/3">
                                              <div className="text-[14px] md:text-[16px]">
                                                <p className="py-2 text-[14px] uppercase text-white md:text-[16px]">
                                                  Transaction Fees
                                                </p>
                                                <p className="text-[16px] font-semibold text-[#EE1818] md:text-[18px]">
                                                  {(amount ?? 0) -
                                                    getAmountAfterTxnCost(
                                                      amount ?? 0,
                                                    ) >
                                                  0
                                                    ? (amount ?? 0) -
                                                      getAmountAfterTxnCost(
                                                        amount ?? 0,
                                                      )
                                                    : 2}{" "}
                                                  TOKENS
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex w-full flex-col items-center justify-center text-white md:w-1/3">
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>To</p>
                                                <p>
                                                  {userName(selectedUser ?? "")}
                                                </p>
                                              </div>
                                              <div className="mb-4 mt-4 h-[4rem] w-[4rem] rounded-full bg-white md:mb-8 md:h-[6rem] md:w-[6rem]"></div>
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>Total Receivable</p>
                                                <p>
                                                  {getAmountAfterTxnCost(
                                                    amount ?? 0,
                                                  )}{" "}
                                                  Tokens
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-center justify-center">
                                            <input
                                              placeholder="Add Note"
                                              className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 text-center text-[20px] text-white outline-none md:text-[24px]"
                                              type="text"
                                              onChange={(e) => {
                                                setAddNote(e.target.value);
                                              }}
                                            />
                                            <button
                                              className="mt-8 w-full max-w-[300px] rounded-[10px] bg-[#38F68F] py-3 text-center text-[24px] font-[600] text-black md:mt-12 md:text-[28px]"
                                              onClick={() =>
                                                handleCoinTransfer(amount ?? 0)
                                              }
                                            >
                                              Transfer Now
                                            </button>
                                          </div>
                                        </DialogDescription>
                                      </DialogHeader>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              ))} */}
                              <PaginatedUserList  userIds={userIds} handleSelectUser={handleSelectUser} selectedUser={selectedUser || ""} amount={amount || 0} handleCoinTransfer={handleCoinTransfer} getAmountAfterTxnCost={getAmountAfterTxnCost} setAddNote={setAddNote} qrUserId={qrUserId} setAmount={setAmount} setSelectedUser={setSelectedUser} />
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
            </Dialog>
          </div>
        </div>
    </>
  }


  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} handleSearch={handleSearch} />
      <div
        className={`flex flex-col gap-8 p-10 pt-24 ${isSidebarOpen ? "blur-md" : ""}`}
      >
        <div className="flex flex-col gap-8 text-white md:flex-row">
          <div className="dashboard-card-bg flex h-[210px] w-full items-center justify-center rounded-xl border-[1px] border-[#2D2D2D] text-[50px] md:w-2/3">
            <CarouselAds />
          </div>
          <div className="dashboard-card-bg flex h-[210px] w-full flex-col items-start justify-start gap-4 rounded-xl border-[1px] border-[#2D2D2D] p-8 md:w-1/3">
            <div className="flex items-center justify-center gap-2 text-[20px]">
              <Image
                width={50}
                height={50}
                src={"/icons/profile-icon.svg"}
                alt={""}
                className="cursor-pointer transition-transform duration-200 hover:scale-105 md:mr-4"
                onClick={toggleSidebar}
              />
              <p className="uppercase">{userName(qrUserId)}</p>
              <Image
                width={16}
                className="cursor-pointer"
                height={16}
                src="/icons/copy-icon.svg"
                alt=""
                onClick={copyToClipboard}
              />
            </div>
            <div>
              <p className="mb-4 text-[14px] text-[#38F68F]">
                Complete your profile & earn tokens!
              </p>
              <div className="flex w-full items-center justify-center gap-4">
                <div className="h-1.5 w-full rounded-full bg-gray-200">
                  <div
                    style={{ width: `${profileProgress}%` }}
                    className="h-1.5 rounded-full bg-[#38F68F]"
                  ></div>
                </div>
                <p>{profileProgress}%</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8 text-white md:flex-row">
          <div className="flex h-full w-full flex-col items-center justify-center gap-8 rounded-xl md:w-2/3 md:flex-row">
            <div className="dashboard-card-bg flex h-[210px] w-full flex-col justify-between rounded-xl border-[1px] border-[#2D2D2D] p-8 md:w-2/5">
              <p className="text-[16px]">Available tokens</p>
              <p className="text-[40px] text-[#38F68F] md:text-[44px]">
                {user?.balance.toLocaleString() ?? "0"}
              </p>
              <Dialog>
  <DialogTrigger asChild>
    <button className="flex w-60 items-center justify-center gap-2 rounded-[10px] bg-[#38F68F] px-4 py-2 text-[12px] text-black md:w-40 md:text-[14px] lg:w-60">
      <Image
        width={18}
        height={18}
        src="/icons/black-generate-icon.svg"
        alt=""
        className="cursor-pointer"
      />
      <p>Redeem Your Code</p>
      <Image
        width={18}
        height={18}
        src="/icons/black-generate-icon.svg"
        alt=""
        className="cursor-pointer"
      />
    </button>
  </DialogTrigger>
  <DialogContent className="h-[60vh] border-0 bg-[#262626ED] text-white md:w-screen md:max-w-fit overflow-hidden rounded-tr-[20px] rounded-bl-[20px]">
    <DialogTitle className="z-40 mt-8 flex w-full items-center justify-center text-center text-[20px] text-white md:mt-16 md:text-[36px]">
      Get extra tokens by using your premium promocode
    </DialogTitle>
    <Image
      width={121}
      height={127}
      src="/backgrounds/redeem-bg.png"
      alt=""
      className="absolute z-10 cursor-pointer"
    />
    <DialogDescription className="flex h-full w-full items-start justify-center px-4 md:w-[100vh]">
      <div className="item-center relative flex w-full justify-center text-[12px] md:w-1/2 md:text-[16px]">
        <input
          onChange={(e) => {
            setRedeemCode(e.target.value);
          }}
          className="focus-none w-full rounded-[10px] bg-[#2EC173] bg-opacity-[0.3] p-2 text-[#D8D8D8] outline-none md:p-3"
          placeholder="Enter Promo Code"
        />
        <button
          onClick={handleRedeemCode}
          className="absolute right-0 -ml-4 rounded-[10px] bg-[#38F68F] px-6 py-2 font-semibold text-black md:py-3"
        >
          Apply Now
        </button>
      </div>
    </DialogDescription>
    <Image
      width={150}
      height={200}
      src="/backgrounds/redeem-bg2.png"
      alt=""
      className="absolute bottom-0 right-0 z-10 cursor-pointer"
    />
  </DialogContent>
</Dialog>

            </div>
            <div className="dashboard-card-bg flex h-[210px] w-full flex-col rounded-xl border-[1px] border-[#2D2D2D] p-8 md:w-3/5">
              <div className="flex justify-between">
                <p className="mb-4">Mining History</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="mb-4 text-[#38F68F]">See all</button>
                  </DialogTrigger>
                  <DialogContent className="h-[90vh] border-0 bg-[#262626ED] text-white md:w-screen md:max-w-fit md:p-16">
                    <DialogHeader>
                      <DialogTitle className="mb-12 flex justify-between text-[16px] text-white md:text-[24px]">
                        Mining History
                      </DialogTitle>
                      <DialogDescription className="flex w-full flex-col justify-center px-4 md:w-[100vh]">
                        <div className="flex w-full flex-row items-center justify-center border-b-[1px] border-[#38F68F]">
                          <div className="flex w-1/2 flex-col items-center justify-center">
                            <p className="mb-4 text-[14px] font-bold text-[#7E7E8B] md:text-[16px]">
                              Tokens Mined
                            </p>
                          </div>
                          {/* <div className="flex w-1/2 flex-col items-center justify-center">
                            <p className="mb-4 text-[14px] font-bold text-[#7E7E8B] md:text-[16px]">
                              Task
                            </p>
                          </div> */}
                          <div className="flex w-1/2 flex-col items-center justify-center">
                            <p className="mb-4 text-[14px] font-bold text-[#7E7E8B] md:text-[16px]">
                              Date & Time
                            </p>
                          </div>
                        </div>
                        <div className="max-h-[28rem] overflow-auto">
                          {allTxn?.map((transaction, index) => (
                            <div
                              key={index}
                              className="flex w-full flex-row items-center justify-center gap-4"
                            >
                              <div className="tems-center w-1/2 justify-center">
                                <p className="mt-4 w-full rounded-[12px] py-3 text-center text-[12px] text-white md:text-[16px]">
                                  {transaction.amount}
                                </p>
                              </div>
                              {/* <div className="tems-center w-1/2 justify-center">
                                <p className="mt-4 w-full rounded-[12px] py-3 text-center text-[12px] text-white md:text-[16px]">
                                {transaction.task}
                                </p>
                              </div> */}
                              <div className="w-1/2 items-center justify-center">
                                <p className="mt-4 w-full rounded-[12px] py-3 text-center text-[12px] text-white md:text-[16px]">
                                  {/* {transaction.time} */}
                                  {transaction.timestamp?.date}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
              <Card style={{ backgroundColor: "transparent", border: "none" }}>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    style={{ height: "100px", width: "100%" }}
                  >
                    <LineChart data={chartData} style={{ height: "100%" }}>
                      <ChartTooltip
                        cursor={false}
                        content={<TokenChartTooltipContent />}
                      />
                      <Line
                        dataKey="token"
                        type="linear"
                        stroke="var(--color-token)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="dashboard-card-bg flex h-[210px] w-full flex-col items-center rounded-xl border-[1px] border-[#2D2D2D] p-8 md:w-1/3">
            {/* <p>Your QR Code</p>
            {qrUserId && (
              <Image
                src={`https://qrcode.tec-it.com/API/QRCode?data=${qrUserId}&color=000000&istransparent=false&size=small&quietzone=1&dpi=300`}
                alt="qrcode"
                width={153}
                height={153}
              />
            )} */}
            <TokensCount burnt={remainingToken?.burnt ?? 0} remainingToken={remainingToken?.remainingToken ?? 0} />
          </div>
        </div>
        <div className="flex flex-col gap-8 text-white md:flex-row mt-12">
          <div className="flex max-h-[500px] w-full flex-col items-center justify-center md:w-2/3">
            <div className="flex w-full flex-row justify-between gap-12 pb-6">
              <p>Recent Transfers</p>
              {/* <span className="flex gap-2">
                <Image
                  width={20}
                  height={20}
                  src="/icons/filter-icon.svg"
                  alt=""
                />
                <p className="text-[#38F68F]">See all transfers</p>
              </span> */}
            </div>
            <div className="-m-1.5 w-full">
              <div className="inline-block min-w-full p-1.5 align-middle">
                <div className="overflow-hidden">
                  <div className="max-w-[300px] overflow-x-auto md:max-w-full">
                    <table className="min-w-full divide-y divide-[#38F68F] text-[#A7B0AF]">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-[16px] font-medium uppercase text-[#A7B0AF]"
                          >
                            Sender ID
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-[16px] font-medium uppercase text-[#A7B0AF]"
                          >
                            Receiver ID
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-[16px] font-medium uppercase text-[#A7B0AF]"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-end text-[16px] font-medium uppercase text-[#A7B0AF]"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-end text-[16px] font-medium uppercase text-[#A7B0AF]"
                          >
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {txn?.pages[currentPage - 1]?.transactions?.map(
                          (transaction, index) => (
                            <tr key={index}>
                              <td className={`whitespace-nowrap px-6 py-4 text-[16px] font-medium  ${userName(transaction.from).toLocaleLowerCase() === 'tokenwale'? 'text-[#38F68F]' : 'text-white'}`}>
                                {userName(transaction.from)}
                              </td>
                              <td className={`whitespace-nowrap px-6 py-4 text-[16px] font-medium ${userName(transaction.to).toLocaleLowerCase() === 'burnt'? 'text-red-500' : 'text-white'}`}>
                                {userName(transaction.to)}
                              </td>
                              <td className={`whitespace-nowrap px-6 py-4 text-[16px] ${userName(transaction.from).toLocaleLowerCase() === 'tokenwale'? 'text-[#38F68F]' : userName(transaction.to).toLocaleLowerCase() === 'burnt'? 'text-red-500' : 'text-white'} `}>
                                {transaction.amount}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-end text-[16px] text-white">
                                {
                                  formatFirestoreTimestamp(
                                    transaction.timestamp,
                                  )?.date
                                }
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-end text-[16px] text-white">
                                {
                                  formatFirestoreTimestamp(
                                    transaction.timestamp,
                                  )?.time
                                }
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8 flex w-full justify-end px-4 py-4 text-[16px]">
                    <Dialog
                      onOpenChange={(e) =>
                        e === false ? handleSearch("") : null
                      }
                    >
                      <DialogTrigger asChild>
                        <button className="rounded-[10px] bg-[#38F68F] px-4 py-2 text-black">
                          Transfer now
                        </button>
                      </DialogTrigger>
                      <DialogContent className="h-[90vh] w-screen border-0 bg-[#262626ED] p-10 text-white md:w-screen md:max-w-fit md:p-16">
                        <DialogHeader>
                          <DialogTitle className="flex justify-between text-[30px] text-white md:text-[30px] mb-3">
                            <p>Transfer Tokens</p>
                            <ScanDialog handleSearch={handleSearch} />
                          </DialogTitle>
                          <div className="relative w-full">
                            <input
                              type="number"
                              placeholder="Recent"
                              onChange={(e) => handleSearch(e.target.value)}
                              className="w-full border-b-[1px] border-[#38F68F] bg-[#232323] px-4 py-1 pr-12  text-white outline-none"
                            />
                            <button className="rounded-[0 12px 12px 0] absolute right-0 top-0 h-full px-4 text-black">
                              <Image
                                alt=""
                                height={18}
                                width={18}
                                src="/icons/search-icon.svg"
                              />
                            </button>
                          </div>
                          <DialogDescription className="flex w-full flex-col justify-center px-4 md:w-[100vh] md:flex-row">
                            <div className="flex w-full flex-col">
                              {/* {userIds.map((userId, index) => (
                                <div
                                  key={index}
                                  className="flex w-full flex-row items-center justify-between gap-4"
                                >
                                  <span className="mt-4 flex w-full items-center gap-2 rounded-[12px] py-3 text-start text-white">
                                    <p className="h-[2rem] w-[2rem] rounded-full bg-white text-[12px] md:text-[18px]"></p>
                                    {userName(userId)}
                                  </span>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <button
                                        className="mt-4 w-full max-w-[250px] rounded-[10px] bg-[#2DC574] py-3 text-center text-[18px] text-black md:w-[250px] md:text-[20px]"
                                        onClick={() => handleSelectUser(userId)}
                                      >
                                        Transfer now
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent className="h-[90vh] w-full border-0 bg-[#262626ED] text-white md:w-screen md:max-w-fit">
                                      <DialogHeader>
                                        <DialogDescription className="flex max-h-[80vh] w-full flex-col justify-center overflow-y-auto px-4 py-40 md:max-h-full md:w-[100vh] md:py-0">
                                          <div className="mt-10 flex flex-row items-center justify-center gap-4 md:mt-20">
                                            <p className="text-[12px] uppercase text-white md:text-[20px]">
                                              Enter Amount :
                                            </p>
                                            <input
                                              minLength={3}
                                              placeholder="8.00"
                                              className="w-1/3 rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 text-end text-[20px] text-white outline-none md:w-1/2 md:text-[24px]"
                                              type="number"
                                              onChange={(
                                                e: ChangeEvent<HTMLInputElement>,
                                              ) => {
                                                setAmount(
                                                  Number(e.target.value),
                                                );
                                              }}
                                            />
                                          </div>
                                          <div className="mt-4 flex flex-row items-center justify-center gap-4 text-white">
                                            <p>
                                              Transfers below 100 are not
                                              allowed.
                                            </p>
                                          </div>

                                          <div className="mt-8 flex w-full flex-col md:flex-row">
                                            <div className="mb-4 flex w-full flex-col items-center justify-center text-white md:mb-0 md:w-1/3">
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>From</p>
                                                <p>
                                                  {userName(qrUserId) ?? ""}
                                                </p>
                                              </div>
                                              <div className="mb-4 mt-4 h-[4rem] w-[4rem] rounded-full bg-white md:mb-8 md:h-[6rem] md:w-[6rem]"></div>
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>Total Sent</p>
                                                <p>{amount ?? 0} Tokens</p>
                                              </div>
                                            </div>
                                            <div className="mb-4 flex w-full items-center justify-center text-center md:mb-0 md:w-1/3">
                                              <div className="text-[14px] md:text-[16px]">
                                                <p className="py-2 text-[14px] uppercase text-white md:text-[16px]">
                                                  Transaction Fees
                                                </p>
                                                <p className="text-[16px] font-semibold text-[#EE1818] md:text-[18px]">
                                                  {(amount ?? 0) -
                                                    getAmountAfterTxnCost(
                                                      amount ?? 0,
                                                    ) >
                                                  0
                                                    ? (amount ?? 0) -
                                                      getAmountAfterTxnCost(
                                                        amount ?? 0,
                                                      )
                                                    : 2}{" "}
                                                  TOKENS
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex w-full flex-col items-center justify-center text-white md:w-1/3">
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>To</p>
                                                <p>
                                                  {userName(selectedUser ?? "")}
                                                </p>
                                              </div>
                                              <div className="mb-4 mt-4 h-[4rem] w-[4rem] rounded-full bg-white md:mb-8 md:h-[6rem] md:w-[6rem]"></div>
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>Total Receivable</p>
                                                <p>
                                                  {getAmountAfterTxnCost(
                                                    amount ?? 0,
                                                  )}{" "}
                                                  Tokens
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-center justify-center">
                                            <input
                                              placeholder="Add Note"
                                              className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 text-center text-[20px] text-white outline-none md:text-[24px]"
                                              type="text"
                                              onChange={(e) => {
                                                setAddNote(e.target.value);
                                              }}
                                            />
                                            <button
                                              className="mt-8 w-full max-w-[300px] rounded-[10px] bg-[#38F68F] py-3 text-center text-[24px] font-[600] text-black md:mt-12 md:text-[28px]"
                                              onClick={() =>
                                                handleCoinTransfer(amount ?? 0)
                                              }
                                            >
                                              Transfer Now
                                            </button>
                                          </div>
                                        </DialogDescription>
                                      </DialogHeader>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              ))} */}
                              <PaginatedUserList   userIds={userIds} handleSelectUser={handleSelectUser} handleCoinTransfer={handleCoinTransfer} getAmountAfterTxnCost={getAmountAfterTxnCost} setAddNote={setAddNote} qrUserId={qrUserId} selectedUser={selectedUser || ""} amount={amount || 0 } setAmount={setAmount} setSelectedUser={setSelectedUser} />
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={wonDialogOpen}
                      onOpenChange={setWonDialogOpen}
                    >
                      <DialogContent className="h-[90vh] w-screen border-0 bg-[#262626ED] text-white md:w-screen md:max-w-fit">
                        <DialogHeader>
                          <DialogDescription className="flex h-full w-full flex-col items-center justify-center px-4 md:w-[100vh]">
                            <div className="flex w-full items-center justify-center text-[40px] font-semibold text-white">
                              <Image
                                width={120}
                                height={120}
                                src="/icons/correct-icon.png"
                                className=""
                                alt="img"
                              />
                            </div>
                            <div className="mt-12 flex w-full items-center justify-center text-[40px] font-bold text-[#38F68F] md:mt-20">
                              <p>{amount ?? 0} Tokens!</p>
                              <p className="text-2xl">Transfered to {userName(selectedUser ?? "")} successfully.</p>
                              <p className="text-[16px]">{new Date().toLocaleString()}</p>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={wonDialogOpen}
                      onOpenChange={setWonDialogOpen}
                    >
                      <DialogContent className="h-[90vh] w-screen border-0 bg-[#262626ED] text-white md:w-screen md:max-w-fit">
                        <DialogHeader>
                          <DialogDescription className="flex h-full w-full flex-col items-center justify-center px-4 md:w-[100vh]">
                            <div className="flex w-full items-center justify-center text-[40px] font-semibold text-white">
                              <Image
                                width={120}
                                height={120}
                                src="/icons/correct-icon.png"
                                className=""
                                alt="img"
                              />
                            </div>
                            <div className="mt-12 flex flex-col w-full items-center justify-center text-[40px] font-bold text-[#38F68F] md:mt-20">
                              <p>{amount ?? 0} Tokens!</p>
                              <p className="text-2xl font-normal mt-4 text-center text-white">Transfered to {userName(selectedUser ?? "")}</p>
                              <p className="text-[16px] mt-3 text-center text-white">{new Date().toLocaleString()}</p>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex w-full flex-col md:flex-row md:justify-between">
                    <div className="flex w-full items-center gap-2 text-white">
                      <label>Show rows:</label>
                      <select
                        name="page_number"
                        className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 text-white outline-none"
                        onChange={(e) => {
                          setCurrentPage(1);
                          setRows(e.target.value ? Number(e.target.value) : 10);
                        }}
                      >
                        {numbers.map((number) => (
                          <option
                            key={number}
                            className="text-black"
                            value={number}
                          >
                            {number}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-4 flex w-1/3 items-center justify-between">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="cursor-pointer rounded px-4 py-2 text-white hover:bg-gray-800"
                      >
                        &lt;
                      </button>
                      <div className="flex gap-2">
                        <button
                          className={`rounded px-4 py-2 text-green-500`}
                          disabled={true}
                        >
                          {currentPage}
                        </button>
                      </div>
                      <button
                        onClick={handleNextPage}
                        className="cursor-pointer rounded px-4 py-2 text-white hover:bg-gray-800"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            {...handlers}
            className="dashboard-card-bg relative flex h-[500px] w-full flex-col items-center justify-center rounded-xl border-[1px] border-[#2D2D2D] md:w-1/3"
          >
            {activeSlide === 0 && (
              <Image
                width={240}
                height={240}
                src="/backgrounds/dashboard-spinner-card-bg.png"
                className="absolute left-0 top-0"
                alt="img"
              />
            )}
            {activeSlide === 1 && (
              <Image
                width={240}
                height={240}
                src="/backgrounds/scratch-card.png"
                className="mt-8 w-6/12 md:w-1/2"
                alt="card"
              />
            )}
            <div className="relative z-10 flex h-full flex-col items-center justify-end gap-4 pb-10">
              {activeSlide === 0 && (
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-[18px] text-[#38F68F]">EARN TOKENS</p>
                  <button
                    className="rounded-[10px] bg-[#38F68F] px-4 py-2 text-black"
                    onClick={handleSpinWheel}
                  >
                    Spin the Wheel
                  </button>
                </div>
              )}
              {activeSlide === 1 && (
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-[18px] text-[#38F68F]">WIN MORE TOKENS</p>
                  <button
                    className="rounded-[10px] bg-[#38F68F] px-4 py-2 text-black"
                    onClick={handleScratchCard}
                  >
                    Scratch & Win
                  </button>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <span
                  className={`h-3 w-3 cursor-pointer rounded-full ${
                    activeSlide === 0 ? "bg-[#38F68F]" : "bg-gray-400"
                  }`}
                  onClick={() => handleSlideChange(0)}
                ></span>
                <span
                  className={`h-3 w-3 cursor-pointer rounded-full ${
                    activeSlide === 1 ? "bg-[#38F68F]" : "bg-gray-400"
                  }`}
                  onClick={() => handleSlideChange(1)}
                ></span>
              </div>
            </div>
          </div>
        </div>
        <Dialog open={codeRedeemPopup} onOpenChange={setCodeRedeemPopup}>
          <DialogContent className="h-[60vh] border-0 bg-[#262626ED] md:w-screen md:max-w-fit">
            <DialogTitle className="z-40 mt-8 flex w-full items-center justify-center text-center text-[20px] text-white md:mt-16 md:text-[36px]">
              Got {codeRedeemValue} extra tokens by using your premium promocode
            </DialogTitle>
            <Image
              width={121}
              height={127}
              src="/backgrounds/redeem-bg.png"
              alt=""
              className="absolute z-10 cursor-pointer"
            />
            <Image
              width={150}
              height={200}
              src="/backgrounds/redeem-bg2.png"
              alt=""
              className="absolute bottom-0 right-0 z-10 cursor-pointer"
            />
          </DialogContent>
        </Dialog>
      </div>
      <ProfileSidebar
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />
    </>
  );
}