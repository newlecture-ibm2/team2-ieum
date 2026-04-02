import Header from "@/app/_components/common/Header";
import Footer from "@/app/_components/common/Footer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - var(--header-height) - 200px)" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
