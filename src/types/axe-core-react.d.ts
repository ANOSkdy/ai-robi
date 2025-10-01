declare module "@axe-core/react" {
  type AxeInit = (react: unknown, reactDom: unknown, timeout?: number) => void;
  const axe: AxeInit;
  export default axe;
}
