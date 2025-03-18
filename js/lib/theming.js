// js/lib/theming.js

export function applyCustomTheme(primaryColor, secondaryColor, backgroundColor, textColor) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--secondary-color', secondaryColor);
    root.style.setProperty('--background-color', backgroundColor);
    root.style.setProperty('--text-color', textColor);
    // Update any other relevant CSS variables
}

// Example usage (within a settings component)
const colorInputs = document.querySelectorAll('.color-input'); // Assuming you have color input fields

colorInputs.forEach(input => {
  input.addEventListener('change', () => {
    const primary = document.querySelector('#primary-color').value;
    const secondary = document.querySelector('#secondary-color').value;
    const background = document.querySelector('#background-color').value;
    const text = document.querySelector('#text-color').value;

    applyCustomTheme(primary, secondary, background, text);

    // Save custom theme to localStorage
        const settings = loadSettings(); // From settings.js
        settings.theme = 'custom';
        settings.customColors = { primary, secondary, background, text };
        saveSettings(settings);
  });
});
