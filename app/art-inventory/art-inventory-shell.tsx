"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import HubShell from "../hub-shell";
import { PremiumProvider, usePremium, isPalette } from "../premium-preferences";
import { sectionPaths } from "../route-paths";
import type { Section, Project } from "../hub-data";

function ArtInventoryShellInner({ children, projects = [] }: { children: ReactNode; projects?: Project[] }) {
  const router = useRouter();
  const { palette: theme, setPalette } = usePremium();
  const setTheme = (v: string) => { if (isPalette(v)) setPalette(v); };
  const [menu, setMenu] = useState(false);

  const navigate = (s: Section) => {
    router.push(sectionPaths[s]);
    setMenu(false);
  };

  return (
    <HubShell
      tab={"Cartilla Studio" as any}
      current="Cartilla Visual Studio"
      projects={projects}
      theme={theme}
      setTheme={setTheme}
      menu={menu}
      setMenu={setMenu}
      loading={false}
      errors={0}
      refresh={() => {}}
      navigate={navigate}
    >
      {children}
    </HubShell>
  );
}

export default function ArtInventoryShell({ children, projects = [] }: { children: ReactNode; projects?: Project[] }) {
  return (
    <PremiumProvider>
      <ArtInventoryShellInner projects={projects}>
        {children}
      </ArtInventoryShellInner>
    </PremiumProvider>
  );
}
