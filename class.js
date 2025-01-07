const fs = require("fs");
const path = require("path");
const { Random, isEqualByType } = require("./module.js");

const random = new Random();

/**
 * @module JSON
 * @description Модуль, в котором реализуется работы с JSON
 */

/**
 * Класс для работы с JSON файлами.
 * Предоставляет методы для работы с данными внутри JSON-файлом.
 * @class
 */
class FileArrayJSON {
	/**
	 * @private
	 * @type {Object}
	 */
	#template;
	#index = [];

	/**
	 * Валидация переданных параметров и наличия загруженных данных.
	 * @protected
	 * @param {...*} parametr - Параметры для проверки.
	 * @throws {Error} Если данные не загружены или параметры не определены.
	 */
	_validate(...parametr) {
		if (!this.data)
			throw new Error(
				`JSON data not loaded from ${path.basename(this.path)}`
			);

		for (let item of parametr)
			if (item === undefined) throw new Error(`parametr(s) is undefind`);
	}

	/**
	 * Валидация наличия указанного поля в данных.
	 * @protected
	 * @param {string} field - Поле, которое необходимо проверить.
	 * @throws {Error} Если поле не найдено в данных.
	 */
	_validateField(field) {
		if (!this.data.some((item) => field in item))
			throw new Error(`field "${field}" does not exist`);
	}

	/**
	 * Создает экземпляр FileJSON.
	 * @param {string} file - Путь к файлу JSON.
	 * @constructor
	 */
	constructor(file) {
		this.path = file;
		this.data = null;
	}

	/**
	 * Загружает и парсит данные из JSON-файла.
	 * @returns {Promise<void>}
	 * @throws {Error} Если файл не найден или не удается распарсить данные.
	 */
	async load() {
		try {
			await fs.promises.access(this.path, fs.constants.F_OK);

			console.log(`file ${path.basename(this.path)} was loaded`);
		} catch (err) {
			throw new Error(`file not found: ${this.path}`);
		}

		try {
			const data = await fs.promises.readFile(this.path, "utf-8");
			try {
				this.data = JSON.parse(data);
				this.#template = this.data[0] ? this.data[0] : null;
			} catch (err) {
				throw new Error(`failed to parse JSON-data`);
			}
		} catch (err) {
			throw new Error(
				`failed to load JSON file from ${path.basename(this.path)}`
			);
		}
	}

	/**
	 * Записывает данные обратно в JSON-файл.
	 * @returns {Promise<void>}
	 * @throws {Error} Если не удается записать данные в файл.
	 */
	async write() {
		try {
			const data = JSON.stringify(this.data, null, 2);
			await fs.promises.writeFile(this.path, data);

			console.log(
				`succesful write JSON-data to file: ${path.basename(this.path)}`
			);
		} catch (err) {
			throw new Error(
				`failed to process JSON-data or write to file: ${err.message}`
			);
		}
	}

	// async create() {} для создание файла

	// async save() {} для обновления и сохранения файла

	/**
	 * Ищет элементы в данных по заданному полю и значению.
	 * @public
	 * @param {string} field - Поле для поиска.
	 * @param {string|number} value - Значение для поиска.
	 * @returns {Array|null} Возвращает массив найденных элементов или null, если ничего не найдено.
	 */
	search(field, value) {
		this._validate(field, value);
		this._validateField(field);

		const regexp = new RegExp(value.toString());
		this.#index = [];

		const items = this.data.filter((item, index) => {
			const result =
				typeof value === "string"
					? regexp.test(item[field])
					: item[field] === value;

			if (result) {
				this.#index.push(index);
			}

			return result;
		});

		if (items.length == 0) return null;

		return items;
	}

	/**
	 * Сортирует данные по указанному полю и порядку.
	 * @public
	 * @param {string} field - Поле для сортировки.
	 * @param {boolean} [order=true] - Порядок сортировки: true - по возрастанию, false - по убыванию.
	 * @returns {Array} Отсортированный массив.
	 * @throws {Error} Если поле не существует.
	 */
	sort(field, order = true) {
		this._validate(field, order);
		this._validateField(field);

		const sortedData = [...this.data].sort((a, b) => {
			if (a[field] > b[field]) return order ? 1 : -1;
			if (a[field] < b[field]) return order ? -1 : 1;
			return 0;
		});

		return sortedData;
	}

