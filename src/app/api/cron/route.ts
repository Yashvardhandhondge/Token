import { db } from "@/server/db";
import { T2U, U2B } from "@/utils/random";
import { Timestamp } from "firebase-admin/firestore";
export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function GET(request: Request) {
  const now = new Date("");
  const startOfDay = Timestamp.fromDate(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const endOfDay = Timestamp.fromDate(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
  );

  const txnBurnt = await db
    .collection("txn")
    .where("timestamp", ">=", startOfDay)
    .where("timestamp", "<", endOfDay)
    .where("type", "==", U2B)
    .get();
  const txnBurntSnap = txnBurnt.docs
    .map((e) => e.data())
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .reduce((acc, e) => (acc += e.amount), 0);
  const txnMined = await db
    .collection("txn")
    .where("timestamp", ">=", startOfDay)
    .where("timestamp", "<", endOfDay)
    .where("type", "==", T2U)
    .get();
  const txnMinedSnap = txnMined.docs
    .map((e) => e.data())
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .reduce((acc, e) => (acc += e.amount), 0);
  const { TOTAL_REMAINING_TOKEN } = (
    await db.collection("global").doc("global").get()
  ).data() as { TOTAL_REMAINING_TOKEN: number };
  await db.collection("log").add({
    burnt: txnBurntSnap,
    mined: txnMinedSnap,
    available: TOTAL_REMAINING_TOKEN,
    timestamp: startOfDay,
  });
  return new Response(`{ message: 'Hello from Next.js!' }`);
}
