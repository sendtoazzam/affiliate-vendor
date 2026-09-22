"use client";

import dynamic from "next/dynamic";

const RegisterForm = dynamic(() => import("./RegisterForm"), {
  ssr: false,
  loading: () => null,
});

export default function RegisterPage() {
  return <RegisterForm />;
}
