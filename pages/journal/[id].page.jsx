import React from "react";
import JournalEntry from "../../renderer/Components/JournalEntry.jsx";

export default function Page({ id }) {
  return <JournalEntry id={id} />;
}

export function getPageProps({ routeParams }) {
  return {
    pageProps: {
      id: routeParams.id,
    },
  };
}
