import React from "react";
import PublicProfile from "../../renderer/Components/PublicJournals/PublicProfile.jsx";

export default function Page({ anonymousName }) {
  return <PublicProfile anonymousName={anonymousName} />;
}

export function getPageProps({ routeParams }) {
  return {
    pageProps: {
      anonymousName: routeParams.anonymousName,
    },
  };
}
