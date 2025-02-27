const express = require("express");
const config = require("./config.json");
const fs = require("fs/promises");
const router = require('./module/router.js');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');


const { log, color } = require("./module/module.js");
const { FileTime, FileDate, FileArray } = require("./module/class.js");
const { AUTH, PORT, TYPES } = config;

const app = express();

function requestTimeoutMiddleware(timeoutMs) {
    return (req, res, next) => {
        const timer = setTimeout(() => {
            if (!res.headersSent) {
                log('Timed out', 'Error')
                res.status(408).json({ type: 'error', message: 'request timeout' });
            }
        }, timeoutMs);

        req.clearTimeout = () => clearTimeout(timer);

        next();
    };
}

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
		log(`Operation ${operation} completed`, colorscheme[action]);
		res.json({ type: "success", message: `${operation} successful` });
	} catch (err) {
		log(`Operation ${operation} failed: ${err.message}`, "Error");
		res.status(400).json({ type: "error", message: err.message });
	}
};

const saveConfig = async (req, res) => {
	try {
		await fs.writeFile("./config.json", "utf8", JSON.stringify(config));
		log(`Operation config file completed`, "Warn");
		res.json({ type: "success", message: 'save configurate successful' });
	} catch (err) {
		log(`Operation save config file failed: ${err.message}`, "Error");
		res.status(400).json({ type: "error", message: err.message });
	}
};

const swaggerDocument = YAML.load("./api/api-docs.yml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(authorization);

app.use(requestTimeoutMiddleware(5000));

app.use("/:filename/create/:type", (req, res) => {
	handleFileOperation(req, res, "create");

	const { filename, type } = req.params;
	TYPES[filename] = type;
});
app.use("/:filename/copy", (req, res) => {
	handleFileOperation(req, res, "copy");
});
app.use("/:filename/restore", (req, res) => {
	handleFileOperation(req, res, "restore");
});

app.use("/:filename/delete", (req, res) => {
	handleFileOperation(req, res, "remove");
});

app.use("/save/config", saveConfig);

app.use("/:filename", load);

app.use("/:filename", router)

app.listen(PORT, () => {
	console.log("-----------------------|!!START!!|-----------------------");
	log(color(`Start server on: http://localhost:${PORT}`, "Info"));
	log(color(`Api docs on: http://localhost:${PORT}/api-docs`, "Info"));
	console.log("---------------------------------------------------------");
});
