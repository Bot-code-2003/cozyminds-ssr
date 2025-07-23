import React from "react";
import TagEntries from "../../renderer/Components/PublicJournals/TagEntries.jsx";

export function Page({ tag }) {
  return <TagEntries tag={tag} />;
}

export function onBeforeRender({ routeParams }) {
  return {
    pageContext: {
      pageProps: {
        tag: routeParams.tag,
      }
    },
  };
}
