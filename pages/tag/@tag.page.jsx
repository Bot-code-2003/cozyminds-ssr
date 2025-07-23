import React from "react";
import TagEntries from "../../renderer/Components/PublicJournals/TagEntries.jsx";

export default function Page({ tag }) {
  return <TagEntries tag={tag} />;
}

export function getPageProps({ routeParams }) {
  return {
    pageProps: {
      tag: routeParams.tag,
    },
  };
}
