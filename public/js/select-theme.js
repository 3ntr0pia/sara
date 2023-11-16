document.addEventListener("DOMContentLoaded", function() {
    loadThemes();
});

function loadThemes() {
    fetch('/api/themes')
    .then(response => response.json())
    .then(themes => {
        const container = document.getElementById('theme-container');
        themes.forEach(theme => {
            // Crea un elemento para cada tema y añádelo al contenedor
            const themeElement = document.createElement('div');
            themeElement.textContent = theme;
            themeElement.onclick = () => selectTheme(theme);
            container.appendChild(themeElement);
        });
    });
}

function selectTheme(theme) {
    localStorage.setItem('selectedTheme', theme);
    window.location.href = '/test';
}