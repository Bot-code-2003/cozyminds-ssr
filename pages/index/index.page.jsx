import React from "react";
import LandingPage from "../../renderer/Components/Landing/LandingPage.jsx";
import Public from "../../renderer/Components/Public.jsx";

function Page({ isLoggedIn }) {
  return isLoggedIn ? <Public /> : <LandingPage />;
}

// ✅ Exporting the page as expected by vite-plugin-ssr
export default {
  Page,
  // optional: you can also include `documentProps` here
};

export async function onBeforeRender() {
  // ⚠️ window is undefined on server — can't use localStorage directly here
  const isLoggedIn = false; // SSR-safe fallback, do real logic on client if needed

  return {
    pageContext: {
      pageProps: {
        isLoggedIn,
      },
    },
  };
}