	/**
	 * Добавляет новый элемент в дату.
	 * @public
	 * @param {Object} add - Новый элемент для добавления.
	 * @returns {string} Сообщение об успешном добавлении.
	 * @throws {TypeError} Если тип добавляемого элемента не совпадает с шаблоном.
	 * @throws {Error} Если структура добавляемого элемента не совпадает с шаблоном.
	 */
	add(add) {
		this._validate(add);

		this.#template = this.#template === null ? add : this.#template;

		const typeTemplate = typeof this.#template,
			typeAdd = typeof add;

		if (typeAdd !== typeTemplate) throw new TypeError(`type is incorrect`);

		add.ID = random.id();

		if (!isEqualByType(add, this.#template, true))
			throw new Error(`structure and exits item(s) is not a equal`);

		this.data.push(add);

		return `item was succesful add ID:${add.ID}`;
	}

	/**
	 * Удаляет элементы из данных, которые соответствуют указанным полю и значению.
	 * @param {string} field - Поле, по которому осуществляется поиск элементов.
	 * @param {*} value - Значение, по которому осуществляется поиск элементов.
	 * @throws {Error} Если значение или поле не указаны.
	 * @throws {Error} Если элементы с указанным полем и значением не найдены.
	 * @returns {string} Сообщение о успешном удалении элементов.
	 */

	delete(field, value) {
		this._validate(value);
		this._validateField(field);

		this.search(field, value);

		if (this.#index.length === 0)
			throw new Error(
				`item with field "${field}" and value "${value}" not found`
			);

		for (let index of this.#index) {
			this.data.splice(parseInt(index), 1);
		}

		return `item with ${field}: ${value} was successfully deleted`;
	}

	/**
	 * Редактирует элемент в JSON-данных по уникальному идентификатору.
	 * @param {number|string} unique - Уникальный идентификатор элемента для поиска (поле "ID").
	 * @param {object} newValue - Новый объект, заменяющий существующий элемент.
	 * @throws {Error} Если параметр `unique` или `newValue` не указан.
	 * @throws {TypeError} Если тип нового значения не совпадает с шаблонным типом.
	 * @throws {Error} Если структура нового объекта не соответствует шаблону.
	 * @throws {Error} Если элемент с указанным идентификатором не найден.
	 * @returns {string} Сообщение об успешном редактировании элемента.
	 */
	edit(unique, newValue) {
		this._validate(unique, newValue);

		const typeTemplate = typeof this.#template,
			typeEdit = typeof newValue;

		if (typeEdit !== typeTemplate) throw new TypeError(`type is incorrect`);

		if (!isEqualByType(newValue, this.#template, true))
			throw new Error(`structure and exits item(s) is not a equal`);

		this.search("ID", parseInt(unique));

		if (this.#index.length === 0)
			throw new Error(
				`item with field "ID" and value "${unique}" not found`
			);

		this.data[this.#index[0]] = newValue;

		return `item with ID:${unique} was successfully edited`;
	}
}

/**
 * Класс для работы с JSON-файлами, содержащими данные с датами в формате "дд.мм.гггг".
 * Наследуется от FileArrayJSON.
 * @class
 */
class FileDateJSON extends FileArrayJSON {
	/**
	 * Регулярное выражение для проверки формата даты "дд.мм.гггг".
	 * @private
	 * @type {RegExp}
	 */
	#dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;

	/**
	 * Форматер для получения текущей даты в формате "дд.мм".
	 * @private
	 * @type {Intl.DateTimeFormat}
	 */
	#formatter = new Intl.DateTimeFormat("ru", {
		month: "2-digit",
		day: "2-digit",
	});

	/**
	 * Сортирует элементы JSON по указанному полю и критерию даты.
	 * @param {string} field - Поле для сортировки.
	 * @param {boolean} [order=true] - Порядок сортировки: `true` для возрастания, `false` для убывания.
	 * @param {"day"|"month"|"year"} [byDate=null] - Критерий сортировки по дате: `"day"`, `"month"` или `"year"`.
	 * @returns {Array<object>} Отсортированный массив.
	 * @throws {Error} Если поле не соответствует формату "дд.мм.гггг" или указан неверный критерий сортировки.
	 * @throws {Error} Если поле не существует.
	 */
	sort(field, order = true, byDate) {
		if (byDate === null) return super.sort(field, order);

		this._validate(field, order, byDate);
		this._validateField(field);

		this.data.sort((a, b) => {
			// Дата по стандарту дд.мм.гггг
			if (
				!this.#dateRegex.test(a[field]) ||
				!this.#dateRegex.test(b[field])
			) {
				throw new Error(
					`field "${field}" does not match the date format dd.mm.yyyy`
				);
			}

			const [dayA, monthA, yearA] = a[field]
				.split(".")
				.map((value) => parseInt(value, 10));

			const [dayB, monthB, yearB] = b[field]
				.split(".")
				.map((value) => parseInt(value, 10));

			switch (byDate) {
				case "day":
					return order ? dayA - dayB : dayB - dayA;
				case "month":
					return order ? monthA - monthB : monthB - monthA;
				case "year":
					return order ? yearA - yearB : yearB - yearA;
				default:
					throw new Error(`invalid sort criterion "${byDate}"`);
			}
		});

		return this.data;
	}

	/**
	 * Возвращает элементы JSON, соответствующие указанной дате, или элементы с текущей датой.
	 * @param {string} [date] - Дата в формате "дд.мм.гггг". Если не указана, используется текущая дата.
	 * @returns {Array<object>|null} Массив объектов, соответствующих дате, или `null`, если совпадений нет.
	 * @throws {Error} Если указанная дата не соответствует формату "дд.мм.гггг".
	 */
	now(date = undefined) {
		if (date) {
			if (!this.#dateRegex.test(date)) {
				throw new Error("Date must be in format dd.mm.yyyy");
			}
			return super.search("Date", date);
		}

		const today = this.#formatter.format(new Date());
		return super.search("Date", today);
	}
}

module.exports = {
	FileArray: FileArrayJSON,
	FileDate: FileDateJSON,
};
