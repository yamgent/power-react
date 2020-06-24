export interface Attribute {
  name: string
  type: string
}

const generateProps = (attributes?: Attribute[]): string => {
  if (!attributes || !attributes.length) {
    return '  // Insert your props here'
  }

  return attributes.map((attribute): string => `  ${attribute.name}: ${attribute.type}`).join('\n')
}

export const generateSource = (componentName: string, attributes?: Attribute[]) => {
  return `import * as React from 'react'
import * as styles from './index.scss'

interface Props {
${generateProps(attributes)}
}

const ${componentName} = (props: Props): JSX.Element => {
  return <div>${componentName}</div>
}

export default ${componentName}
`
}
