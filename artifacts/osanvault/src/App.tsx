import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import PropertiesPage from "@/pages/properties";
import PropertyDetailPage from "@/pages/property-detail";
import StakingPage from "@/pages/staking";
import GovernancePage from "@/pages/governance";
import CarbonPage from "@/pages/carbon";
import PortfolioPage from "@/pages/portfolio";
import DashboardPage from "@/pages/dashboard";
import TreasuryPage from "@/pages/treasury";
import LandRegistryPage from "@/pages/land-registry";
import GovernmentPage from "@/pages/government";
import AdminPage from "@/pages/admin";
import IssuerPage from "@/pages/issuer";
import WhitelistPage from "@/pages/whitelist";
import AboutPage from "@/pages/about";
import TokenomicsPage from "@/pages/tokenomics";
import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/properties" component={PropertiesPage} />
        <Route path="/properties/:id" component={PropertyDetailPage} />
        <Route path="/land-registry" component={LandRegistryPage} />
        <Route path="/government" component={GovernmentPage} />
        <Route path="/treasury" component={TreasuryPage} />
        <Route path="/staking" component={StakingPage} />
        <Route path="/governance" component={GovernancePage} />
        <Route path="/carbon" component={CarbonPage} />
        <Route path="/portfolio" component={PortfolioPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/issuer" component={IssuerPage} />
        <Route path="/whitelist" component={WhitelistPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/tokenomics" component={TokenomicsPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster position="bottom-right" richColors closeButton />
    </TooltipProvider>
  );
}
