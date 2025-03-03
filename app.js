/**
 * Модуль Express для создания веб-сервера.
 * @module express
 */
const express = require("express");

/**
 * Конфигурационный файл приложения.
 * @module config
 */
const configuratre = require("./config.json");

/**
 * Асинхронные операции с файловой системой Node.js.
 * @module fs/promises
 */
const fs = require("fs/promises");

/**
 * Роутер для обработки запросов.
 * @module ./module/router
 */
const router = require("./module/router.js");

/**
 * Библиотека для отображения документации API Swagger.
 * @module swagger-ui-express
 */
const swaggerUi = require("swagger-ui-express");

/**
 * Библиотека для работы с YAML-файлами.
 * @module yamljs
 */
const YAML = require("yamljs");

/**
 * Логгер и утилиты для работы с цветом текста.
 * @module ./module/module
 */
const { log, color } = require("./module/module.js");

/**
 * Классы для работы с файлами разных типов.
 * @module ./module/class
 */
const { FileArray, FileDate, FileTime } = require("./module/class.js");

/**	
 * Константы конфигурации приложения.
 * @constant {Object}
 * @property {string} AUTH - Токен авторизации.
 * @property {number} PORT - Порт сервера.
 * @property {Object} TYPES - Типы файлов.
 */

const config = configuratre;
const { AUTH, PORT, TYPES } = config;

/**
 * Экземпляр приложения Express.
 * @type {Express.Application}
 */
const app = express();

/**
 * Middleware для установки таймаута на обработку запроса.
 * Если запрос не завершается за указанное время, возвращается ошибка 408.
 * @function requestTimeoutMiddleware
 * @param {number} timeoutMs - Время таймаута в миллисекундах.
 * @returns {Function} Middleware функция.
 */
function requestTimeoutMiddleware(timeoutMs) {
	return (req, res, next) => {
		const timer = setTimeout(() => {
			if (!res.headersSent) {
				log("Timed out", "Error");
				res.status(408).json({
					type: "error",
					message: "request timeout",
				});
			}
		}, timeoutMs);
		req.clearTimeout = () => clearTimeout(timer);
		next();
	};
}

/**
 * Функция для получения экземпляра файла соответствующего типа.
 * @function getFileInstance
 * @param {string} filename - Имя файла.
 * @returns {FileTime|FileDate|FileArray} Экземпляр класса для работы с файлом.
 * @throws {Error} Если тип файла неизвестен.
 */
const getFileInstance = (filename) => {
	if (!TYPES[filename]) {
		throw new Error("Unknown file type");
	}
	const type = TYPES[filename];
	switch (type) {
		case "date":
			return new FileDate(filename);
		case "time":
			return new FileTime(filename);
		default:
			return new FileArray(filename);
	}
};

/**
 * Middleware для проверки авторизации.
 * @function authorization
 * @param {Express.Request} req - Объект запроса.
 * @param {Express.Response} res - Объект ответа.
 * @param {Function} next - Callback для передачи управления следующему middleware.
 */
const authorization = (req, res, next) => {
	if (!req.headers.authorization || req.headers.authorization !== AUTH) {
		log(`Not Authorization, WHO IS ${req.ip}?`, "Error");
		return res
			.status(401)
			.json({ type: "error", message: "Not authorization" });
	}
	log(`Authorization from ${req.ip}`, "Debug");
	next();
};

/**
 * Middleware для загрузки файла.
 * @function load
 * @param {Express.Request} req - Объект запроса.
 * @param {Express.Response} res - Объект ответа.
 * @param {Function} next - Callback для передачи управления следующему middleware.
 */
const load = async (req, res, next) => {
	const { filename } = req.params;
	try {
		const file = getFileInstance(filename);
		await file.load();
		req.file = file;
		log(`Load ${filename}.json`, "Success");
		next();
	} catch (err) {
		log(`Load ${filename}.json ${err.message}`, "Error");
	}
};

/**
 * Обработка операций над файлом.
 * @function handleFileOperation
 * @param {Express.Request} req - Объект запроса.
 * @param {Express.Response} res - Объект ответа.
 * @param {string} operation - Название операции (create, copy, restore, remove).
 * @param {Array} [params=[]] - Параметры операции.
 */
const handleFileOperation = async (req, res, operation, params = []) => {
	const file = new FileArray(req.params.filename);
	const colorscheme = {
		create: "Warn",
		copy: "Warn",
		restore: "Warn",
		remove: "Warn",
	};
	try {
		await file[operation](...params);
		log(`Operation ${operation} completed`, colorscheme[operation]);
		res.json({ type: "success", message: `${operation} successful` });
	} catch (err) {
		log(`Operation ${operation} failed: ${err.message}`, "Error");
		res.status(400).json({ type: "error", message: err.message });
	}
};

/**
 * Документация API Swagger.
 * @type {Object}
 */
const swaggerDocument = YAML.load("./api/api-docs.yml");

// Подключение middleware и маршрутов
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(authorization);
app.use(requestTimeoutMiddleware(5000));

/**
 * Маршрут для создания файла.
 * @route GET /:filename/create/:type
 */
app.use("/:filename/create/:type", async (req, res) => {
	const { filename, type } = req.params;
	config.TYPES[filename] = type;
	handleFileOperation(req, res, "create");
	await fs.writeFile("./config.json", JSON.stringify(config), "utf8");
});

/**
 * Маршрут для копирования файла.
 * @route GET /:filename/copy
 */
app.use("/:filename/copy", (req, res) => {
	handleFileOperation(req, res, "copy");
});

/**
 * Маршрут для восстановления файла.
 * @route GET /:filename/restore
 */
app.use("/:filename/restore", (req, res) => {
	handleFileOperation(req, res, "restore");
});

/**
 * Маршрут для удаления файла.
 * @route GET /:filename/remove
 */
app.use("/:filename/remove", async (req, res) => {
	handleFileOperation(req, res, "remove");
	const { filename } = req.params;
	delete config.TYPES[filename];	
	await fs.writeFile("./config.json", JSON.stringify(config), "utf8")
});

/**
 * Маршрут для загрузки файла.
 * @route GET /:filename
 */
app.use("/:filename", load);

/**
 * Обработка запросов через роутер.
 * @route *
 */
app.use("/:filename", router);

// Запуск сервера
app.listen(PORT, () => {
	console.log("-----------------------|!!START!!|-----------------------");
	log(color(`Start server on: http://localhost:${PORT}`, "Info"));
	log(color(`Api docs on: http://localhost:${PORT}/api-docs`, "Info"));
	console.log("---------------------------------------------------------");
});
