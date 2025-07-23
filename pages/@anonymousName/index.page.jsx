import React from "react";
import PublicProfile from "../../renderer/Components/PublicJournals/PublicProfile.jsx";

export function Page({ anonymousName }) {
  return <PublicProfile anonymousName={anonymousName} />;
}

export function onBeforeRender({ routeParams }) {
  return {
    pageContext: {
      pageProps: {
        anonymousName: routeParams.anonymousName,
      }
    },
  };
}
