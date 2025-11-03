import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import CMSLayout from "@/components/cmsLayout";

// Create a React Query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const cmsPages = [
    "/mentors",
    "/faqs",
    "/media-spotlight",
    "/faq-category",
    "/testimonials",
    "/domains",
    "/courses",
    "/specializations",
    "/universities",
    "/universities-approvals",
    "/placements",
    "/emi-partners"
  ];

  const useCMSLayout = cmsPages.some((path) => router.pathname.startsWith(path));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {useCMSLayout ? (
          <CMSLayout>
            <Component {...pageProps} />
          </CMSLayout>
        ) : (
          <Component {...pageProps} />
        )}
        <Toaster position="top-right" reverseOrder={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
