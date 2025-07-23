import React from "react";
import StoryEntry from "../../renderer/Components/StoryEntry.jsx";

export function Page({ anonymousName, slug }) {
  return <StoryEntry anonymousName={anonymousName} slug={slug} />;
}

export function onBeforeRender({ routeParams }) {
  return {
    pageContext: {
      pageProps: {
        anonymousName: routeParams.anonymousName,
        slug: routeParams.slug,
      }
    },
  };
}
