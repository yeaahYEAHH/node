/**
 * Модуль для логирования событий.
 * @module ./module
 */
const { log } = require("./module.js");

/**
 * Модуль Express для создания веб-сервера.
 * @module express
 */
const express = require("express");

/**
 * Роутер Express для обработки запросов.
 * @type {Express.Router}
 */
const router = express.Router();

/**
 * Обработчик синхронных операций над файлом.
 * @function handler
 * @param {Express.Request} req - Объект запроса.
 * @param {Express.Response} res - Объект ответа.
 * @param {Object} file - Экземпляр файла.
 * @param {string} action - Название действия (метода) над файлом.
 * @param {Array} [options=[]] - Параметры для выполнения действия.
 * @returns {Object} Результат выполнения операции.
 */
function handler(req, res, file, action, options = []) {
	let result;
	try {
		if (!file || !file.data) throw new Error("not found");
		result = {
			type: "success",
			data: file[action](...options),
		};
		if (action === "near" && !(file instanceof FileTime)) {
			throw new TypeError(
				"method 'near' is not available for this file type"
			);
		}
		if (result.data === null) throw new Error("not found");
		log(`${req.method} ${req.originalUrl}`);
	} catch (err) {
		switch (err.message) {
			case "not found":
				res.status(404);
				result = { type: "error", message: err.message };
				break;
			case `time does not match the time format hh:ii`:
			case "parametr(s) is undefind":
			case `field "${req.query.field}" does not match the date format dd.mm.yyyy`:
			case `field "${req.query.field}" does not exist`:
				res.status(400);
				result = { type: "error", message: err.message };
				break;
			default:
				res.status(500);
				console.error(err.stack);
				result = {
					type: "error",
					message: err.message || "Internal Server Error",
				};
				break;
		}
		log(`${req.method} ${req.originalUrl} ${result.message}`, "Error");
	}
	return result;
}

/**
 * Обработчик асинхронных операций над файлом.
 * @async
 * @function asynchandler
 * @param {Express.Request} req - Объект запроса.
 * @param {Express.Response} res - Объект ответа.
 * @param {Object} file - Экземпляр файла.
 * @param {string} action - Название действия (метода) над файлом.
 * @param {Array} [options=[]] - Параметры для выполнения действия.
 * @returns {Promise<Object>} Результат выполнения операции.
 */
async function asynchandler(req, res, file, action, options = []) {
	const colorscheme = {
		DELETE: "Error",
		POST: "Success",
		PUT: "Edit",
	};
	const code = {
		DELETE: 200,
		POST: 201,
		PUT: 201,
	};
	let result;
	try {
		if (!file || !file.data) throw new Error("not found");
		result = {
			type: "success",
			data: file[action](...options),
		};
		await file.write();
		res.status(code[req.method]);
		log(`${req.method} ${result.data}`, colorscheme[req.method]);
		log(`Write ${file.path}`, "Warn");
	} catch (err) {
		switch (err.message) {
			case `item with field "${req.query.field}" and value "${req.query.value}" not found`:
			case "not found":
				res.status(404);
				result = { type: "error", message: err.message };
				break;
			case "type is incorrect":
			case "structure and exits item(s) is not a equal":
			case "parametr(s) is undefind":
			case `field "${req.query.field}" does not exist`:
				res.status(400);
				result = { type: "error", message: err.message };
				break;
			default:
				res.status(500);
				console.error(err.stack);
				result = {
					type: "error",
					message: err.message || "Internal Server Error",
				};
				break;
		}
		log(
			`!!ERROR!! ${req.method} ${req.originalUrl} ${result.message}`,
			"Error"
		);
	}
	return result;
}

/**
 * Маршрут для получения всех данных из файла.
 * @route GET /
 */
router.get("/", (req, res) => {
	const file = req.file;
	res.json(handler(req, res, file, "get"));
});

/**
 * Маршрут для поиска данных в файле.
 * @route GET /search/
 */
router.get("/search/", (req, res) => {
	const file = req.file;
	const { field, value } = req.query;
	res.json(handler(req, res, file, "search", [field, value]));
});

/**
 * Маршрут для сортировки данных в файле.
 * @route GET /sort/
 */
router.get("/sort/", (req, res) => {
	const file = req.file;
	const { field, order, byDate } = req.query;
	res.json(handler(req, res, file, "sort", [field, order, byDate]));
});

/**
 * Маршрут для получения текущего времени или даты.
 * @route GET /now/
 */
router.get("/now/", (req, res) => {
	const file = req.file;
	res.json(handler(req, res, file, "now"));
});

/**
 * Маршрут для поиска ближайшего события во времени.
 * @route GET /near/
 */
router.get("/near/", (req, res) => {
	const file = req.file;
	res.json(handler(req, res, file, "near"));
});

/**
 * Маршрут для получения данных по индексу.
 * @route GET /:index
 */
router.get("/:index", (req, res) => {
	const file = req.file;
	const { index } = req.params;
	res.json(handler(req, res, file, "search", ["ID", Number(index)]));
});

/**
 * Middleware для парсинга JSON-тела запроса.
 */
router.use(express.json());

/**
 * Middleware для парсинга URL-encoded тела запроса.
 */
router.use(express.urlencoded({ extended: true }));

/**
 * Маршрут для добавления новых данных в файл.
 * @route POST /
 */
router.post("/", async (req, res) => {
	const file = req.file;
	const item = req.body;
	const result = await asynchandler(req, res, file, "add", [item]);
	res.json(result);
});

/**
 * Маршрут для удаления данных из файла.
 * @route DELETE /
 */
router.delete("/", async (req, res) => {
	const file = req.file;
	const { field, value } = req.query;
	const result = await asynchandler(req, res, file, "delete", [field, value]);
	res.json(result);
});

/**
 * Маршрут для редактирования данных в файле.
 * @route PUT /:index
 */
router.put("/:index", async (req, res) => {
	const file = req.file;
	const item = req.body;
	const { index } = req.params;
	const result = await asynchandler(req, res, file, "edit", [index, item]);
	res.json(result);
});

// Экспорт роутера
module.exports = router;
