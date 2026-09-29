import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Belief from "@/pages/belief";
import { useEffect } from "react";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/belief" component={Belief} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Force dark mode on mount — terminal aesthetic is the hero
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
