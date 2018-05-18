type Props = {
  cond: boolean
  children: () => JSX.Element | null,
}

export default function If(props: Props): JSX.Element | null {
  return props.cond ? props.children() : null
}
