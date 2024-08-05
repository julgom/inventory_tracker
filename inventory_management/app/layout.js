/*import { authOptions } from '../pages/api/auth/[...nextauth].js';
import { getServerSession } from 'next-auth'
import './globals.css'
import { Inter } from 'next/font/google'
import SessionProvider from './SessionProvider';
import Login from './Login';
import Home from './page';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({ 
  children,
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {!session ? (
            <Login />
          ) : (
            <Home />
          )}
        </SessionProvider>
      </body>
    </html>
  );
}*/
"use client"; 
import {Inter} from "next/font/google"
import "./globals.css"
import { ClerkProvider, SignedIn, SignedOut, SignIn, UserButton, SignInButton, useUser } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] })


function Header() {
  const { user } = useUser();
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'black',
      color: 'white',
      padding: '20px 40px',  // Increased padding for more vertical space
      height: '80px',        // Increased height for the header
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'  // Optional: adds a shadow for depth
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
      Hi, {user.firstName}
      </div>
      <UserButton />
    </header>
  );
}


     
    

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <main>
            <SignedOut>
              <div className="center-container slide-in">
                <h1 style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                  Welcome to <strong>Pantry Wizard</strong>
                </h1>
                <p style={{ fontStyle: 'italic', marginBottom: '15px' }}>
                  We turn your food chaos into recipe magic!
                </p>
                <p style={{ marginBottom: '20px' }}>
                  Track your stock, manage your pantry, and discover delicious dishes with just a few clicks. Let’s get cooking!
                </p>
                <SignInButton>
                  <button
                    style={{
                      backgroundColor: 'black',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '10px 20px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'black'}
                  >
                    Sign In
                  </button>
                </SignInButton>
              </div>
              <style jsx>{`
                @keyframes slideIn {
                  from {
                    transform: translateY(100%);
                    opacity: 0;
                  }
                  to {
                    transform: translateY(0);
                    opacity: 1;
                  }
                }

                .slide-in {
                  animation: slideIn 0.6s ease-out;
                }

                .center-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  text-align: center;
                }
              `}</style>
            </SignedOut>
            <SignedIn>
              <Header />
              {children}
            </SignedIn>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
