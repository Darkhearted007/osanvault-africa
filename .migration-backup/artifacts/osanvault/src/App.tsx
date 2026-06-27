import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Home is eager — it's the first paint and must not be lazy
import HomePage from "@/pages/home";

// All other routes are lazy-loaded so they don't block the initial bundle
const PropertiesPage    = lazy(() => import("@/pages/properties"));
const PropertyDetailPage= lazy(() => import("@/pages/property-detail"));
const StakingPage       = lazy(() => import("@/pages/staking"));
const GovernancePage    = lazy(() => import("@/pages/governance"));
const CarbonPage        = lazy(() => import("@/pages/carbon"));
const PortfolioPage     = lazy(() => import("@/pages/portfolio"));
const DashboardPage     = lazy(() => import("@/pages/dashboard"));
const TreasuryPage      = lazy(() => import("@/pages/treasury"));
const LandRegistryPage  = lazy(() => import("@/pages/land-registry"));
const GovernmentPage    = lazy(() => import("@/pages/government"));
const AdminPage         = lazy(() => import("@/pages/admin"));
const IssuerPage        = lazy(() => import("@/pages/issuer"));
const WhitelistPage     = lazy(() => import("@/pages/whitelist"));
const AboutPage         = lazy(() => import("@/pages/about"));
const TokenomicsPage    = lazy(() => import("@/pages/tokenomics"));
const LegalSecAripPage  = lazy(() => import("@/pages/legal-sec-arip"));
const LegalTermsPage    = lazy(() => import("@/pages/legal-terms"));
const LegalPrivacyPage  = lazy(() => import("@/pages/legal-privacy"));
const LegalRiskPage     = lazy(() => import("@/pages/legal-risk"));
const EarlyAccessPage   = lazy(() => import("@/pages/early-access"));
const NotFound          = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/"               component={HomePage} />
          <Route path="/dashboard"      component={DashboardPage} />
          <Route path="/properties"     component={PropertiesPage} />
          <Route path="/properties/:id" component={PropertyDetailPage} />
          <Route path="/land-registry"  component={LandRegistryPage} />
          <Route path="/government"     component={GovernmentPage} />
          <Route path="/treasury"       component={TreasuryPage} />
          <Route path="/staking"        component={StakingPage} />
          <Route path="/governance"     component={GovernancePage} />
          <Route path="/carbon"         component={CarbonPage} />
          <Route path="/portfolio"      component={PortfolioPage} />
          <Route path="/admin"          component={AdminPage} />
          <Route path="/issuer"         component={IssuerPage} />
          <Route path="/whitelist"      component={WhitelistPage} />
          <Route path="/about"          component={AboutPage} />
          <Route path="/tokenomics"     component={TokenomicsPage} />
          <Route path="/sec-arip"       component={LegalSecAripPage} />
          <Route path="/terms"          component={LegalTermsPage} />
          <Route path="/privacy"        component={LegalPrivacyPage} />
          <Route path="/risk-disclosure"component={LegalRiskPage} />
          <Route path="/early-access"   component={EarlyAccessPage} />
          <Route                        component={NotFound} />
        </Switch>
      </Suspense>
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
