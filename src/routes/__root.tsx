import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { HydrateGate } from "@/components/hydrate-gate";
import { InviteCatcher } from "@/components/invite-catcher";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "دنگ‌پال";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0E9F86" },
      { name: "description", content: "خرج‌ها رو گروهی مدیریت کن · دنگ‌پال" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Vazirmatn:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: Root,
});

function Root() {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <PreviewHostBridge />
        <AuthProvider>
          <div className="flex min-h-dvh justify-center bg-frame md:items-center md:py-6">
            <div
              id="app-phone"
              className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-bg shadow-float md:h-[860px] md:rounded-[32px]"
            >
              <HydrateGate>
                <InviteCatcher />
                <Outlet />
              </HydrateGate>
            </div>
          </div>
          <Toaster
            position="top-center"
            richColors
            dir="rtl"
            toastOptions={{
              className: "font-[Vazirmatn] text-sm",
            }}
          />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
