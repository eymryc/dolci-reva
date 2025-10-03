import MainFooter from "@/components/ui/MainFooter"
import MainHeader from "@/components/ui/MainHeader"

export default function Layout({
   children,
}: {
   children: React.ReactNode
}) {
   return <section>
        <MainHeader />
        {children}
        <MainFooter />
   </section>
}