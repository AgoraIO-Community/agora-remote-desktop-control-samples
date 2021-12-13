import React, { FC, useMemo } from 'react';
import { useAsync } from 'react-use';
import { fetchSession } from '../../api';
import { SessionContext } from './context';

export interface SessionProviderProps {
  userId: string;
}

export const SessionProvider: FC<SessionProviderProps> = ({ userId, children }) => {
  const asyncState = useAsync(() => fetchSession(userId), [userId]);
  const session = useMemo(() => asyncState.value?.data, [asyncState]);
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
};
