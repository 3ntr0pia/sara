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
	const assign = localStorage.getItem('selectedAssign'); 
    const theme = localStorage.getItem('selectedTheme'); 
	const test = localStorage.getItem('selectedTest'); 
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
        questionElement.innerHTML = `<h3 class="text-info mt-4">Pregunta ${index + 1}: ${question.question}</h3>`;

        question.answers.forEach(answer => {
			const input = document.createElement('input');
			input.type = question.questionType.toLowerCase() === 'selection' ? 'radio' : 'checkbox';
			input.name = `question-${index}`;
			input.value = answer;
		
			input.addEventListener('change', () => handleAnswer(input, question, index));
		
			const label = document.createElement('label');
			label.appendChild(input);
			label.append(answer);
			label.classList.add('my-3')
		
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

    blockAndColorAnswers(question, questionIndex, isCorrect);

    if (isCorrect) {
        correctAnswers++;
    }

    updateProgress();
}

function blockAndColorAnswers(question, questionIndex, isCorrect) {
    const inputs = document.querySelectorAll(`input[name="question-${questionIndex}"]`);

    inputs.forEach(input => {
        input.disabled = true; 

        if (input.value === question.questionCorrectAnswer) {
            input.parentElement.style.color = 'green';
        } else if (!isCorrect) {
            input.parentElement.style.color = 'red';
        }
    });
}

function updateAnswerStyle(input, isCorrect) {
    const label = input.nextElementSibling;
    if (label) {
        label.style.color = isCorrect ? 'green' : 'red';
    }
}

function updateProgress() {
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

		progress = document.getElementById('progress');
		progress.innerText = `Aciertos: ${correctAnswers}. Contestadas: ${answeredQuestions}`;
	})
	.catch(err => {
		console.error(err);
	});
}