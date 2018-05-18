declare module 'shallowequal' {
  interface Customizer {
    (a: any, b: any): boolean
  }
  export default function shallowequal<T, U>(a: T, b: U, customizer?: Customizer): boolean
}