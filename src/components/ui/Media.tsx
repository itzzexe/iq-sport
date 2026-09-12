import Image from 'next/image'
import { isMedia, mediaAlt, mediaDims, mediaPosition, mediaUrl, type MediaRef, type MediaSize } from '@/lib/media'

type Props = {
  media: MediaRef
  /** which pre-generated size to start from (next/image still resizes on demand) */
  size?: MediaSize
  alt?: string
  className?: string
  imgClassName?: string
  sizes?: string
  priority?: boolean
  /** cover the parent box (parent must be positioned) */
  fill?: boolean
  fallbackSrc?: string
}

/**
 * Renders a CMS upload through next/image: correct intrinsic size (no layout
 * shift), responsive `sizes`, lazy by default, focal point honoured.
 */
export function Media({
  media,
  size = 'wide',
  alt,
  className = '',
  imgClassName = '',
  sizes = '100vw',
  priority = false,
  fill = false,
  fallbackSrc,
}: Props) {
  const src = mediaUrl(media, size) ?? fallbackSrc
  if (!src) return null
  const { width, height } = mediaDims(media, size)
  const resolvedAlt = alt ?? mediaAlt(media)
  const objectPosition = mediaPosition(media)

  if (fill) {
    return (
      <Image
        src={src}
        alt={resolvedAlt}
        fill
        sizes={sizes}
        priority={priority}
        fetchPriority={priority ? 'high' : undefined}
        className={`object-cover ${imgClassName}`}
        style={{ objectPosition }}
        unoptimized={!isMedia(media)}
      />
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={resolvedAlt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={`h-full w-full object-cover ${imgClassName}`}
        style={{ objectPosition }}
        unoptimized={!isMedia(media)}
      />
    </div>
  )
}
