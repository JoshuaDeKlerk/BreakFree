import { createNavigationContainerRef } from '@react-navigation/native';

export const navRef = createNavigationContainerRef();

export function goTo(name: string, params?: object) {
  if (navRef.isReady()) {
    // @ts-expect-error: name is a registered route
    navRef.navigate(name, params);
  }
}
