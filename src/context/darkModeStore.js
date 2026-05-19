import { create } from 'zustand';

const useDarkMode = create((set) => ({
  isDark: localStorage.getItem('kb_dark_mode') === 'true',
  toggle: () =>
    set((state) => {
      const newVal = !state.isDark;
      localStorage.setItem('kb_dark_mode', newVal);
      if (newVal) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDark: newVal };
    }),
  init: () => {
    const isDark = localStorage.getItem('kb_dark_mode') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    return isDark;
  },
}));

export default useDarkMode;