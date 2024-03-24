import { useWindowScroll } from '@uidotdev/usehooks'

function useIsWindowScrolled() {
  const scrollY = useWindowScroll()[0].y ?? 0

  return scrollY > 64 // The height of the header
}

export { useIsWindowScrolled }
