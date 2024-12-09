"use client";
import React, { useState } from "react";
import useLocalStorage from "@/hooks/storage/localStorage";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export const LoginComponent = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useLocalStorage<string>("userId", "");
  const router = useRouter();
  const [isPending, setIspending] = useState<boolean>(false);

  React.useEffect(() => {
    if (router.isReady) {
      if (userId === "") void router.push("/auth/new-wallet");
    }
  }, [router, userId]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIspending(true);
    try {
      if (password) {
        const result = await signIn("credentials", {
          userId,
          password,
          redirect: false,
          callbackUrl: "/dashboard",
        });
        
        if (result?.error) {
          alert("Password is incorrect. Please try again.");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
      console.error(error);
    } finally {
      setIspending(false);
    }
  };

  return (
    <div className="green-gradient-bg flex h-[80vh] w-full flex-col items-center justify-center px-4 md:px-0">
      <div className="w-full rounded-[20px] border-2 border-green-500 md:w-auto md:rounded-[59px]">
        <div className="create-wallet-card-gradient flex h-full min-h-[500px] w-full flex-col items-center justify-center rounded-[20px] px-4 md:w-[767px] md:rounded-[59px] md:px-0 md:py-8">
          <span>
            <p className="mt-4 text-center text-[24px] text-[#38F68F] md:text-[40px]">
              Join Us to earn{" "}
            </p>
            <p className="text-center text-[24px] text-[#38F68F] md:text-[40px]">
              rewards through tokens
            </p>
          </span>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center justify-center gap-4 px-4 pb-4 pt-10 md:px-0"
          >
            <div className="relative w-full md:w-96">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-[10px] bg-[#131c23] px-4 py-2 text-white"
                placeholder="Enter a Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 px-3 py-2 text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-2 flex w-full items-center justify-start md:w-1/2">
            <Link href="/auth/seed-phrase-login">
              <label
                htmlFor="default-checkbox"
                className="cursor-pointer text-sm font-medium text-[#38F68F]"
              >
                Forgot Password?
              </label>
            </Link>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#38F68F] py-3 font-bold md:w-[50%]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Please wait
                </>
              ) : (
                <>Login</>
              )}
            </button>
            <span className="mt-4 cursor-pointer text-center text-sm font-medium text-white">
              Don&apos;t have an account ?{" "}
              <span
                className="cursor-pointer text-[#38F68F]"
                onClick={() => router.push("/auth/create-wallet")}
              >
                Create a new wallet
              </span>{" "}
            </span>
          </form>
          <span className="mt-4 text-center text-sm font-medium text-white">
            By proceeding, you agree to these
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <button className="border-0 px-0 py-0 text-[13px] text-[#625DF5] hover:bg-none">
                Terms and Privacy Policy.
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-black terms-condition-popup text-white">
              <DialogHeader>
                <DialogTitle className="pb-10 text-[#38F68F]">
                  Terms and Privacy Policy
                </DialogTitle>
                <DialogDescription className="text-white">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Expedita doloremque in delectus hic deserunt nesciunt numquam
                  debitis doloribus, saepe ea vitae nemo molestias voluptas
                  earum et maxime fugit a! Inventore. Lorem ipsum, dolor sit
                  amet consectetur adipisicing elit. Assumenda provident atque
                  iusto nobis aliquam vel dignissimos repellat, quia quasi
                  facilis praesentium necessitatibus culpa aspernatur maiores
                  quae inventore vitae eligendi ipsa.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
