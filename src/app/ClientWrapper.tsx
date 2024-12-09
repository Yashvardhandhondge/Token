"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

interface ClientWrapperProps {
  children: ReactNode;
  session: Session | null;
}

const ClientWrapper = ({ children, session }: ClientWrapperProps) => {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
};

export default ClientWrapper;
