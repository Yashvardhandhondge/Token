import { Timestamp } from "firebase/firestore";

export const generateRandomNumberString = (length = 8): string => {
  const digits = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    result += digits[randomIndex];
  }
  if (result === "00000000" || result === "99999999")
    return generateRandomNumberString();
  return result;
};

export function formatFirestoreTimestamp(
  timestampData: Timestamp | { _seconds: number; _nanoseconds: number },
) {
  let timestamp;
  if (timestampData instanceof Timestamp) {
    timestamp = timestampData;
  } else if (
    timestampData &&
    typeof timestampData._seconds === "number" &&
    typeof timestampData._nanoseconds === "number"
  ) {
    // Reconstruct the Timestamp if it's not recognized but has the correct structure
    timestamp = new Timestamp(
      timestampData._seconds,
      timestampData._nanoseconds,
    );
  } else {
    console.error("Input is not a valid Firestore Timestamp structure");
    return null;
  }

  const date = timestamp.toDate();

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  // Format time as H:MM AM/PM
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return {
    date: formattedDate,
    time: formattedTime,
  };
}
export const getAmountAfterTxnCost = (amount: number) => {
  if (amount <= 1000) return amount - 2;
  return amount - Math.ceil(amount * 0.002);
};

export const userName = (userId: string) => {
  if (userId === NULL_WALLET) return `BURNT`;
  if (userId === TOKENWALE_WALLET) return `TOKENWALE`;
  return `USER#${userId}`;
};
export const transactionName = (userId: string) => {
  return `#T${userId}`;
};

export const U2U = "USER_TO_USER";
export const T2U = "TOKENWALE_TO_USER";
export const U2B = "USER_TO_BURNT";
export const NULL_WALLET = "00000000";
export const TOKENWALE_WALLET = "99999999";
export const TOTAL__TOKEN = 100_000_000_000;

export const is24HourDiff = (firestoreTimestamp: Timestamp) => {
  const currentTimestamp = new Date().getTime();
  const firestoreTimestampMs = firestoreTimestamp.toMillis();

  // Calculate the difference in milliseconds
  const timeDiffMs = currentTimestamp - firestoreTimestampMs;

  // Check if the difference is 24 hours (in milliseconds)
  const is24HourDiff = timeDiffMs >= 24 * 60 * 60 * 1000;
  return is24HourDiff;
};

export const getRandomValueForSpinner = (min = 10, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
export const getRandomValueForScratch = (min = 10, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
