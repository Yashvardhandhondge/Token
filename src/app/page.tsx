import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Navbar } from "./_components/common/Navbar";
import { HeroSection } from "./_components/landing-page/HeroSection";
import { GraphSection } from "./_components/landing-page/GraphSection";
import { HeroTable } from "./_components/landing-page/HeroTable";
import { ConnectToWallet } from "./_components/landing-page/ConnectToWallet";
import { LandingPageFooter } from "./_components/landing-page/LandingPageFooter";
import ClientWrapper from "./ClientWrapper";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getServerAuthSession();
  void api.post.getLatest.prefetch();

  return (
    <ClientWrapper session={session}>
      <HydrateClient>
        <main>
          <Navbar />
          <HeroSection />
          <GraphSection />
          <HeroTable />
          <ConnectToWallet />
          <LandingPageFooter />
        </main>
      </HydrateClient>
    </ClientWrapper>
  );
}
