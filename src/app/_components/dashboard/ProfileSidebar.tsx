import { useFormik } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import useLocalStorage from "@/hooks/storage/localStorage";
import { userName } from "@/utils/random";
import { api } from "@/trpc/react";
import useDebounceValue from "@/hooks/debounce/useDebounceValue";

interface ProfileSidebarProps {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
}

interface Profile {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
  gender: "" | "M" | "F" | "O";
  phoneOtp?: string;
  emailOtp?: string;
}

export const ProfileSidebar = ({
  isSidebarOpen,
  closeSidebar,
}: ProfileSidebarProps) => {
  const [isPhoneOtpVisible, setIsPhoneOtpVisible] = useState(false);
  const [isEmailOtpVisible, setIsEmailOtpVisible] = useState(false);
  const [isPhoneOtpVerified, setIsPhoneOtpVerified] = useState(false);
  const [isEmailOtpVerified, setIsEmailOtpVerified] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useLocalStorage<string>("userId", "");
  const [tempUserId, setTempUserId] = useState("");
  const { status } = useSession();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [adress, setAdress] = useState<string | undefined>(undefined);
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [gender, setGender] = useState<string | undefined>(undefined);
  const debouceFullName = useDebounceValue(fullName, 1000);
  const debouceEmail = useDebounceValue(email, 1000);
  const debouceAderess = useDebounceValue(adress, 1000);
  const deboucePhone = useDebounceValue(phone, 1000);
  useEffect(() => {
    setTempUserId(userId);
  }, []);
  const utils = api.useUtils();
  const { mutate: updateUserDetails } = api.user.editUserDetails.useMutation({
    onSuccess: async (data) => {
      console.log(data);
      await utils.user.getUserDetailsByUserId.invalidate();
      await utils.txn.getLatestTxnByUserIdInf.invalidate();
    },
  });

  const { data: userDetails } = api.user.getUserDetailsByUserId.useQuery();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [otpEmail, setOtpEmail] = useState(Array(6).fill(""));

const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
  const value = e.target.value.slice(0, 1); // Restrict input to a single character
  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);

  // Move to the next input automatically
  if (value && index < 5) {
    document.getElementById(`otp-${index + 1}`)?.focus();
  }
};

const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    // Move to the previous input on backspace if the current input is empty
    document.getElementById(`otp-${index - 1}`)?.focus();
  }
};
const handleOtpChangeEmail = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
  const value = e.target.value.slice(0, 1); // Restrict input to a single character
  const newOtp = [...otpEmail];
  newOtp[index] = value;
  setOtpEmail(newOtp);

  // Move to the next input automatically
  if (value && index < 5) {
    document.getElementById(`otp-email-${index + 1}`)?.focus();
  }
};

