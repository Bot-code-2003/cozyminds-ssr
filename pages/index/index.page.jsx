import React from "react";
import LandingPage from "../../renderer/Components/Landing/LandingPage.jsx";
import Public from "../../renderer/Components/Public.jsx";

const getCurrentUser = () => {
  if (typeof window === 'undefined') return null; // SSR safety
  try {
    const itemStr = localStorage.getItem("user");
    if (!itemStr) return null;
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem("user");
      return null;
    }
    return item.value;
  } catch {
    return null;
  }
};

function Page({ isLoggedIn }) {
  // Use client-side check if SSR value is not available
  const [clientIsLoggedIn, setClientIsLoggedIn] = React.useState(isLoggedIn);
  
  React.useEffect(() => {
    // Only run on client side
    const user = getCurrentUser();
    setClientIsLoggedIn(!!user);
  }, []);
  
  return isLoggedIn ? <Public /> : <LandingPage />;
}

export { Page };

export async function onBeforeRender() {
  // SSR-safe fallback
  const isLoggedIn = false;

  return {
    pageContext: {
      pageProps: {
        isLoggedIn,
      },
    },
  };
}
