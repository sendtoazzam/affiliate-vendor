"use client";

import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("./LoginForm"), {
  ssr: false,
  loading: () => null,
});

export default function LoginPage() {
  return <LoginForm />;
}
