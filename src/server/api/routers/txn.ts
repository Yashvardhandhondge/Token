import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  formatFirestoreTimestamp,
  generateRandomNumberString,
  getAmountAfterTxnCost,
  U2B,
  U2U,
} from "@/utils/random";
import { firestore } from "firebase-admin";
import {
  limit,
  Timestamp,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { Timestamp as AdminTimestamp } from "firebase-admin/firestore";
import { Filter } from "firebase-admin/firestore";

export const txnRouter = createTRPCRouter({
  send: protectedProcedure
    .input(z.object({ to: z.string(), amt: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (input.amt < 100)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Amount should be atleast 100",
        });
      return ctx.db.runTransaction(async (t) => {
        const senderQuery = await t.get(
          ctx.db
            .collection("users")
            .where("userId", "==", ctx.session.user.id)
            .limit(1),
        );
        const receiverQuery = await t.get(
          ctx.db.collection("users").where("userId", "==", input.to).limit(1),
        );
        const nullDoc = await t.get(
          ctx.db.collection("users").doc("NULL_WALLET"),
        );
        if (senderQuery.empty || receiverQuery.empty) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Query Not found",
          });
        }
        const senderDoc = senderQuery.docs[0];
        const receiverDoc = receiverQuery.docs[0];
        if (!senderDoc || !receiverDoc) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Doc Not found",
          });
        }
        const senderRef = senderDoc.ref;
        const receiverRef = receiverDoc.ref;
        const nullRef = nullDoc.ref;
        const senderBalance = (senderDoc.data().balance as number) || 0;
        const receiverBalance = (receiverDoc.data().balance as number) || 0;

        if (senderBalance < input.amt)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient funds",
          });

        const amtAfterCost = getAmountAfterTxnCost(input.amt);
        const fees = input.amt - amtAfterCost;
        const newBalanceSender = senderBalance - input.amt;
        const newBalanceReceiver = receiverBalance + amtAfterCost;

        t.update(senderRef, {
          balance: newBalanceSender,
        });

        t.update(receiverRef, {
          balance: newBalanceReceiver,
        });

        const transactionRef = ctx.db.collection("txn").doc();
        const nullTransactionRef = ctx.db.collection("txn").doc();
        t.set(transactionRef, {
          id: generateRandomNumberString(),
          amount: amtAfterCost,
          from: senderRef,
          to: receiverRef,
          type: U2U,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        t.set(nullTransactionRef, {
          id: generateRandomNumberString(),
          amount: fees,
          from: senderRef,
          to: nullRef,
          type: U2B,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
      });
    }),
  getLatestTxn: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const transactionsRef = ctx.db.collection("txn");
      const query = transactionsRef
        .orderBy("timestamp", "desc")
        .limit(limit + 1);
      const snapshot = await query.get();
      const transactions: {
        amount: number;
        from: string;
        id: string;
        timestamp: Timestamp;
        to: string;
      }[] = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        // Fetch 'from' and 'to' references
        const fromQuery = (await data.from) as FirebaseFirestore.Query;
        const fromDoc =
          (await fromQuery.get()) as unknown as QueryDocumentSnapshot;

        const fromData = fromDoc.data() as {
          phrase: string;
          userId: string;
          password: string;
          balance: number;
        };
        const toQuery = (await data.to) as FirebaseFirestore.Query;
        const toDoc = (await toQuery.get()) as unknown as QueryDocumentSnapshot;

        const toData = toDoc.data() as {
          phrase: string;
          userId: string;
          password: string;
          balance: number;
        };
        transactions.push({
          id: data.id as string,
          timestamp: data.timestamp as Timestamp,
          from: fromData.userId,
          to: toData.userId,
          amount: data.amount as number,
        });
      }
      return transactions;
    }),
  getLatestTxnByUserId: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const user = await ctx.db
        .collection("users")
        .where("userId", "==", ctx.session.user.id)
        .get();
      if (user.empty)
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });

      const transactionsRef = ctx.db.collection("txn");
      const query = transactionsRef
        .where(
          Filter.or(
            Filter.where("to", "==", user.docs[0]?.ref),
            Filter.where("from", "==", user.docs[0]?.ref),
          ),
        )
        .orderBy("timestamp", "desc")
        .limit(limit);
      const snapshot = await query.get();
      const transactions: {
        amount: number;
        from: string;
        id: string;
        timestamp: { date: string; time: string } | null;
        to: string;
      }[] = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        // Fetch 'from' and 'to' references
        const fromQuery = (await data.from) as FirebaseFirestore.Query;
        const fromDoc =
          (await fromQuery.get()) as unknown as QueryDocumentSnapshot;

        const fromData = fromDoc.data() as {
          phrase: string;
          userId: string;
          password: string;
          balance: number;
        };
        const toQuery = (await data.to) as FirebaseFirestore.Query;
        const toDoc = (await toQuery.get()) as unknown as QueryDocumentSnapshot;

        const toData = toDoc.data() as {
          phrase: string;
          userId: string;
          password: string;
          balance: number;
        };
        transactions.push({
          id: data.id as string,
          timestamp: formatFirestoreTimestamp(
            data.timestamp as {
              _seconds: number;
              _nanoseconds: number;
            },
          ),
          from: fromData.userId,
          to: toData.userId,
          amount: data.amount as number,
        });
      }
      return transactions;
    }),
  getTxnGraphByUserId: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db
      .collection("users")
      .where("userId", "==", ctx.session.user.id)
      .get();
    if (user.empty)
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    const tokenwale = await ctx.db
      .collection("users")
      .doc("TOKENWALE_WALLET")
      .get();
    if (!tokenwale)
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    const currentDate = new Date();
    const oneWeekAgo = new Date(
      currentDate.getTime() - 7 * 24 * 60 * 60 * 1000,
    );
    const oneWeekAgoTimestamp = AdminTimestamp.fromDate(oneWeekAgo);
    const transactionsRef = ctx.db.collection("txn");
    const query = transactionsRef
      .where(
        Filter.and(
          Filter.where("to", "==", user.docs[0]?.ref),
          Filter.where("from", "==", tokenwale.ref),
          Filter.where("timestamp", ">=", oneWeekAgoTimestamp),
        ),
      )
      .orderBy("timestamp", "asc");
    const graphData: { amount: number; timestamp: Timestamp }[] = [];
    const snapshot = await query.get();
    for (const doc of snapshot.docs) {
      const data = doc.data() as {
        amount: number;
        timestamp: Timestamp;
      };
      graphData.push({ amount: data.amount, timestamp: data.timestamp });
    }
    return graphData;
  }),
  getLatestTxnByUserIdInf: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().min(1).nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const user = await ctx.db
        .collection("users")
        .where("userId", "==", ctx.session.user.id)
        .get();
      if (user.empty)
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      const cursorDoc = input.cursor
        ? await ctx.db.collection("txn").doc(input.cursor).get()
        : null;
      const transactionsRef = ctx.db.collection("txn");
      let query = transactionsRef
        .where(
          Filter.or(
            Filter.where("to", "==", user.docs[0]?.ref),
            Filter.where("from", "==", user.docs[0]?.ref),
          ),
        )
        .orderBy("timestamp", "desc")
        .limit(limit + 1);
      if (cursor) {
        query = query.startAfter(cursorDoc);
      }
      const snapshot = await query.get();
      const transactions: {
        firestoreId: string;
        amount: number;
        from: string;
        id: string;
        timestamp: Timestamp;
        to: string;
      }[] = [];
      let lastVisible: string | null = null;
      for (const doc of snapshot.docs) {
        const data = doc.data();
        // Fetch 'from' and 'to' references
        const fromRef = data.from as FirebaseFirestore.DocumentReference;
        const toRef = data.to as FirebaseFirestore.DocumentReference;
        const [fromDoc, toDoc] = await Promise.all([
          fromRef.get(),
          toRef.get(),
        ]);

        const fromData = fromDoc.data() as {
          phrase: string;
          userId: string;
          password: string;
          balance: number;
        };
        const toData = toDoc.data() as {
          phrase: string;
          userId: string;
          password: string;
          balance: number;
        };

        transactions.push({
          firestoreId: doc.id,
          id: data.id as string,
          timestamp: data.timestamp as Timestamp,
          from: fromData.userId,
          to: toData.userId,
          amount: data.amount as number,
        });
      }
      if (transactions.length > limit) {
        const nextItem = transactions.pop();
        lastVisible = nextItem?.firestoreId ?? "";
      }
      return {
        transactions,
        lastVisible,
      };
    }),
  getLatestTxnInf: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().min(1).nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const cursorDoc = input.cursor
        ? await ctx.db.collection("txn").doc(input.cursor).get()
        : null;
      const transactionsRef = ctx.db.collection("txn");
      let query = transactionsRef.orderBy("timestamp", "desc").limit(limit + 1);
      if (cursor) {
        query = query.startAfter(cursorDoc);
      }
      const snapshot = await query.get();
      const transactions: {
        firestoreId: string;
        amount: number;
        from: string;
        id: string;
        timestamp: Timestamp;
        to: string;
      }[] = [];
      let lastVisible: string | null = null;
      for (const doc of snapshot.docs) {
        const data = doc.data();
        // Fetch 'from' and 'to' references
        const fromRef = data.from as FirebaseFirestore.DocumentReference;
        const toRef = data.to as FirebaseFirestore.DocumentReference;
        const [fromDoc, toDoc] = await Promise.all([
          fromRef.get(),
          toRef.get(),
        ]);

        const fromData = fromDoc.data() as {
          phrase: string;
          userId: string;
          password: string;
          balance: number;
        };
        const toData = toDoc.data() as {
          phrase: string;
          userId: string;
          password: string;
          balance: number;
        };

        transactions.push({
          firestoreId: doc.id,
          id: data.id as string,
          timestamp: data.timestamp as Timestamp,
          from: fromData.userId,
          to: toData.userId,
          amount: data.amount as number,
        });
      }
      if (transactions.length > limit) {
        const nextItem = transactions.pop();
        lastVisible = nextItem?.firestoreId ?? "";
      }
      return {
        transactions,
        lastVisible,
      };
    }),
});
