import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default async function Icon() {
  const imagePath = join(process.cwd(), 'public', 'LOGO-DAIHOI-V.png')
  const imageData = readFileSync(imagePath)
  const base64Image = `data:image/png;base64,${imageData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          overflow: 'hidden',
        }}
      >
        <img
          src={base64Image}
          alt="Icon"
          style={{
            height: '125%',
            objectFit: 'cover',
            objectPosition: 'left center', 
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}