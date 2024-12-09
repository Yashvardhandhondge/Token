import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

import { hashtext } from "@/utils/hashing";
import { TRPCError } from "@trpc/server";
import { generateRandomNumberString, T2U } from "@/utils/random";
import { firestore } from "firebase-admin";
import { Filter } from "firebase-admin/firestore";

export const userRouter = createTRPCRouter({
  getUserIdFromPhrase: publicProcedure
    .input(z.object({ phrase: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const hashedPhrase = await hashtext(input.phrase);
      const users = await ctx.db
        .collection("users")
        .where("phrase", "==", hashedPhrase)
        .get();
      if (users.empty)
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      const user = users.docs[0];
      return user?.data().userId as string;
    }),
  updatePasswordFromUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        password: z.string().min(3),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db
        .collection("users")
        .where("userId", "==", input.userId)
        .get();
      if (user.empty)
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      const hashedPassword = await hashtext(input.password);
      const updatePromises = user.docs.map((doc) =>
        doc.ref.update({ password: hashedPassword }),
      );
      return await Promise.allSettled(updatePromises);
    }),
  insertPhraseGetUserId: publicProcedure
    .input(z.object({ phrase: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const hashedPhrase = await hashtext(input.phrase);
      const userId = generateRandomNumberString();
      const user = await ctx.db.collection("users").add({
        userId,
        phrase: hashedPhrase,
        balance: 0,
      });
      if (!user.id)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      return userId;
    }),
  getUserDetailsByUserId: protectedProcedure.query(async ({ ctx }) => {
    const userRef = await ctx.db
      .collection("users")
      .where("userId", "==", ctx.session.user.id)
      .get();
    if (userRef.empty)
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    const users = userRef.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const { userId, balance, name, phone, email, address, gender } =
      users[0] as unknown as {
        userId: string;
        balance: number;
        name: string;
        phone: string;
        email: string;
        address: string;
        gender: "M" | "F" | "O";
      };
    return { userId, balance, name, phone, email, address, gender };
  }),
  findUserByUserId: protectedProcedure
    .input(
      z.object({ userId: z.string(), limit: z.number().min(5).default(5) }),
    )
    .mutation(async ({ ctx, input }) => {
      const matchedUserIds: string[] = [];
      const usersRef = ctx.db.collection("users");
      const query = usersRef
        .where("userId", ">=", input.userId)
        .where("userId", "<", input.userId + "\uf8ff")
        .orderBy("userId")
        .limit(input.limit);
      const snapshot = await query.get();
      snapshot.forEach((doc) => {
        const userId = doc.get("userId") as string;
        if (typeof userId === "string" && userId.includes(input.userId)) {
          matchedUserIds.push(userId);
        }
      });
      return matchedUserIds;
    }),
  editUserDetails: protectedProcedure
    .input(
      z.object({
        key: z.enum(["name", "phone", "email", "address", "gender"]),
        value: z.any(),
        otp: z.string().nullish(),
        // name: z.string().nullable(),
        // phone: z.string().nullable(),
        // email: z.string().email(),
        // address: z.string(),
        // gender: z.enum(["M", "F", "O"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db
        .collection("users")
        .where("userId", "==", ctx.session.user.id)
        .get();
      if (user.empty)
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      const userData = user.docs[0]?.data() as {
        userId: string;
        balance: number;
        name: string;
        phone: string;
        email: string;
        address: string;
        gender: "M" | "F" | "O";
      };
      if (input.key === "name") {
        if (userData.name === undefined) {
          const userRef = user.docs[0]?.ref;
          const winningValue = 1;
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
          const receiverBalance = userData.balance;
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
          });
          await global.ref.update({
            TOTAL_REMAINING_TOKEN: globalBalance - winningValue,
          });
        }
        await user.docs[0]?.ref.update({
          name: input.value,
        });
      }
      if (input.key === "gender") {
        if (userData.gender === undefined) {
          const userRef = user.docs[0]?.ref;
          const winningValue = 1;
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
          const receiverBalance = userData.balance;
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
          });
          await global.ref.update({
            TOTAL_REMAINING_TOKEN: globalBalance - winningValue,
          });
        }
        await user.docs[0]?.ref.update({
          gender: input.value,
        });
      }
      if (input.key === "address") {
        if (userData.address === undefined) {
          const userRef = user.docs[0]?.ref;
          const winningValue = 1;
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
          const receiverBalance = userData.balance;
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
          });
          await global.ref.update({
            TOTAL_REMAINING_TOKEN: globalBalance - winningValue,
          });
        }
        await user.docs[0]?.ref.update({
          address: input.value,
        });
      }
      if (input.key === "email") {
        if (userData.email === undefined) {
          const userRef = user.docs[0]?.ref;
          const winningValue = 1;
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
          const receiverBalance = userData.balance;
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
          });
          await global.ref.update({
            TOTAL_REMAINING_TOKEN: globalBalance - winningValue,
          });
        }
        await user.docs[0]?.ref.update({
          email: input.value,
        });
      }
      if (input.key === "phone") {
        if (userData.phone === undefined) {
          const userRef = user.docs[0]?.ref;
          const winningValue = 1;
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
          const receiverBalance = userData.balance;
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
          });
          await global.ref.update({
            TOTAL_REMAINING_TOKEN: globalBalance - winningValue,
          });
        }
        await user.docs[0]?.ref.update({
          phone: input.value,
        });
      }
      return { success: true };
    }),
});
