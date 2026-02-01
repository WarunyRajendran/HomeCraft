import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center">
        <h1 className="mb-3 sm:mb-4 text-6xl sm:text-8xl font-bold text-primary">404</h1>
        <p className="mb-4 sm:mb-6 text-lg sm:text-xl text-muted-foreground">Oops! Page not found</p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
