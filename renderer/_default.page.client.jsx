export { render };

import { hydrateRoot } from "react-dom/client";
import { PageShell } from "./PageShell";

// 🧠 Import your providers
import { ThemeProvider } from "./context/ThemeContext";
import { MailProvider } from "./context/MailContext";
import { PublicJournalsProvider } from "./context/PublicJournalsContext";
import { PublicStoriesProvider } from "./context/PublicStoriesContext";
import { BrowserRouter } from "react-router-dom"; // ✅ Import this

async function render(pageContext) {
  const { Page, pageProps } = pageContext;
  if (!Page)
    throw new Error(
      "Client-side render() hook expects pageContext.Page to be defined"
    );

  const root = document.getElementById("react-root");
  if (!root) throw new Error("DOM element #react-root not found");

  hydrateRoot(
    root,
    <BrowserRouter>
      {" "}
      {/* ✅ Wrap your tree with Router */}
      <ThemeProvider>
        <PublicJournalsProvider>
          <PublicStoriesProvider>
            <MailProvider>
              <PageShell pageContext={pageContext}>
                <Page {...pageProps} />
              </PageShell>
            </MailProvider>
          </PublicStoriesProvider>
        </PublicJournalsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
