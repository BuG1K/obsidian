import "@/styles/globals.scss";

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"
        rel="stylesheet"
      />
    </head>
    <body>
      {children}
    </body>
  </html>
);

export default RootLayout;
