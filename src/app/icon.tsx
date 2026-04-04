import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: '#ff0033',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 8,
          border: '2px solid black',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="square"
          strokeLinejoin="miter"
        >
          <path d="M6 15H4a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2h2" />
          <path d="M18 9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
          <line x1="6" x2="18" y1="12" y2="12" />
          <line x1="10" x2="10" y1="9" y2="15" />
          <line x1="14" x2="14" y1="9" y2="15" />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}
