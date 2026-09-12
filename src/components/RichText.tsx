import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

/** Renders Lexical rich text from the CMS with the site's prose styles. */
export function RichText({ data, className = '' }: { data?: DefaultTypedEditorState | null; className?: string }) {
  if (!data || !data.root?.children?.length) return null
  return <LexicalRichText data={data} className={`u-prose ${className}`} />
}
