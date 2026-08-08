export const SCROLL_TARGETS = {
  HERO: 'hero',
  SYMPTOM_CHECKER: 'symptom-checker',
};

export const scrollToSection = (target) => {
  if (!target || typeof window === 'undefined') {
    return;
  }

  const element = document.getElementById(target);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }
};

export const createHomeNavigation = (navigate, target) => {
  navigate('/', {
    state: {
      scrollTo: target,
    },
  });
};
