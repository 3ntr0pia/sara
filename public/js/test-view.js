let correctAnswers = 0;
let answeredQuestions = 0;
let startTime;
let timerInterval;

document.addEventListener("DOMContentLoaded", function() {
    loadTest();
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
	document.getElementById('submit-test').addEventListener('click', submitTest);
});

function loadTest() {
	const assign = localStorage.getItem('selectedAssign'); // Asume que la asignatura se guarda en localStorage
    const theme = localStorage.getItem('selectedTheme'); // Asume que el tema se guarda en localStorage
	const test = localStorage.getItem('selectedTest'); // Asume que el test se guarda en localStorage
    fetch(`/api/tests/${assign}/${theme}/${test}`)
        .then(response => response.json())
        .then(test => {
            console.log("Datos cargados del JSON:", test);
            displayTest(test);
        });
}




function displayTest(test) {
    const container = document.getElementById('test-container');
    test.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.innerHTML = `<h3>Pregunta ${index + 1}: ${question.question}</h3>`;

        question.answers.forEach(answer => {
			const input = document.createElement('input');
			input.type = question.questionType.toLowerCase() === 'selection' ? 'radio' : 'checkbox';
			input.name = `question-${index}`;
			input.value = answer;
		
			// Añadir el evento de escucha
			input.addEventListener('change', () => handleAnswer(input, question, index));
		
			const label = document.createElement('label');
			label.appendChild(input);
			label.append(answer);
		
			questionElement.appendChild(label);
			questionElement.appendChild(document.createElement('br'));
		});
		

        container.appendChild(questionElement);
    });
}

function handleAnswer(input, question, questionIndex) {
    console.log("Objeto pregunta recibido en handleAnswer:", question);

    answeredQuestions++;
    let isCorrect = input.value === question.questionCorrectAnswer;

    // Añadir aquí la lógica para cambiar de color
    if (isCorrect) {
        correctAnswers++;
        input.parentElement.style.color = 'green'; // Cambia el color a verde si la respuesta es correcta
    } else {
        input.parentElement.style.color = 'red'; // Cambia el color a rojo si la respuesta es incorrecta
    }

    updateProgress();
}


function updateAnswerStyle(input, isCorrect) {
    const label = input.nextElementSibling;
    if (label) {
        label.style.color = isCorrect ? 'green' : 'red';
    }
}

function updateProgress() {
    // Aquí actualizas la interfaz con los aciertos y el progreso
    const progressElement = document.getElementById('progress');
    if (progressElement) {
        progressElement.textContent = `Aciertos: ${correctAnswers}.`;
    } else {
        const newProgressElement = document.createElement('div');
        newProgressElement.id = 'progress';
        newProgressElement.textContent = `Aciertos: ${correctAnswers}. `;
        document.body.appendChild(newProgressElement);
    }
}

function updateTimer() {
    const currentTime = new Date();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = `Tiempo: ${elapsedTime} segundos`;
    } else {
        const newTimerElement = document.createElement('div');
        newTimerElement.id = 'timer';
        newTimerElement.textContent = `Tiempo: ${elapsedTime} segundos`;
        document.body.appendChild(newTimerElement);
    }
}

function submitTest() {
    const inputs = document.querySelectorAll('#test-container input');
    const userAnswers = Array.from(inputs).reduce((acc, input) => {
        if (input.checked) {
            const questionNumber = input.name.split('-')[1];
            acc[questionNumber] = input.value;
        }
        return acc;
    }, {});
    clearInterval(timerInterval);
    displaySummary(userAnswers);
}

function displaySummary(userAnswers) {
	let correctAnswers = 0;
	const theme = localStorage.getItem('selectedTheme');
	fetch(`/api/tests/${theme}/correction`)
	.then(response => response.json())
	.then(questions => {
		questions.forEach((question, index) => {
			const questionNumber = index;
			const correctAnswer = question.questionCorrectAnswer;
			const userAnswer = userAnswers[questionNumber];

			console.log(`correctAnswer: ${correctAnswer}`);
			console.log(`userAnswer: ${userAnswer}`);
			if (userAnswer === correctAnswer) {
				correctAnswers++;
			}

		});

		// muestra el resultado actualizado progress 
		progress = document.getElementById('progress');
		progress.innerText = `Aciertos: ${correctAnswers}. Contestadas: ${answeredQuestions}`;
	})
	.catch(err => {
		console.error(err);
	});
}