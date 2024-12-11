import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import axios from "axios";
import admin from "@/server/firebase";
import { env } from "@/env";
import { generateOTP } from "@/utils/otp";
import { resend } from "@/utils/resend";
import { TRPCError } from "@trpc/server";
import { Filter } from "firebase-admin/firestore";

export const otpRouter = createTRPCRouter({
  sendOtpEmail: protectedProcedure
    .input(z.object({ email: z.string().min(1).email() }))
    .mutation(async ({ ctx, input }) => {
      const otp = generateOTP();

      const msg = {
        to: input.email,
        from: "app@app.tokenwale.in",
        subject: "Your OTP",
        text: `Your OTP is: ${otp}`,
        html: `<strong>Your OTP is: ${otp}</strong>`,
      };

      const a = await resend.emails.send(msg);
      console.log(a);
      await ctx.db.collection("otp").add({
        email: input.email,
        userId: ctx.session.user.id,
        type: "EMAIL",
        otp,
        createdAt: new Date(),
      });

      return { success: true };
    }),
  sendOtpMobile: protectedProcedure
    .input(z.object({ phone: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const otp = generateOTP();
      console.log(
        `https://www.fast2sms.com/dev/bulkV2?authorization=${env.FAST2SMS_API_KEY}&variables_values=${otp}&route=otp&numbers=${input.phone}`,
      );
      const response = await axios.get(
        `https://www.fast2sms.com/dev/bulkV2?authorization=${env.FAST2SMS_API_KEY}&variables_values=${otp}&route=otp&numbers=${input.phone}`,
      );
      console.log(response.data);
      console.log(otp);
      await ctx.db.collection("otp").add({
        phone: input.phone,
        userId: ctx.session.user.id,
        type: "PHONE",
        otp,
        createdAt: new Date(),
      });
      return { success: true };
    }),
  verifyOtp: protectedProcedure
    .input(z.object({ type: z.enum(["PHONE", "EMAIL"]), otp: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db
        .collection("otp")
        .where(
          Filter.and(
            Filter.where("userId", "==", ctx.session.user.id),
            Filter.where("type", "==", input.type),
          ),
        )
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();
      if (user.empty)
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      const data = user.docs[0]?.data() as { otp: string };
      console.log(data);
      if (data.otp && data.otp === input.otp) {
        await user.docs[0]?.ref.delete();
        return { success: true };
      }
      return { success: false };
    }),
});