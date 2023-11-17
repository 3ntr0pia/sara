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

    const exploreDirectory = (dirPath) => {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        let structure = {};

        entries.forEach(entry => {
            if (entry.isDirectory()) {
                const subPath = path.join(dirPath, entry.name);
                structure[entry.name] = exploreDirectory(subPath);
            } else if (entry.isFile() && path.extname(entry.name) === '.json') {
                if (!structure.files) {
                    structure.files = [];
                }
                structure.files.push(entry.name.replace('.json', ''));
            }
        });

        return structure;
    };

    try {
        const themes = exploreDirectory(uploadsDir);
		console.log(themes);
        res.send(themes);
    } catch (error) {
        res.status(500).send({ error: 'Error al leer el directorio' });
    }
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
app.get('/api/tests/:subject/:topic/:test', (req, res) => {
	const { subject, topic, test } = req.params;
	const filePath = path.join(__dirname, 'uploads', subject, topic, `${test}.json`);

	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error leyendo el archivo:', err);
			return res.status(500).send('Error al obtener el test');
		}

		const testContent = JSON.parse(data);
		let questions = testContent.map(item => {
			let shuffledAnswers = shuffle(item.answers);
			return {
				question: item.question,
				questionType: item.questionType,
				answers: shuffledAnswers,
				questionCorrectAnswer: item.questionCorrectAnswer
			};
		});
		res.json(shuffle(questions));
	});
});

app.get('/api/tests/:subject/:topic/:test/correction', (req, res) => {
	const { subject, topic, test } = req.params;
	const filePath = path.join(__dirname, 'uploads', subject, topic, `${test}.json`);

	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error leyendo el archivo:', err);
			return res.status(500).send('Error al obtener el test');
		}

		const testContent = JSON.parse(data);
		let questionsWithAnswers = testContent.map(item => {
			return {
				question: item.question,
				questionCorrectAnswer: item.questionCorrectAnswer
			};
		});
		res.json(questionsWithAnswers);
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
