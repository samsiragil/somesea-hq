// Ikon garis 18 px dari desain "Somesea Peta Pelayaran". Semua dekoratif: label teks selalu menyertai.
type Props = { size?: number };
const line = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 18 18',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});
export const Overview = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <rect x="2.5" y="2.5" width="5.5" height="5.5" rx="1" />
    <rect x="10" y="2.5" width="5.5" height="5.5" rx="1" />
    <rect x="2.5" y="10" width="5.5" height="5.5" rx="1" />
    <rect x="10" y="10" width="5.5" height="5.5" rx="1" />
  </svg>
);
export const People = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <circle cx="7" cy="6" r="2.6" />
    <path d="M2.5 15c.6-2.6 2.3-4 4.5-4s3.9 1.4 4.5 4" />
    <circle cx="12.8" cy="6.6" r="2" />
    <path d="M12.5 10.8c1.7.1 2.9 1.3 3.3 3.4" />
  </svg>
);
export const Route = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <circle cx="3.5" cy="14.5" r="1.6" />
    <circle cx="14.5" cy="3.5" r="1.6" />
    <path d="M5 14.5h4.5a2.5 2.5 0 0 0 0-5h-1a2.5 2.5 0 0 1 0-5H13" strokeDasharray="2 2" />
  </svg>
);
export const Wallet = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <rect x="2.5" y="4.5" width="13" height="10" rx="2" />
    <path d="M2.5 7.5h13" />
    <circle cx="12.5" cy="11" r="0.9" fill="currentColor" />
  </svg>
);
export const Books = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <path d="M3 3.5h3v11H3zM7.5 3.5h3v11h-3z" />
    <path d="M12 4.4l2.6-.7 2 10.4-2.6.7z" />
  </svg>
);
export const Flag = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <path d="M4 16V2.5" />
    <path d="M4 3h9l-2 3 2 3H4" />
  </svg>
);
export const Toolbox = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <rect x="2.5" y="6" width="13" height="8.5" rx="1.5" />
    <path d="M6.5 6V4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6M2.5 10h13" />
  </svg>
);
export const Sync = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <path d="M14.5 7A6 6 0 0 0 4 5.2L2.8 6.5M3.5 11A6 6 0 0 0 14 12.8l1.2-1.3" />
    <path d="M2.8 3v3.5h3.5M15.2 15v-3.5h-3.5" />
  </svg>
);
export const SignOut = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <path d="M7 3.5H4.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H7M11 6l3 3-3 3M14 9H7" />
  </svg>
);
export const Plus = ({ size = 18 }: Props) => (
  <svg {...line(size)} strokeWidth={1.8}>
    <path d="M9 3.5v11M3.5 9h11" />
  </svg>
);
export const ArrowRight = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <path d="M3.5 9h11M10 4.5 14.5 9 10 13.5" />
  </svg>
);
export const ArrowUpRight = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <path d="M5 13 13 5M6.5 5H13v6.5" />
  </svg>
);
export const Menu = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <path d="M3 5h12M3 9h12M3 13h12" />
  </svg>
);
export const Close = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
  </svg>
);
export const Check = ({ size = 18 }: Props) => (
  <svg {...line(size)} strokeWidth={1.8}>
    <path d="M3.5 9.5 7.2 13 14.5 5" />
  </svg>
);
export const Download = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <path d="M9 2.5v9M5 8l4 4 4-4M3 15.5h12" />
  </svg>
);
export const Upload = ({ size = 18 }: Props) => (
  <svg {...line(size)}>
    <path d="M9 12V3M5 6.5 9 2.5l4 4M3 15.5h12" />
  </svg>
);
/** Mawar angin: jarum utara berwarna sinyal. */
export const Compass = ({ size = 36 }: Props) => (
  <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" className="compass">
    <circle
      cx="18"
      cy="18"
      r="16"
      fill="none"
      stroke="currentColor"
      strokeOpacity="0.35"
      strokeWidth="1.5"
    />
    <path d="M18 5 L22.5 18 L13.5 18 Z" className="compass-north" />
    <path d="M18 31 L13.5 18 L22.5 18 Z" fill="currentColor" fillOpacity="0.55" />
    <circle cx="18" cy="18" r="2" fill="currentColor" />
  </svg>
);
export const Ship = ({ size = 28 }: Props) => (
  <svg width={size} height={(size * 22) / 28} viewBox="0 0 28 22" aria-hidden="true">
    <path d="M13 1 L13 15 L5 15 Z" fill="currentColor" />
    <path d="M15 4 L15 15 L22 15 Z" fill="currentColor" fillOpacity="0.6" />
    <path d="M2 17 H26 L22 21.5 H6 Z" fill="currentColor" />
  </svg>
);
/** Kapal di dermaga, ilustrasi keadaan kosong. */
export const Harbor = () => (
  <svg
    width="132"
    height="68"
    viewBox="0 0 132 68"
    fill="none"
    aria-hidden="true"
    className="harbor"
  >
    <path
      d="M8 40h42M15 40v20M43 40v20"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path d="M50 41c7 5 14 5 22 2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
    <path
      d="M90 12v28M90 14l13 24H90z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M72 42h40l-6 9H78z" fill="currentColor" />
    <path
      d="M4 62c7-4 14-4 21 0s14 4 21 0 14-4 21 0 14 4 21 0 14-4 21 0 14 4 21 0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeOpacity="0.5"
    />
  </svg>
);
