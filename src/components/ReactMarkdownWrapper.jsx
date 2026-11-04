import React from 'react'
import ReactMarkdown from 'react-markdown'

import Typography from 'cozy-ui/transpiled/react/Typography'

import styles from '@/styles/index.styl'

const LinkRenderer = props => (
  <a
    href={props.href}
    target="_blank"
    rel="noopener noreferrer"
    className={styles['set-markdown-link']}
  >
    {props.children}
  </a>
)

const ParagraphRenderer = ({ children }) => {
  return (
    <Typography variant="body1" className="u-mv-half">
      {children}
    </Typography>
  )
}

const reactMarkdownComponents = {
  a: LinkRenderer,
  p: ParagraphRenderer
}

const ReactMarkdownWrapper = ({ source }) => (
  <ReactMarkdown components={reactMarkdownComponents}>{source}</ReactMarkdown>
)

export default ReactMarkdownWrapper
