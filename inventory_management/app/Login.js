/*'use client';
import { signIn } from 'next-auth/react';

export default function Login() {
  return (
    <button onClick={() => signIn('google')}>Login</button>
  )
}*/
/*
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google');
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleSignIn} disabled={loading}>
      {loading ? 'Loading...' : 'Login with Google'}
    </button>
  );
}*/
'use client';

import { signIn } from 'next-auth/react';
import { useEffect } from 'react';

export default function Login() {
  useEffect(() => {
    const welcomeText = document.getElementById('welcome-text');
    if (welcomeText) {
      welcomeText.classList.add('slide-in');
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f4', padding: '20px' }}>
      <div id="welcome-text" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontWeight: 'bold', marginBottom: '15px' }}>Welcome to <strong>Pantry Wizard</strong></h1>
        <p style={{ fontStyle: 'italic', marginBottom: '15px' }}>we turn your food chaos into recipe magic!</p>
        <p style={{ marginBottom: '20px' }}>Track your stock, manage your pantry, and discover delicious dishes with just a few clicks. Let’s get cooking!</p>
      </div>
      <button
        onClick={() => signIn('google')}
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
        Sign In With Google
      </button>

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
      `}</style>
    </div>
  );
}
/*
'use client';
import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '@/firebase';

import  Home  from "./page";

export default function Login() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() =>  {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) =>  {
      if (user) {
        setUser(user);
      }else {
        setUser(null);
      }
    });

    return() => unsubscribe();
  }, []);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/page');  // Update the route if needed
        setUser(user);
      }else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router]);


  const signInWithGoogle = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/page");
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
    }
  };

  return(
<div className="flex flex-col items-center justify-center h-screen bg-white">
      {user ? (
        <Home />
      ) : (
        <button 
          onClick={signInWithGoogle}
          className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
        >
          Sign In With Google
        </button> 
      )}
    </div>
  );
}*/
