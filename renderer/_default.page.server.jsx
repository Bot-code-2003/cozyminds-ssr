export { render }
// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = ['pageProps', 'urlPathname']

import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr/server'
import { StaticRouter } from 'react-router-dom/server'

// Import your providers
import { ThemeProvider } from "./context/ThemeContext";
import { MailProvider } from "./context/MailContext";
import { PublicJournalsProvider } from "./context/PublicJournalsContext";
import { PublicStoriesProvider } from "./context/PublicStoriesContext";

async function render(pageContext) {
  const { Page, pageProps } = pageContext
  // This render() hook only supports SSR, see https://vite-plugin-ssr.com/render-modes for how to modify render() to support SPA
  if (!Page) throw new Error('My render() hook expects pageContext.Page to be defined')
  
  const pageHtml = ReactDOMServer.renderToString(
    <StaticRouter location={pageContext.urlOriginal}>
      <ThemeProvider>
        <PublicJournalsProvider>
          <PublicStoriesProvider>
            <MailProvider>
              <Page {...pageProps} />
            </MailProvider>
          </PublicStoriesProvider>
        </PublicJournalsProvider>
      </ThemeProvider>
    </StaticRouter>
  )

  // See https://vite-plugin-ssr.com/head
  const { documentProps } = pageContext.exports
  const title = (documentProps && documentProps.title) || 'Starlit Journals'
  const desc = (documentProps && documentProps.description) || 'Anonymous stories & ideas - A place to read, write, and share authentic experiences'

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap" rel="stylesheet">
      </head>
      <body>
        <div id="react-root">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
    }
  }
}
