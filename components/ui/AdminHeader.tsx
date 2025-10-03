import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbPageData {
  label: string;
  href?: string;
  hideOnMobile?: boolean;
}

interface AdminHeaderProps {
  breadcrumbPages: BreadcrumbPageData[];
}

const AdminHeader = ({ breadcrumbPages }: AdminHeaderProps) => (
  <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
    <div className="flex items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbPages.map((page, idx) => {
            const isLast = idx === breadcrumbPages.length - 1;
            const hideClass = page.hideOnMobile ? "hidden md:block" : "";
            return (
              <React.Fragment key={page.label + idx}>
                <BreadcrumbItem className={hideClass}>
                  {isLast || !page.href ? (
                    <BreadcrumbPage>{page.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={page.href}>{page.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className={hideClass} />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </header>
);

export default AdminHeader; 