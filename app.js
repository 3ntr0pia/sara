const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Configuración de Multer para la carga de archivos
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, 'uploads'),
	filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage: storage });
app.use(express.static('public'));


app.get('/upload', (req, res) => {
	res.sendFile(__dirname + '/public/views/admin/upload.html');
});

// Ruta para cargar archivos
app.post('/api/upload', upload.single('file'), (req, res) => {
	const filePath = path.join(__dirname, 'uploads', req.file.filename);
	console.log(filePath);

	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error leyendo el archivo:', err);
			return res.status(500).send('Error al procesar el archivo');
		}

		const testStructure = processTestFile(data);
		// guardar el archivo en uploads con estructura json y .json
		const jsonFile = path.join(__dirname, 'uploads', req.file.filename.replace('.txt', '.json'));
		console.log(jsonFile);
		// delete txt 
		fs.unlink(filePath, (err) => {
			if (err) {
				console.error('Error eliminando el archivo:', err);
				return res.status(500).send('Error al procesar el archivo');
			}
		});

		fs.writeFile(jsonFile, JSON.stringify(testStructure), (err) => {
			if (err) {
				console.error('Error escribiendo el archivo:', err);
				return res.status(500).send('Error al procesar el archivo');
			}
		});

		res.send('Archivo procesado con éxito');
	});
});

function processTestFile(content) {
	const questionsArray = content.split('\nPregunta').filter(q => q.trim());

	return questionsArray.map(questionText => {
		// Añade 'Pregunta' al inicio de cada pregunta, excepto la primera
		if (!questionText.startsWith('Pregunta')) {
			questionText = 'Pregunta' + questionText;
		}

		const lines = questionText.split('\n').filter(line => line.trim());

		// Extrae la pregunta
		const question = lines[0].split(': ')[1].trim();

		// Extrae el tipo de pregunta
		const questionType = lines[1].split('* Tipo: ')[1].trim();

		// Extrae las respuestas y determina cuál es la correcta
		const answerLines = lines.slice(2);
		const answers = answerLines.map(line => line.replace(/^-\sRespuesta\s[A-Z]:\s/, '').trim());
		const correctAnswer = answers.find(answer => answer.includes('(Correcta)'));
		const cleanedCorrectAnswer = correctAnswer ? correctAnswer.replace(' (Correcta)', '').trim() : '';

		// Limpia la indicación de '(Correcta)' de las respuestas
		const cleanedAnswers = answers.map(answer => answer.replace(/ \(Correcta\)/, ''));

		return {
			question: question,
			questionType: questionType,
			questionCorrectAnswer: cleanedCorrectAnswer,
			answers: cleanedAnswers
		};
	});
}

app.get('/api/themes', (req, res) => {
	const uploadsDir = path.join(__dirname, 'uploads');

	fs.readdir(uploadsDir, (err, files) => {
		if (err) {
			console.error('Error al listar archivos:', err);
			return res.status(500).send('Error al obtener temas');
		}

		const themes = files.map(file => path.basename(file, path.extname(file)));
		res.json(themes);
	});
});


app.get('/admin', (req, res) => {
	res.sendFile(__dirname + '/public/views/admin/index.html');
});

app.get('/list', (req, res) => {
	res.sendFile(__dirname + '/public/views/admin/list.html');
});

app.post('/api/list', (req, res) => {
	const uploadsDir = path.join(__dirname, 'uploads');

	fs.readdir(uploadsDir, (err, files) => {
		if (err) {
			console.error('Error al listar archivos:', err);
			return res.status(500).send('Error al obtener temas');
		}

		const themes = files.map(file => path.basename(file, path.extname(file)));
		res.json(themes);
	});
});

app.get('/test', (req, res) => {
	res.sendFile(__dirname + '/public/views/test.html');
});

let questions = [];
app.get('/api/tests/:theme', (req, res) => {
	const theme = req.params.theme;
	const filePath = path.join(__dirname, 'uploads', `${theme}.json`);

	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error leyendo el archivo:', err);
			return res.status(500).send('Error al obtener el test');
		}

		// obtene las preguntas y las respuestas del archivo json
		const test = JSON.parse(data);
		// test es un json con un array de preguntas y respuestas ahora necesito un array de preguntas
		
		for (let i = 0; i < test.length; i++) {
			for (let j = 0; j < test[i].answers.length; j++) {
				// now i need shuffle the answers array
				let answers = test[i].answers;
				// shuffle the answers
				let shuffledAnswers = shuffle(answers);
				let question = {
					question: test[i].question,
					questionType: test[i].questionType,
					answers: shuffledAnswers
				};
				questions.push(question);
				break;
			}
		}
		res.json(shuffle(questions));
	});
});

app.get('/api/tests/:theme/correction', (req, res) => {
	const theme = req.params.theme;
	const filePath = path.join(__dirname, 'uploads', `${theme}.json`);

	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error leyendo el archivo:', err);
			return res.status(500).send('Error al obtener el test');
		}

		// necesito recorrer el array de questions (global) y comparar con el json de data
		const test = JSON.parse(data);
		questions.forEach((question, index) => {
			for (let i = 0; i < test.length; i++) {
				if (question.question === test[i].question) {
					question.questionCorrectAnswer = test[i].questionCorrectAnswer;
				}
			}
		});

		res.json(questions);
	});
});

function shuffle(array) {
	let currentIndex = array.length, temporaryValue, randomIndex;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

// public index.html
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/views/index.html');
});

// Iniciar el servidor
app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}/admin`));
