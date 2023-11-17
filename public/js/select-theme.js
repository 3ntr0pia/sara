document.addEventListener("DOMContentLoaded", function() {
    loadThemes();
});

function loadThemes() {
    fetch('/api/themes')
        .then(response => response.json())
        .then(themes => {
            const container = document.getElementById('theme-container');
            createThemeStructure(themes, container, 0, {});
        });
}

function createThemeStructure(themes, parentElement, indentLevel, path) {
    Object.keys(themes).forEach(key => {
        if (Array.isArray(themes[key])) {
            themes[key].forEach(filename => {
                const button = document.createElement('button');
                button.textContent = filename;
                button.style.marginLeft = `${indentLevel * 20}px`;
                button.dataset.assign = path.assign;
                button.dataset.theme = path.theme;
                button.dataset.test = filename.split('.')[0];
                button.onclick = () => selectTheme(button.dataset.assign, button.dataset.theme, button.dataset.test);
                parentElement.appendChild(button);
            });
        } else {
            const newPath = { ...path };
            if (indentLevel === 0) {
                newPath.assign = key; // asignatura
            } else {
                newPath.theme = key; // tema
            }

            const element = document.createElement('div');
            element.textContent = key;
            element.style.marginLeft = `${indentLevel * 20}px`;
            parentElement.appendChild(element);

            createThemeStructure(themes[key], parentElement, indentLevel + 1, newPath);
        }
    });
}


function selectTheme(assign, theme, test) {
	localStorage.setItem('selectedAssign', assign);
	localStorage.setItem('selectedTheme', theme);
	localStorage.setItem('selectedTest', test);
    window.location.href = '/test';
}