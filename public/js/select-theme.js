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
                button.classList.add('btn')
                button.classList.add('btn-danger')
                button.classList.add('my-2')
                button.textContent = filename;  
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
            if(indentLevel === 0){
                element.classList.add('text-danger')
                element.classList.add('text-uppercase')
                element.classList.add('fs-3')
                element.classList.add('fw-bold')
            }
            if(indentLevel > 0) {
                element.classList.add('fs-5')
                element.classList.add('fw-bold')
                
            }
            
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