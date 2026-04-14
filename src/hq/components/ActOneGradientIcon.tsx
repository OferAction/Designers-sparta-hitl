import { useId } from 'react';

export default function ActOneGradientIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  const g0 = `ao-g0-${id}`;
  const g1 = `ao-g1-${id}`;
  const g2 = `ao-g2-${id}`;
  const g3 = `ao-g3-${id}`;

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M15.1777 16.8232V32.001H14.9316C14.606 32.0009 14.3131 31.8 14.1963 31.4961L10.3994 21.6016L0.504883 17.8047C0.200875 17.688 0.000200435 17.3949 0 17.0693V16.8232H15.1777Z" fill={`url(#${g0})`}/>
      <path d="M32 17.0693C31.9998 17.3949 31.7991 17.688 31.4951 17.8047L21.6006 21.6016L17.8037 31.4961C17.6869 31.8 17.394 32.001 17.0684 32.001H16.8232V16.8232H32V17.0693Z" fill={`url(#${g1})`}/>
      <path d="M17.0684 0C17.3942 0 17.687 0.201695 17.8037 0.505859L21.6006 10.4004L31.4951 14.1982C31.7991 14.3151 32 14.6069 32 14.9326V15.1777H16.8232V0H17.0684Z" fill={`url(#${g2})`}/>
      <path d="M15.1777 15.1777H0V14.9326C-3.88393e-09 14.6069 0.200873 14.3151 0.504883 14.1982L10.3994 10.4004L14.1963 0.505859C14.313 0.201723 14.6059 3.01757e-05 14.9316 0H15.1777V15.1777Z" fill={`url(#${g3})`}/>
      <defs>
        <linearGradient id={g0} x1="0" y1="0" x2="33.0427" y2="1.11555" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5EEAD4"/><stop offset="0.32" stopColor="#3B82F6"/><stop offset="0.66" stopColor="#A855F7"/><stop offset="1" stopColor="#F43F5E"/>
        </linearGradient>
        <linearGradient id={g1} x1="0" y1="0" x2="33.0427" y2="1.11555" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5EEAD4"/><stop offset="0.32" stopColor="#3B82F6"/><stop offset="0.66" stopColor="#A855F7"/><stop offset="1" stopColor="#F43F5E"/>
        </linearGradient>
        <linearGradient id={g2} x1="0" y1="0" x2="33.0427" y2="1.11555" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5EEAD4"/><stop offset="0.32" stopColor="#3B82F6"/><stop offset="0.66" stopColor="#A855F7"/><stop offset="1" stopColor="#F43F5E"/>
        </linearGradient>
        <linearGradient id={g3} x1="0" y1="0" x2="33.0427" y2="1.11555" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5EEAD4"/><stop offset="0.32" stopColor="#3B82F6"/><stop offset="0.66" stopColor="#A855F7"/><stop offset="1" stopColor="#F43F5E"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
