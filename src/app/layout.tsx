/* eslint-disable @next/next/no-head-element */
import '../styles/reset.css'
import { Open_Sans } from 'next/font/google'
const openSans = Open_Sans(
  {
    subsets: ['latin'],
  }
)


import React from "react";
import Link from "next/link";
import '../styles/globals.css'
import '../styles/objects.css'
import '../styles/utilities.css'
import styles from "./layout.module.css";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={"en"}>
      <head>
        <title>League of Statistics</title>
        <meta name="description" content="Statistics for LOL" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://use.typekit.net/pyd6byx.css"></link>
        <link rel="icon" href="/favicon.ico" />

      </head>
      <body className={styles.body + " " + openSans.className}>
        <div id="app"> {children}</div>
        <footer className={styles.footer}>
          League of Statistics was created under Riot Games {' '}
          <Link className={styles.a} href="https://www.riotgames.com/en/legal">
            Legal Jibber Jabber
          </Link> {' '}
          policy using assets owned by Riot Games. Riot Games does not endorse
          or sponsor this project.
        </footer>
      </body>
    </html>
  );
}
