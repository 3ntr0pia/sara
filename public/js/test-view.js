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
    const theme = localStorage.getItem('selectedTheme');
    fetch(`/api/tests/${theme}`)
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
        questionElement.classList.add('question');

        const questionTitle = document.createElement('h3');
        questionTitle.className = 'text-info text-center';
        questionTitle.textContent = `Pregunta ${index + 1}: ${question.question}`;
        questionElement.appendChild(questionTitle);

        question.answers.forEach(answer => {
            const wrapper = document.createElement('div');
            wrapper.className = 'form-check'; // Clase de Bootstrap para inputs

            const answerInput = document.createElement('input');
            answerInput.className = 'form-check-input'; // Clase de Bootstrap
            answerInput.type = question.questionType.toLowerCase() === 'selection' ? 'radio' : 'checkbox';
            answerInput.name = `question-${index}`;
            answerInput.value = answer;
            answerInput.id = `question-${index}-answer-${answer}`;

            const answerLabel = document.createElement('label');
            answerLabel.className = 'form-check-label'; // Clase de Bootstrap
            answerLabel.htmlFor = answerInput.id;
            answerLabel.textContent = answer;

            wrapper.appendChild(answerInput);
            wrapper.appendChild(answerLabel);

            questionElement.appendChild(wrapper);

            answerInput.addEventListener('change', () => handleAnswer(answerInput, question, index));
        });

        container.appendChild(questionElement);
    });
}

function handleAnswer(input, question, questionIndex) {
    console.log("Objeto pregunta recibido en handleAnswer:", question);

    answeredQuestions++;
    let isCorrect = input.value === question.questionCorrectAnswer;

    if (isCorrect) {
        correctAnswers++;
        updateAnswerStyle(input, true); // Respuesta correcta, estilo verde
    } else {
        updateAnswerStyle(input, false); // Respuesta incorrecta, estilo rojo
    }

    updateProgress();
}

function updateAnswerStyle(input, isCorrect) {
    // Cambiar el color de la etiqueta asociada
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
        newProgressElement.textContent = `Aciertos: ${correctAnswers}.`;
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