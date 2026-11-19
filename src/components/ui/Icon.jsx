// Single-stroke line icons (24×24 grid, currentColor) — one consistent set for
// all UI chrome. Content glyphs inside notes are untouched.
const P = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  camera: <><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.5" /></>,
  undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  sparkles: <><path d="M12 3.5 13.8 9 19.5 11 13.8 13 12 18.5 10.2 13 4.5 11 10.2 9Z" /><path d="M19 3v3M17.5 4.5h3M5 17v3M3.5 18.5h3" /></>,
  download: <><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>,
  printer: <><path d="M7 9V4h10v5" /><rect x="3.5" y="9" width="17" height="8" rx="1.5" /><path d="M7 14h10v6H7z" /></>,
  star: <path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8Z" />,
  pencil: <><path d="M15.5 4.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /><path d="m13.5 6.5 3 3" /></>,
  trash: <><path d="M4 7h16" /><path d="M9.5 7V4.5h5V7" /><path d="M6.5 7l.8 12.5h9.4L17.5 7" /><path d="M10 11v5M14 11v5" /></>,
  arrowUp: <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
  arrowDown: <><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></>,
  arrowRight: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  more: <><circle cx="5.5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="18.5" cy="12" r="1.2" fill="currentColor" /></>,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  home: <><path d="M4 11 12 4l8 7" /><path d="M6 9.5V20h12V9.5" /><path d="M10 20v-5h4v5" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 18 5-5 3.5 3.5L16 13l4.5 4.5" /></>,
  table: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10" /></>,
  code: <><path d="m8.5 7-5 5 5 5" /><path d="m15.5 7 5 5-5 5" /></>,
  diff: <><rect x="3.5" y="4.5" width="7.5" height="15" rx="1.5" /><rect x="13" y="4.5" width="7.5" height="15" rx="1.5" /><path d="M6 12h2.5M15.5 12h3M17 10.5v3" /></>,
  sigma: <path d="M17.5 5.5h-11l6 6.5-6 6.5h11" />,
  todo: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><path d="m8 12.3 2.7 2.7L16 9.5" /></>,
  paragraph: <><path d="M13 4.5v15M17 4.5v15" /><path d="M19 4.5h-9.5a4 4 0 0 0 0 8H13" /></>,
  file: <><path d="M6 3.5h8l4.5 4.5v12.5H6Z" /><path d="M14 3.5V8h4.5" /></>,
  files: <><path d="M8.5 6.5V3.5h7l4 4v10h-3" /><path d="M4.5 6.5h8l3 3v11h-11Z" /></>,
  books: <><path d="M4.5 4.5h4v15h-4zM8.5 4.5h4v15h-4z" /><path d="m13.5 5.6 3.8-1 3.7 14.4-3.8 1Z" /></>,
  book: <><path d="M5 4.5h11.5a1.5 1.5 0 0 1 1.5 1.5v14H6.5A1.5 1.5 0 0 1 5 18.5Z" /><path d="M5 17.5a1.5 1.5 0 0 1 1.5-1.5H18" /></>,
  folder: <path d="M3.5 7a1.5 1.5 0 0 1 1.5-1.5h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5Z" />,
  paperclip: <path d="m19 11.5-7.2 7.2a4.5 4.5 0 0 1-6.4-6.4l7.5-7.5a3 3 0 0 1 4.3 4.3l-7.5 7.5a1.5 1.5 0 0 1-2.1-2.1l6.9-6.9" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></>,
  moon: <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z" />,
  monitor: <><rect x="3.5" y="4.5" width="17" height="11.5" rx="1.5" /><path d="M9 20h6M12 16v4" /></>,
  alert: <><path d="M12 4 21 19.5H3Z" /><path d="M12 10v4M12 16.8v.2" /></>,
  cloud: <path d="M7.5 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.6 3.8 3.8 0 0 1-.8 7.4Z" />,
  cloudCheck: <><path d="M7.5 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.6 3.8 3.8 0 0 1-.8 7.4Z" /><path d="m9.5 13.5 2 2 3.5-3.5" /></>,
  sidebar: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M9.5 4.5v15" /></>,
  palette: <><path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.5-1-2.6 0-.9.7-1.6 1.7-1.6h2a4 4 0 0 0 4-4C20.5 6.8 16.7 3.5 12 3.5Z" /><circle cx="7.5" cy="11.5" r="1" fill="currentColor" /><circle cx="10.5" cy="7.5" r="1" fill="currentColor" /><circle cx="15" cy="7.8" r="1" fill="currentColor" /></>,
  duplicate: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M5.5 15.5h-1v-11h11v1" /></>,
  bold: <path d="M7 4.5h6a3.8 3.8 0 0 1 0 7.5H7Zm0 7.5h7a3.8 3.8 0 0 1 0 7.5H7Z" />,
  italic: <path d="M14.5 4.5h-4M13.5 19.5h-4M14 4.5l-4 15" />,
  highlighter: <><path d="m9 15 7.5-10.5 3.5 2.5L12.5 17.5Z" /><path d="M9 15 7 18.5h4l1.5-1" /><path d="M4 21h16" /></>,
  list: <><path d="M9 7h11M9 12h11M9 17h11" /><circle cx="5" cy="7" r="1" fill="currentColor" /><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="5" cy="17" r="1" fill="currentColor" /></>,
  wikilink: <><path d="M8 4.5H5v15h3M16 4.5h3v15h-3" /><path d="M10 12h4" /></>,
  enter: <><path d="M19 5v6a3 3 0 0 1-3 3H5" /><path d="m9 10-4 4 4 4" /></>,
  upload: <><path d="M12 16V5" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
  grip: <><circle cx="9" cy="6" r="1.1" fill="currentColor" /><circle cx="15" cy="6" r="1.1" fill="currentColor" /><circle cx="9" cy="12" r="1.1" fill="currentColor" /><circle cx="15" cy="12" r="1.1" fill="currentColor" /><circle cx="9" cy="18" r="1.1" fill="currentColor" /><circle cx="15" cy="18" r="1.1" fill="currentColor" /></>,
}


export default function Icon({ name, size = 16, strokeWidth = 1.75, className = '', style, title }) {
  const paths = P[name]
  if (!paths) return null
  return (
    <svg
      className={`ic ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      style={style}
    >
      {title && <title>{title}</title>}
      {paths}
    </svg>
  )
}
