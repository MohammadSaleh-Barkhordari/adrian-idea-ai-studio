import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopOnRouteChange from "@/components/ScrollToTopOnRouteChange";

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const CaseStudiesPage = lazy(() => import("./pages/CaseStudiesPage"));
const AIPhilosophyPage = lazy(() => import("./pages/AIPhilosophyPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const WritingLetterPage = lazy(() => import("./pages/WritingLetterPage"));
const FinancialAnalysisPage = lazy(() => import("./pages/FinancialAnalysisPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailsPage = lazy(() => import("./pages/ProjectDetailsPage"));
const HRManagementPage = lazy(() => import("./pages/HRManagementPage"));
const CreateDocumentPage = lazy(() => import("./pages/CreateDocumentPage"));
const CreateRequestPage = lazy(() => import("./pages/CreateRequestPage"));
const OurLifePage = lazy(() => import("./pages/OurLifePage"));
const OurFinancialPage = lazy(() => import("./pages/OurFinancialPage"));
const OurCalendarPage = lazy(() => import("./pages/OurCalendarPage"));
const OurTodoPage = lazy(() => import("./pages/OurTodoPage"));
const BlogDashboardPage = lazy(() => import("./pages/BlogDashboardPage"));
const BlogEditorPage = lazy(() => import("./pages/BlogEditorPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
const DataProcessingPage = lazy(() => import("./pages/DataProcessingPage"));
const PrivacyPolicyPageFa = lazy(() => import("./pages/fa/PrivacyPolicyPage"));
const TermsOfServicePageFa = lazy(() => import("./pages/fa/TermsOfServicePage"));
const CookiePolicyPageFa = lazy(() => import("./pages/fa/CookiePolicyPage"));
const DataProcessingPageFa = lazy(() => import("./pages/fa/DataProcessingPage"));
const InstallAppPage = lazy(() => import("./pages/InstallAppPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTopOnRouteChange />
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
                {/* Persian routes (default) */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/case-studies" element={<CaseStudiesPage />} />
                <Route path="/ai-philosophy" element={<AIPhilosophyPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                
                {/* English routes */}
                <Route path="/en" element={<Index />} />
                <Route path="/en/about" element={<AboutPage />} />
                <Route path="/en/services" element={<ServicesPage />} />
                <Route path="/en/case-studies" element={<CaseStudiesPage />} />
                <Route path="/en/ai-philosophy" element={<AIPhilosophyPage />} />
                <Route path="/en/contact" element={<ContactPage />} />
                <Route path="/en/blog" element={<BlogPage />} />
                <Route path="/en/blog/:slug" element={<BlogPostPage />} />
                
                {/* App routes (no language prefix needed) */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/writing-letter" element={<WritingLetterPage />} />
                <Route path="/financial-analysis" element={<FinancialAnalysisPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
                <Route path="/hr-management" element={<HRManagementPage />} />
                <Route path="/create-document" element={<CreateDocumentPage />} />
                <Route path="/create-request" element={<CreateRequestPage />} />
                <Route path="/our-life" element={<OurLifePage />} />
                <Route path="/our-financial" element={<OurFinancialPage />} />
                <Route path="/our-calendar" element={<OurCalendarPage />} />
                <Route path="/our-todo" element={<OurTodoPage />} />
                <Route path="/install" element={<InstallAppPage />} />
                
                {/* Blog Dashboard routes */}
                <Route path="/dashboard/blog" element={<BlogDashboardPage />} />
                <Route path="/dashboard/blog/new" element={<BlogEditorPage />} />
                <Route path="/dashboard/blog/edit/:id" element={<BlogEditorPage />} />
                
                {/* English Blog Dashboard routes */}
                <Route path="/en/dashboard/blog" element={<BlogDashboardPage />} />
                <Route path="/en/dashboard/blog/new" element={<BlogEditorPage />} />
                <Route path="/en/dashboard/blog/edit/:id" element={<BlogEditorPage />} />
                
                {/* Legal Pages - Persian */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPageFa />} />
                <Route path="/terms-of-service" element={<TermsOfServicePageFa />} />
                <Route path="/cookie-policy" element={<CookiePolicyPageFa />} />
                <Route path="/data-processing" element={<DataProcessingPageFa />} />
                
                {/* Legal Pages - English */}
                <Route path="/en/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/en/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/en/cookie-policy" element={<CookiePolicyPage />} />
                <Route path="/en/data-processing" element={<DataProcessingPage />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <ScrollToTop />
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
