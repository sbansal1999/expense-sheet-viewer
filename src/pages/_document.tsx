import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <script
          src="https://cdn.databuddy.cc/databuddy.js"
          data-client-id="84de170a-6dce-4801-889f-6dbdcf821289"
          data-track-hash-changes="true"
          data-track-attributes="true"
          data-track-outgoing-links="true"
          data-track-interactions="true"
          data-track-scroll-depth="true"
          data-track-web-vitals="true"
          data-track-errors="true"
          crossOrigin="anonymous"
          async
        ></script>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
