import type { Metadata } from "next";import "./globals.css";import "./hub-premium.css";
export const metadata:Metadata={title:"NBO | Operations Hub",description:"Private business operations and GitHub project dashboard"};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" data-theme="chrome"><body>{children}</body></html>}
