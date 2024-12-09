"use client";
import React, { useState } from "react";
import { api } from "@/trpc/react";
import useLocalStorage from "@/hooks/storage/localStorage";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const CreatePassword = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId] = useLocalStorage<string>("userId", "");

  const router = useRouter();

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const { mutate, isPending } = api.user.updatePasswordFromUserId.useMutation({
    onSuccess: () => {
      void router.push("/auth/login");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === confirmPassword) {
      mutate({ userId, password });
    } else {
      alert("Passwords do not match");
    }
  };

  return (
    <div className="green-gradient-bg flex h-[80vh] w-full flex-row items-center justify-center px-4 md:px-0">
      <div className="w-full rounded-[20px] border-2 border-green-500 md:w-auto md:rounded-[59px]">
        <div className="create-wallet-card-gradient flex h-1/2 min-h-[500px] w-full flex-col items-center justify-center rounded-[20px] py-8 md:w-[767px] md:rounded-[59px]">
          <span className="text-center">
            <p className="mt-4 text-[26px] text-[#38F68F] md:text-[40px]">
              Create a Password
            </p>
            <p className="text-[10px] text-[#A0A0A0] md:text-[16px]">
              You will use this to unlock your wallet
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
            <div className="relative w-full md:w-96">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full rounded-[10px] bg-[#131c23] px-4 py-2 text-white"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 px-3 py-2 text-white"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mb-4 flex w-full items-center justify-start pb-8 md:w-1/2">
              <input
                onChange={handleCheckboxChange}
                id="default-checkbox"
                type="checkbox"
                required={true}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 bg-[#131c23] text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600"
              />
              <label
                htmlFor="default-checkbox"
                className="ms-2 text-sm gap-1 font-medium text-[#aab1be] flex"
              >
                I agree to the
                <Dialog>
            <DialogTrigger asChild>
              <button className="border-0 px-0 py-0 text-[13px] text-[#625DF5] hover:bg-none">
              Terms and Privacy Policy
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
              </label>
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
                <>Next</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
