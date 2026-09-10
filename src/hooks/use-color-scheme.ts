import { useAppContext } from '@/contexts/app-context';

export function useColorScheme() {
  const { theme } = useAppContext();
  return theme;
}
