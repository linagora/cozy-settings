// TODO: eslint-disable should be removed and fixed
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
declare module 'cozy-ui/transpiled/react/List' {
  import List from '@material-ui/core/List'
  export default List
}

declare module 'cozy-ui/transpiled/react/ListSubheader' {
  import ListSubheader from '@material-ui/core/ListSubheader'
  export default ListSubheader
}

declare module 'cozy-ui/transpiled/react/Divider' {
  import Divider from '@material-ui/core/Divider'
  export default Divider
}

declare module 'cozy-ui/transpiled/react/ListItem' {
  import ListItem from '@material-ui/core/ListItem'
  export default ListItem as ListItem & { ellipsis: boolean }
}

declare module 'cozy-ui/transpiled/react/ListItemIcon' {
  import ListItemIcon from '@material-ui/core/ListItemIcon'
  export default ListItemIcon as ListItemIcon & { align: string }
}

declare module 'cozy-ui/transpiled/react/ListItemText' {
  import ListItemText from '@material-ui/core/ListItemText'
  export default ListItemText as ListItemText & { align: string }
}

declare module 'cozy-ui/transpiled/react/Icon' {
  interface IconProps {
    icon:
      | string
      | object
      | ((args: unknown) => React.ReactNode)
      | JSX.Element
      | (() => JSX.Element)
    width?: string | number
    height?: string | number
    color?: string | object
    className?: string
    preserveColor?: boolean
    size?: string | number
    spin?: boolean
    style?: Record<string, string>
  }

  export default function Icon(props: IconProps): JSX.Element
}

declare module 'cozy-ui/transpiled/react/Icons/*' {
  export default (): JSX.Element => element as JSX.Element
}

declare module 'twake-i18n' {
  const useI18n = (): {
    t: (key: string, vars?: Record<string, unknown>) => string
  } => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      t: (key: string) => string as string
    }
  }

  export { useI18n }
}

declare module 'cozy-ui/transpiled/react/Switch' {
  import Switch from '@material-ui/core/Switch'
  export default Switch
}

declare module 'cozy-ui/transpiled/react/TextField' {
  import TextField from '@material-ui/core/TextField'
  export default TextField
}

declare module 'cozy-ui/transpiled/react/deprecated/Button'
declare module 'cozy-ui/transpiled/react/Buttons'
declare module 'cozy-ui/transpiled/react/Typography'
declare module 'cozy-ui/transpiled/react/CozyDialogs'

declare module 'cozy-ui/transpiled/react/providers/Breakpoints' {
  export default function useBreakpoints(): {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
  }
}
