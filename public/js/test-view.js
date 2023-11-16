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
    const theme = localStorage.getItem('selectedTheme'); // Asume que el tema se guarda en localStorage
    fetch(`/api/tests/${theme}`) // Asegúrate de que esta ruta del backend esté implementada
        .then(response => response.json())
        .then(test => displayTest(test));
}

function displayTest(test) {
    const container = document.getElementById('test-container');
    test.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.innerHTML = `<h3>Pregunta ${index + 1}: ${question.question}</h3>`;

        question.answers.forEach(answer => {
			const questionType = question.questionType.toLowerCase();
			console.log(questionType);
			if (questionType === 'selection') {
				questionElement.innerHTML += `
					<label><input type="radio" name="question-${index}" value="${answer}">${answer}</label>
					</br>
				`;
			}
			else {
				questionElement.innerHTML += `
					<input type="checkbox" name="question-${index}" value="${answer}">
					<label>${answer}</label>
					</br>
				`;
			}
        });

        container.appendChild(questionElement);

		const inputs = container.querySelectorAll(`input[name="question-${index}"]`);
        inputs.forEach(input => {
            input.addEventListener('change', () => handleAnswer(input, question, index));
        });
    });
	// add submit button
	const submitButton = document.createElement('button');
	submitButton.id = 'submit-button';
	submitButton.type = 'submit';
	submitButton.innerText = 'Validar respuestas';
	// if submit button is clicked then check answers
	submitButton.addEventListener('click', function() {
		// get the answers and check them against the correct answers
		const answers = document.querySelectorAll('input:checked');
		let correctAnswers = 0;
		for (let i = 0; i < answers.length; i++) {
			const questionNumber = answers[i].name.split('-')[1];
			const question = test[questionNumber];
			const correctAnswer = question.questionCorrectAnswer;
			if (answers[i].value === correctAnswer) {
				correctAnswers++;
			}
		}

		let results = document.createElement('div');
		results.id = 'results';
		results.innerText = `Has acertado ${correctAnswers} preguntas de ${test.length}`;
		let body = document.querySelector('body');
		body.appendChild(results);
	});

	container.appendChild(submitButton);
}

function handleAnswer(input, question, questionIndex) {
    answeredQuestions++;
    if (input.value === question.questionCorrectAnswer) {
        correctAnswers++;
    }
    updateProgress();
}

function updateProgress() {
    // Aquí actualizas la interfaz con los aciertos y el progreso
    const progressElement = document.getElementById('progress');
    if (progressElement) {
        progressElement.textContent = `Aciertos: ${correctAnswers}. Contestadas: ${answeredQuestions}`;
    } else {
        const newProgressElement = document.createElement('div');
        newProgressElement.id = 'progress';
        newProgressElement.textContent = `Aciertos: ${correctAnswers}. Contestadas: ${answeredQuestions}`;
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