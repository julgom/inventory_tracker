'use client';
import { Session } from 'next-auth';
import { SessionProvider as Provider } from 'next-auth/react';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Session|null} props.session
 * @returns {JSX.Element}
 */
export default function SessionProvider({ children, session }) {
  return (
    <Provider session={session}>
      {children}
    </Provider>
  );
}
