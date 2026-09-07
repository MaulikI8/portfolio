import { useCall, CallType, IncomingCall } from '../contexts/CallContext';

export type { CallType, IncomingCall };

export function useWebRTC(_myRole?: string) {
  return useCall();
}
