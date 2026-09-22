import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    template: "VF Vendor | %s",
    default: "VF Vendor | Dashboard",
  },
  description:
    "Curated Brand Partner Portal for Products, Reporting, Settlements and Payouts",
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/images/logo/logo-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var clean = function(node) {
                    if (node && node.removeAttribute) {
                      if (node.hasAttribute('bis_skin_checked')) node.removeAttribute('bis_skin_checked');
                      var children = node.querySelectorAll ? node.querySelectorAll('[bis_skin_checked]') : [];
                      for (var i = 0; i < children.length; i++) {
                        children[i].removeAttribute('bis_skin_checked');
                      }
                    }
                  };
                  clean(document.documentElement);
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked' && m.target && m.target.removeAttribute) {
                        m.target.removeAttribute('bis_skin_checked');
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          clean(m.addedNodes[j]);
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    attributeFilter: ['bis_skin_checked'],
                    childList: true,
                    subtree: true
                  });
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-base-200 text-base-content antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
