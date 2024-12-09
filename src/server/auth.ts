import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import { env } from "@/env";
import { db } from "./db";
import { hashtext } from "@/utils/hashing";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      accessToken: string;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: ({ token, user }) => {
      return { ...token, ...user };
    },
    session: ({ session, token }) => {
      session.user.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        userId: { label: "userId", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials) return null;
          const user = await db
            .collection("users")
            .where("userId", "==", credentials.userId)
            .get();
          if (user.empty) throw new Error("User not found");
          const { password } = user.docs[0]?.data() as { password: string };
          const hashedPassword = await hashtext(credentials.password);
          if (hashedPassword !== password) throw new Error("Wrong Password");
          const accessToken = jwt.sign(
            {
              id: credentials.userId,
            },
            env.NEXTAUTH_SECRET,
            {
              expiresIn: 86400 * 30,
            },
          );
          return {
            id: credentials.userId,
            accessToken,
          };
        } catch (error) {
          throw new Error("Internal Server Error");
        }
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
