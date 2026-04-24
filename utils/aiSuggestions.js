export const fetchAISuggestions = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 's1',
          title: 'DevTools AI',
          description: 'New coding assistant trending in your circle.',
          icon: 'code-slash'
        },
        {
          id: 's2',
          title: 'DesignVault',
          description: 'Curated assets for your next UI project.',
          icon: 'color-palette'
        }
      ]);
    }, 500); 
  });
};