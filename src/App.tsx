import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

// Placeholder - Your full App content will be restored
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold mb-4">Adrian Idea</h1>
            <p className="text-muted-foreground mb-4">Project restoration in progress...</p>
            <p className="text-sm text-muted-foreground">Please re-upload your source files (extracted from zip)</p>
          </div>
        </div>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
