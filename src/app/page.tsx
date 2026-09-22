"use client";

import dynamic from "next/dynamic";

const HomeRedirect = dynamic(() => import("./HomeRedirect"), {
  ssr: false,
  loading: () => null,
});

export default function RootHomePage() {
  return <HomeRedirect />;
}
