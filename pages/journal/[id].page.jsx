import React from "react";
import JournalEntry from "../../renderer/Components/JournalEntry.jsx";

export function Page({ id }) {
  return <JournalEntry id={id} />;
}

export function onBeforeRender({ routeParams }) {
  return {
    pageContext: {
      pageProps: {
        id: routeParams.id,
      }
    },
  };
}