const handleOtpKeyDownEmail = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
  if (e.key === "Backspace" && !otpEmail[index] && index > 0) {
    // Move to the previous input on backspace if the current input is empty
    document.getElementById(`otp-email-${index - 1}`)?.focus();
  }
};

  const handleSubmit = (values: Profile) => {
    try {
      if (
        (values.phoneNumber && isPhoneOtpVerified) ||
        (values.emailAddress && isEmailOtpVerified) ||
        (!values.phoneNumber && !values.emailAddress)
      ) {
        console.log("Profile updated successfully!");
      } else {
        console.log("OTP verification failed. Please verify OTPs to save.");
        alert(
          "Please verify OTPs to save the phone number and/or email address.",
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const formik = useFormik<Profile>({
    initialValues: {
      fullName: "",
      phoneNumber: "",
      emailAddress: "",
      address: "",
      gender: "",
      phoneOtp: "",
      emailOtp: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().notRequired(),
      phoneNumber: Yup.string().notRequired(),
      emailAddress: Yup.string().email("Invalid email address").notRequired(),
      address: Yup.string().notRequired(),
      gender: Yup.string().oneOf(["M", "F", "O"]).notRequired(),
    }),
    onSubmit: handleSubmit,
  });

  const { mutate: sendPhoneOtp } = api.otp.sendOtpMobile.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
  });

  const handleGeneratePhoneOtp = () => {
    try {
      sendPhoneOtp({ phone: formik.values.phoneNumber });
      setIsPhoneOtpVisible(true);
    } catch (error) {
      console.error("Error sending email OTP:", error);
    }
  };

  const { mutate: verifyEmailOtp } = api.otp.verifyOtp.useMutation({
    onSuccess: (data) => {
      console.log(data);
      if (data.success == true) {
        updateUserDetails({
          key: "email",
          value: formik.values.emailAddress,
          otp: otpEmail.join(""),
        });
      } else {
        alert("wrong otp");
      }
      setIsEmailOtpVerified(true);
    },
  });
  const { mutate: verifyMobileOtp } = api.otp.verifyOtp.useMutation({
    onSuccess: (data) => {
      console.log(data);
      if (data.success == true) {
        updateUserDetails({
          key: "phone",
          value: Number(formik.values.phoneNumber),
          otp: otp.join(""),
        });
      } else {
        alert("wrong otp");
      }
      setIsPhoneOtpVerified(true);
    },
  });

  useEffect(() => {
    if (userDetails) {
      setFullName(userDetails.name);
      setGender(userDetails.gender);
      setAdress(userDetails.address);
      setEmail(userDetails.email);
      setPhone(userDetails.phone);
      formik.setValues({
        fullName: userDetails.name || "",
        phoneNumber: userDetails.phone || "",
        emailAddress: userDetails.email || "",
        address: userDetails.address || "",
        gender: userDetails.gender || "",
        phoneOtp: "",
        emailOtp: "",
      });
    }
    if (userDetails?.email) {
      setIsEmailOtpVerified(true);
    }
    if (userDetails?.phone) {
      setIsPhoneOtpVerified(true);
    }
  }, [userDetails]);

  useEffect(() => {
    if (debouceFullName === undefined) return;
    (async () => {
      updateUserDetails({ key: "name", value: debouceFullName });
    })();
  }, [debouceFullName, updateUserDetails]);
  useEffect(() => {
    if (debouceAderess === undefined) return;
    (async () => {
      updateUserDetails({ key: "address", value: debouceAderess });
    })();
  }, [debouceAderess, updateUserDetails]);

  const verfyOtpMobile = (otp: string) => {
    try {
      verifyMobileOtp({ type: "PHONE", otp: otp });
    } catch (error) {
      console.error("Error sending email OTP:", error);
    }
  };

  const verfyOtpEmail = (otp: string) => {
    try {
      verifyEmailOtp({ type: "EMAIL", otp: otp });
    } catch (error) {
      console.error("Error sending email OTP:", error);
    }
  };

  const { mutate: sendEmailOtp } = api.otp.sendOtpEmail.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
  });

  const handleGenerateEmailOtp = async () => {
    try {
      sendEmailOtp({ email: formik.values.emailAddress });
      setIsEmailOtpVisible(true);
    } catch (error) {
      console.error("Error sending email OTP:", error);
      alert("Failed to send email OTP. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      setUserId("");
      await router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setFullName(event.target.value);
    // updateUserDetails({ key: "name", value: event.target.value });
  };

  const handleAddressChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    console.log(event.target.value);
    setAdress(event.target.value);
    // updateUserDetails({ key: "address", value: event.target.value });
  };

  const handleGenderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(event.target.value);
    setGender(event.target.value);
    updateUserDetails({ key: "gender", value: event.target.value });
  };

  return (
    <div
      className={`dashboard-card-bg fixed right-0 top-0 h-full border-[0.5px] border-[#676767] pt-[44px] transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      } w-full bg-opacity-20 shadow-lg backdrop-blur-lg md:w-[60%] lg:w-[45%]`}
    >
      <div className="flex h-full flex-col overflow-y-auto p-2 md:p-8">
        <div className="flex w-full justify-end pt-4 md:pt-4">
          <button className="text-[24px] text-[#38F68F]" onClick={closeSidebar}>
            X
          </button>
        </div>
        <div className="flex gap-2 p-4 text-[20px] md:p-8">
          <div className="relative flex items-end justify-end rounded-full">
            <Image
              width={60}
              height={60}
              src={"/icons/profile-icon.svg"}
              alt={""}
              className="cursor-pointer transition-transform duration-200 hover:scale-105"
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              // onChange={handleImageChange}
              accept="image/*"
            />
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected"
                className="h-full w-full rounded-full object-cover"
                // onClick={handleImageClick}
              />
            ) : (
              <Image
                width={25}
                height={25}
                src="/icons/edit-icon.svg"
                className="absolute right-[0px] cursor-pointer"
                alt=""
                // onClick={handleImageClick}
              />
            )}
          </div>
          <div className="flex flex-col items-start justify-center">
            <p className="uppercase text-white">{userName(tempUserId)}</p>
            <p className="text-[14px] uppercase text-[#676767]">
              {formik.values.address.length > 20
                ? formik.values.address.slice(0, 20) + "..."
                : formik.values.address}
            </p>
          </div>
        </div>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col items-center justify-center gap-4 px-2 py-10 md:px-12"
        >
          <div className="flex w-full items-center justify-between gap-4 text-white">
            <label>FULL NAME:</label>
            <input
              type="text"
              name="fullName"
              value={fullName ?? ("" as string)}
              onChange={handleFullNameChange}
              onBlur={formik.handleBlur}
              className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 outline-none"
            />
          </div>
          <div className="flex w-full items-center justify-between gap-4 text-white">
            <label>PHONE NUMBER:</label>
            <input
              type="text"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 outline-none"
            />
          </div>
          {!isPhoneOtpVerified &&
            formik.values.phoneNumber &&
            !isPhoneOtpVisible && (
              <button
                type="button"
                className="rounded-[10px] bg-[#38F68F] px-4 py-2 text-black"
                onClick={handleGeneratePhoneOtp}
              >
                Generate OTP
              </button>
            )}
         {!isPhoneOtpVerified && isPhoneOtpVisible && (
  <>
    <div className="flex w-full flex-col items-center gap-4 text-white">
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            type="text"
            id={`otp-${index}`}
            maxLength={1}
            className="h-12 w-12 rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 text-center text-lg outline-none focus:ring-2 focus:ring-[#38F68F]"
            onChange={(e) => handleOtpChange(e, index)}
            onKeyDown={(e) => handleOtpKeyDown(e, index)}
          />
        ))}
      </div>
    </div>
    <button
      type="button"
      className="mt-4 rounded-[10px] bg-[#38F68F] px-4 py-2 text-black"
      onClick={() => verfyOtpMobile(otp.join(""))} // Combine the digits into a single OTP string
    >
      Submit Phone OTP
    </button>
  </>
)}

          <div className="flex w-full items-center justify-between gap-2 text-white">
            <label>EMAIL ADDRESS:</label>
            <input
              type="text"
              name="emailAddress"
              value={formik.values.emailAddress}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 outline-none"
            />
          </div>
          {!isEmailOtpVerified &&
            formik.values.emailAddress &&
            !isEmailOtpVisible && (
              <button
                type="button"
                className="rounded-[10px] bg-[#38F68F] px-4 py-2 text-black"
                onClick={handleGenerateEmailOtp}
              >
                Generate OTP
              </button>
            )}
          {!isEmailOtpVerified && isEmailOtpVisible && (
            // <>
            //   <div className="flex w-full items-center justify-between gap-4 text-white">
            //     <label>EMAIL OTP:</label>
            //     <input
            //       type="text"
            //       name="emailOtp"
            //       value={formik.values.emailOtp}
            //       onChange={formik.handleChange}
            //       onBlur={formik.handleBlur}
            //       className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 outline-none"
            //     />
            //   </div>
            //   <button
            //     type="button"
            //     className="rounded-[10px] bg-[#38F68F] px-4 py-2 text-black"
            //     onClick={() => verfyOtpEmail(formik.values.emailOtp ?? "1234")}
            //   >
            //     Submit Email OTP
            //   </button>
            // </>
            <>
            <div className="flex w-full flex-col items-center gap-4 text-white">
              
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    id={`otp-email-${index}`}
                    maxLength={1}
                    className="h-12 w-12 rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 text-center text-lg outline-none focus:ring-2 focus:ring-[#38F68F]"
                    onChange={(e) => handleOtpChangeEmail(e, index)}
                    onKeyDown={(e) => handleOtpKeyDownEmail(e, index)}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              className="mt-4 rounded-[10px] bg-[#38F68F] px-4 py-2 text-black"
                onClick={() => verfyOtpEmail(otpEmail.join(""))} // Combine the digits into a single OTP string
            >
              Submit Email OTP
            </button>
          </>
          )}
          <div className="flex w-full items-center justify-between gap-2 text-white">
            <label>ADDRESS:</label>
            <textarea
              name="address"
              value={adress ?? ("" as string)}
              // onChange={formik.handleChange}
              onChange={handleAddressChange}
              onBlur={formik.handleBlur}
              className="w-[56%] rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 outline-none"
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 text-white">
            <label>GENDER:</label>
            <select
              name="gender"
              value={gender ?? ("" as string)}
              onChange={handleGenderChange}
              onBlur={formik.handleBlur}
              className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 text-white outline-none"
            >
              <option className="text-black" value="">
                Select Gender
              </option>
              <option className="text-black" value="M">
                Male
              </option>
              <option className="text-black" value="F">
                Female
              </option>
              <option className="text-black" value="O">
                Other
              </option>
            </select>
          </div>
          <div className="mt-8 flex h-full w-full flex-col items-end justify-between text-[16px]">
            {/* <button
                  type="submit"
                  className="rounded-[10px] bg-[#38F68F] px-4 py-2 text-black"
                >
                  Save
                </button> */}
            <button
              onClick={() => handleLogout()}
              className="mt-12 rounded-[10px] border-[2px] border-[#FF5757] px-4 py-2 font-semibold text-[#FF5757]"
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};