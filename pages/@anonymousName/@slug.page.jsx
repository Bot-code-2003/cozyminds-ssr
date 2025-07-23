import React from "react";
import StoryEntry from "../../renderer/Components/StoryEntry.jsx";

export default function Page({ anonymousName, slug }) {
  return <StoryEntry anonymousName={anonymousName} slug={slug} />;
}

export function getPageProps({ routeParams }) {
  return {
    pageProps: {
      anonymousName: routeParams.anonymousName,
      slug: routeParams.slug,
    },
  };
}
