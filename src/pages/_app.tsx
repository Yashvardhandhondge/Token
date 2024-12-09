import Head from "next/head";
import { type AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import "tailwindcss/tailwind.css";
import "../../src/styles/globals.css";
import localFont from "next/font/local";
import { TRPCReactProvider } from "@/trpc/react";
import { type Session } from "next-auth";

const myFont = localFont({
  src: "../../public/fonts/JetBrainsMono-2.304/fonts/webfonts/JetBrainsMono-Medium.woff2",
  display: "swap",
});
function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session | null }>) {
  return (
    <>
      <SessionProvider session={session}>
        <Head>
          <title>TokenWale</title>
        </Head>
        <div className={myFont.className}>
          <TRPCReactProvider>
            <Component {...pageProps} />
          </TRPCReactProvider>
        </div>
      </SessionProvider>
    </>
  );
}

export default MyApp;
