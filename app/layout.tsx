import type { Metadata } from "next";import "./globals.css";import "./hub-core.css";import "./hub-dashboard.css";import "./hub-detail.css";import "./hub-mobile.css";import "./hub-upgrade.css";
export const metadata:Metadata={title:"NBO | Operations Hub",description:"Private business operations and GitHub project dashboard"};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" data-theme="purple"><body>{children}</body></html>}
