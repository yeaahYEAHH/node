const { log } = require("./module.js");
const express = require("express");
const router = express.Router();

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

		res.status(code[req.method])
		log(`${req.method} ${result.data}`, colorscheme[req.method]);
        log(`Write ${file.path}`, 'Warn');
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

		log(`!!ERROR!! ${req.method} ${req.originalUrl} ${result.message}`, "Error");
	}

	return result;
}

router.get("/", (req, res) => {
	const file = req.file;

	res.json(handler(req, res, file, "get"));
});

router.get("/search/", (req, res) => {
	const file = req.file;
	const { field, value } = req.query;

	res.json(handler(req, res, file, "search", [field, value]));
});

router.get("/sort/", (req, res) => {
	const file = req.file;
	const { field, order, byDate } = req.query;

	res.json(handler(req, res, file, "sort", [field, order, byDate]));
});

router.get("/now/", (req, res) => {
	const file = req.file;

	res.json(handler(req, res, file, "now"));
});

router.get("/near/", (req, res) => {
	const file = req.file;

	res.json(handler(req, res, file, "near"));
});

router.get("/:index", (req, res) => {
	const file = req.file;
	const { index } = req.params;

	res.json(handler(req, res, file, "search", ["ID", Number(index)]));
});

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/", async (req, res) => {
	const file = req.file;
	const item = req.body;

	const result = await asynchandler(req, res, file, "add", [item]);

	res.json(result);
});

router.delete("/", async (req, res) => {
	const file = req.file;
	const { field, value } = req.query;

	const result = await asynchandler(req, res, file, "delete", [field, value]);

	res.json(result);
});

router.put("/:index", async (req, res) => {
	const file = req.file;
	const item = req.body;

	const { index } = req.params;

    const result = await asynchandler(req, res, file, "edit", [index, item]);

	res.json(result);
});

module.exports = router;
