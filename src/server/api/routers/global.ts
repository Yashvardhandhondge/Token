import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Timestamp as AdminTimestamp } from "firebase-admin/firestore";
import { TRPCError } from "@trpc/server";
import { type Timestamp } from "firebase/firestore";
import {
  formatFirestoreTimestamp,
  generateRandomNumberString,
  getRandomValueForScratch,
  getRandomValueForSpinner,
  is24HourDiff,
  T2U,
  U2B,
} from "@/utils/random";
import { firestore } from "firebase-admin";

export const globalRouter = createTRPCRouter({
  getRemainingToken: publicProcedure.query(async ({ ctx }) => {
    const remainingTokenDocs = await ctx.db
      .collection("global")
      .doc("global")
      .get();
    const remainingToken = remainingTokenDocs.data()
      ?.TOTAL_REMAINING_TOKEN as number;
    const transactionsRef = ctx.db.collection("txn");
    const query = transactionsRef.where("type", "==", U2B);
    const snapshot = await query.get();
    let burnt = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data() as {
        amount: number;
      };
      burnt += data.amount;
    }
    return { burnt, remainingToken };
  }),
  promocode: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const promocodes = await ctx.db
        .collection("promocode")
        .where("code", "==", input.code)
        .get();
      if (promocodes.empty) throw new TRPCError({ code: "NOT_FOUND" });
      const promo = promocodes.docs[0]?.data() as {
        code: string;
        used: Timestamp;
        value: number;
      };
      if (promo.used)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Promocode already redeemed",
        });
      const senderQuery = await ctx.db
        .collection("users")
        .doc("TOKENWALE_WALLET")
        .get();
      const receiverQuery = await ctx.db
        .collection("users")
        .where("userId", "==", ctx.session.user.id)
        .limit(1)
        .get();
      const global = await ctx.db.collection("global").doc("global").get();
      if (!senderQuery || receiverQuery.empty) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Query Not found",
        });
      }
      const senderDoc = senderQuery;
      const receiverDoc = receiverQuery.docs[0];
      if (!senderDoc || !receiverDoc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doc Not found",
        });
      }
      const receiverBalance = (receiverDoc.data().balance as number) || 0;
      const globalBalance = global.data()?.TOTAL_REMAINING_TOKEN as number;
      console.log(globalBalance);
      if (!globalBalance)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Global Not found",
        });
      const senderRef = senderDoc.ref;
      const receiverRef = receiverDoc.ref;
      await ctx.db.collection("txn").add({
        id: generateRandomNumberString(),
        amount: promo.value,
        from: senderRef,
        to: receiverRef,
        type: T2U,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      await receiverRef.update({
        balance: receiverBalance + promo.value,
      });
      await global.ref.update({
        TOTAL_REMAINING_TOKEN: globalBalance - promo.value,
      });
      await promocodes.docs[0]?.ref.update({
        used: firestore.FieldValue.serverTimestamp(),
      });
      return { success: true, value: promo.value };
    }),
  spinLimit: protectedProcedure.mutation(async ({ ctx }) => {
    const userDoc = await ctx.db
      .collection("users")
      .where("userId", "==", ctx.session.user.id)
      .get();
    if (userDoc.empty) throw new TRPCError({ code: "NOT_FOUND" });
    const user = userDoc.docs[0]?.data() as {
      spinner: Timestamp;
      balance: number;
    };
    if (user.spinner && !is24HourDiff(user.spinner)) return { allow: false };
    return { allow: true };
  }),
  spinner: protectedProcedure.mutation(async ({ ctx }) => {
    const userDoc = await ctx.db
      .collection("users")
      .where("userId", "==", ctx.session.user.id)
      .get();
    if (userDoc.empty) throw new TRPCError({ code: "NOT_FOUND" });
    const user = userDoc.docs[0]?.data() as {
      spinner: Timestamp;
      balance: number;
    };
    const userRef = userDoc.docs[0]?.ref;
    if (user.spinner && !is24HourDiff(user.spinner))
      throw new TRPCError({ code: "CONFLICT", message: "Wait for 24 Hours" });
    const winningValue = getRandomValueForSpinner();
    const senderQuery = await ctx.db
      .collection("users")
      .doc("TOKENWALE_WALLET")
      .get();
    const global = await ctx.db.collection("global").doc("global").get();
    if (!senderQuery) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Query Not found",
      });
    }
    if (!userRef) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User Not found",
      });
    }
    const senderDoc = senderQuery;
    if (!senderDoc) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Doc Not found",
      });
    }
    const receiverBalance = user.balance;
    const globalBalance = global.data()?.TOTAL_REMAINING_TOKEN as number;
    if (!globalBalance)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Global Not found",
      });
    const senderRef = senderDoc.ref;
    const receiverRef = userRef;
    await ctx.db.collection("txn").add({
      id: generateRandomNumberString(),
      amount: winningValue,
      from: senderRef,
      to: receiverRef,
      type: T2U,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    await receiverRef.update({
      balance: receiverBalance + winningValue,
      spinner: firestore.FieldValue.serverTimestamp(),
    });
    await global.ref.update({
      TOTAL_REMAINING_TOKEN: globalBalance - winningValue,
    });
    return { success: true, winningValue };
  }),
  scratchLimit: protectedProcedure.mutation(async ({ ctx }) => {
    const userDoc = await ctx.db
      .collection("users")
      .where("userId", "==", ctx.session.user.id)
      .get();
    if (userDoc.empty) throw new TRPCError({ code: "NOT_FOUND" });
    const user = userDoc.docs[0]?.data() as {
      scratch: Timestamp;
      balance: number;
    };
    if (user.scratch && !is24HourDiff(user.scratch)) return { allow: false };
    return { allow: true };
  }),
  scratch: protectedProcedure.mutation(async ({ ctx }) => {
    const userDoc = await ctx.db
      .collection("users")
      .where("userId", "==", ctx.session.user.id)
      .get();
    if (userDoc.empty) throw new TRPCError({ code: "NOT_FOUND" });
    const user = userDoc.docs[0]?.data() as {
      scratch: Timestamp;
      balance: number;
    };
    const userRef = userDoc.docs[0]?.ref;
    if (user.scratch && !is24HourDiff(user.scratch))
      throw new TRPCError({ code: "CONFLICT", message: "Wait for 24 Hours" });
    const winningValue = getRandomValueForScratch();
    const senderQuery = await ctx.db
      .collection("users")
      .doc("TOKENWALE_WALLET")
      .get();
    const global = await ctx.db.collection("global").doc("global").get();
    if (!senderQuery) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Query Not found",
      });
    }
    if (!userRef) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User Not found",
      });
    }
    const senderDoc = senderQuery;
    if (!senderDoc) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Doc Not found",
      });
    }
    const receiverBalance = user.balance;
    const globalBalance = global.data()?.TOTAL_REMAINING_TOKEN as number;
    if (!globalBalance)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Global Not found",
      });
    const senderRef = senderDoc.ref;
    const receiverRef = userRef;
    await ctx.db.collection("txn").add({
      id: generateRandomNumberString(),
      amount: winningValue,
      from: senderRef,
      to: receiverRef,
      type: T2U,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    await receiverRef.update({
      balance: receiverBalance + winningValue,
      scratch: firestore.FieldValue.serverTimestamp(),
    });
    await global.ref.update({
      TOTAL_REMAINING_TOKEN: globalBalance - winningValue,
    });
    return { success: true, winningValue };
  }),
  graph: publicProcedure.query(async ({ ctx }) => {
    const currentDate = new Date();
    const oneWeekAgo = new Date(
      currentDate.getTime() - 8 * 24 * 60 * 60 * 1000,
    );
    const oneWeekAgoTimestamp = AdminTimestamp.fromDate(oneWeekAgo);
    const transactionsRef = ctx.db.collection("log");
    const query = transactionsRef
      .where("timestamp", ">=", oneWeekAgoTimestamp)
      .orderBy("timestamp", "asc");
    const graphData: {
      burnt: number;
      mined: number;
      available: number;
      date: string;
    }[] = [];
    const snapshot = await query.get();
    for (const doc of snapshot.docs) {
      const data = doc.data() as {
        mined: number;
        burnt: number;
        available: number;
        timestamp: Timestamp;
      };
      graphData.push({
        burnt: data.burnt,
        mined: data.mined,
        available: data.available,
        date: formatFirestoreTimestamp(data.timestamp)?.date ?? "",
      });
    }
    return graphData;
  }),
  ads: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.collection("ads").get();
    if (users.empty)
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    const urls = users.docs
      .map((e) => e.data() as { url: string })
      .map((e) => e.url);
    return urls;
  }),
});
