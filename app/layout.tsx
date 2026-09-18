import "./globals.css";
import React from "react";

export const metadata = {
  title: "Creative Studio",
  description: "Next-level creative studio interactive footer experience with custom typography and gaze tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
