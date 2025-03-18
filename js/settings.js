// js/settings.js
const SETTINGS_KEY = 'cosy_tasks_settings';

const defaultSettings = {
    theme: 'default', // 'default', 'dark', 'custom'
    showNotifications: true,
    compactMode: false,
  rightToLeft: false,
    customFont: '', // URL to custom font
    // ... other settings
};
export function loadSettings() {
    let savedSettings = localStorage.getItem(SETTINGS_KEY);
    let settings = { ...defaultSettings }; // Start with defaults
    if (savedSettings) {
         try {
          settings = { ...settings, ...JSON.parse(savedSettings) };
        } catch (error) {
          console.error('Error parsing settings from localStorage:', error);
          // Handle the error, e.g., reset to default settings
          localStorage.removeItem(SETTINGS_KEY); // Remove corrupted settings
        }
    }

    // Apply settings (e.g., update CSS variables, set classes)
    applySettings(settings);
    return settings;
}

export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applySettings(settings);
}
function applySettings(settings) {
    const root = document.documentElement;

    if (settings.theme === 'dark') {
       root.style.setProperty('--background-color', '#333');
        root.style.setProperty('--text-color', '#f2f2f2');
        root.style.setProperty('--primary-color', '#555');
    } else if (settings.theme === 'custom') {
      // load custom colors if theme set to custom
    }
      else {
        // Reset to default theme
         root.style.setProperty('--background-color', '#f2f2f2');
        root.style.setProperty('--text-color', '#333');
        root.style.setProperty('--primary-color', '#e67e22');
    }

    if (settings.compactMode) {
        document.body.classList.add('compact-mode');
    } else {
        document.body.classList.remove('compact-mode');
    }
  if(settings.rightToLeft){
      document.body.dir = 'rtl';
    }
    else {
       document.body.dir = 'ltr';
    }

    // Apply other settings as needed
}
//Example usage (in app.js or a dedicated settings component)
const settings = loadSettings(); // Load on startup

const themeSelector = document.createElement('select');
themeSelector.innerHTML = `
  <option value="default">Default</option>
  <option value="dark">Dark</option>
  <option value="custom">Custom</option>
`;
themeSelector.value = settings.theme
themeSelector.addEventListener('change', () => {
  settings.theme = themeSelector.value;
  saveSettings(settings);
});

const compactModeCheckbox = document.createElement('input');
compactModeCheckbox.type = 'checkbox';
compactModeCheckbox.checked = settings.compactMode;
compactModeCheckbox.addEventListener('change', () => {
  settings.compactMode = compactModeCheckbox.checked;
   saveSettings(settings);
})
