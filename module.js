/**
 * @module Module
 * @description Базовый модули, расширяющий фунциональность базового JS
 */

/**
 * Класс, вызывающий произвольные и случайные структуры данных
 * @class
 * @example
 * const random = new Random()
 */
class Random {
	#object = null;

	/**
	 * Генерирует случайную строку из указанного набора символов.
	 * @param {string} [charset="abcdefghijklmnopqrstuvwxyz"] - Набор символов для генерации.
	 * @param {number} length - Длина генерируемой строки.
	 * @returns {string} Случайная строка указанной длины.
	 *
	 * @throws {Error} Если length не указан или меньше 1.
	 * @throws {TypeError} Если charset не является строкой.
	 *
	 * @example
	 * string(); // Вернет случайную строку из 5 символов "abcdefghijklmnopqrstuvwxyz"
	 *
	 * @example
	 * string("0123456789", 10); // Вернет случайную строку из 10 цифр, например "8392058173"
	 *
	 * @example
	 * string("ABC", 3); // Вернет строку из 3 символов "ABC", например "CAB"
	 *
	 * @example
	 * string("❤★♞", 2); // Вернет строку из 2 символов, например "❤♞"
	 *
	 * @example
	 * string("", 5); // Выбросит RangeError, так как `charset` пуст
	 */
	string(charset = "abcdefghijklmnopqrstuvwxyz", length = 5) {
		if (typeof length !== "number" || length < 1)
			throw new Error("Параметр length должен быть числом больше 0");

		if (typeof charset !== "string")
			throw new TypeError("Параметр charset должен быть строкой");

		return [...Array(length)]
			.map(() => charset[this.number(charset.length)])
			.join("");
	}

	/**
	 * Генерирует случайного числа из указанного.
	 * @param {number} [number=100] - Число генерируемой от 0 до number.
	 * @returns {number} Случайное число.
	 * @throws {TypeError} Заданное значение не является числом.
	 *
	 * @example
	 * number(); // Вернет случайное число от 0 до 100
	 *
	 * @example
	 * number(10); // Вернет случайное число от 0 до 10
	 *
	 * @example
	 * number("10"); // Выбросит TypeError
	 *
	 */
	number(number = 100) {
		if (typeof number !== "number")
			return new TypeError(`Параметр number должен быть числом`);

		return ~~(Math.random() * number);
	}

	/**
	 * Генерирует случайное целое число в указанном диапазоне [begin, end).
	 *
	 * @param {number} [begin=0] - Начальное значение диапазона (включительно).
	 * @param {number} [end=100] - Конечное значение диапазона (исключительно).
	 * @returns {number} Случайное целое число в пределах диапазона.
	 * @throws {TypeError} Если параметры `begin` или `end` не являются числами.
	 * @throws {RangeError} Если `begin` больше или равен `end`.
	 *
	 * @example
	 * range(5, 10); // Вернет случайное число от 5 до 9
	 *
	 * @example
	 * range(); // Вернет случайное число от 0 до 99
	 *
	 * @example
	 * range(10, 5); // Выбросит RangeError
	 */
	range(begin = 0, end = 100) {
		if (typeof begin !== "number" || typeof end !== "number")
			return new TypeError(`Параметр number должен быть числом`);

		if (begin >= end) {
			throw new RangeError(
				"Параметр begin должен быть меньше параметра end"
			);
		}

		return ~~(Math.random() * (end - begin)) + begin;
	}

	/**
	 * Генерирует случайную подстроку из указанного.
	 * @param {string} [string="Hello, world"] - Строка, из которой необходимо получить подстроку
	 * @returns {string} Случайная подстрока из заданной строки
	 * @throws {TypeError} Если string не является строкой.
	 *
	 * @example
	 * substring("abcdef"); // Может вернуть "bc", "de", "a" или другую подстроку.
	 *
	 * @example
	 * substring(); // Вернет случайную подстроку из строки "Hello, world".
	 *
	 * @example
	 * substring(""); // Вернет пустую строку, так как входная строка пуста.
	 *
	 * @example
	 * substring(12345); // Выбросит TypeError, так как параметр не является строкой.
	 */
	substring(string = "Hello, world") {
		if (typeof string !== "string")
			return new TypeError(`Параметр string должен быть строкой`);

		let [a, b] = [this.number(string.length), this.number(string.length)];

		[a, b] = [Math.min(a, b), Math.max(a, b)];

		return string.slice(1, 3);
	}

	/**
	 * Случайное логическое значение
	 * @returns {boolean} true | false.
	 */
	boolean() {
		return Math.random() >= 0.5;
	}

	/**
	 * Выбирает случайный элемент из массива.
	 * @param {Array} fields - Массив значений.
	 * @returns {*} Случайный элемент массива.
	 * @throws {TypeError} Если fields не является массивом.
	 * @throws {Error} Если массив `fields` пустой.
	 * 
	 * @example
	 * field(["a", "b", "c"]); // Может вернуть "a", "b" или "c".
	 *
	 * @example
	 * field([1, 2, 3, 4]); // Может вернуть 1, 2, 3 или 4.
	 *
	 * @example
	 * field([]); // Выбросит ошибку, так как массив пуст.
	 *
	 * @example
	 * field("not an array"); // Выбросит TypeError, так как параметр не массив.
	 */

	field(fields) {
		if (!Array.isArray(fields))
			throw new TypeError("Параметр fields должен быть массивом");

		if (fields.length === 0) {
			throw new Error("Параметр fields не должен быть пустым массивом");
		}

		return fields[this.number(fields.length)];
	}

	/**
	 * Генерирует уникальный идентификатор.
	 * @param {number} [length=5] - Длина идентификатора.
	 * @param {string} [type="number"] - Тип идентификатора: "number" или "string".
	 * @returns {string|number} Случайный идентификатор заданного типа.
	 * @throws {Error} Если тип идентификатора не поддерживается.
	 */
	id(length = 5, type = "number") {
		if (typeof length !== "number" || length < 1) {
			throw new Error("Длина должна быть положительным числом");
		}

		if (type === "string") {
			const charset =
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			return this.string(this.string);
		}

		if (type === "number") {
			return parseInt(
				Array.from({ length }, () =>
					Math.floor(Math.random() * 10)
				).join("")
			);
		}

		throw new Error(
			`Тип "${type}" не поддерживается. Используйте "string" или "number"`
		);
	}

	/**
	 * Выбирает случайный элемент из массива данных и одно из его полей, при необходимости генерирует подстроку.
	 * @param {Array<Object>} data - Массив объектов.
	 * @param {boolean} [randomSubstring=false] - Генерировать ли подстроку из значения поля.
	 * @returns {Object} Содержит выбранное поле и его значение.
	 * @throws {TypeError} Если data не является массивом.
	 */

	item(data, randomSubstring = false) {
		if (!Array.isArray(data) || data.length === 0)
			throw new TypeError(
				"Параметр data должен быть непустым массивом объектов"
			);

		const length = data.length,
			index = this.number(length),
			item = data[index],
			keys = Object.keys(item),
			field = this.field(Object.keys(item)),
			value =
				randomSubstring && typeof item[field] === "string"
					? this.substring(item[field])
					: item[field];

		this.#object = {
			index: index,
			item: item,
			keys: keys,
			field: field,
			value: value,
		};

		return { field: field, value: value };
	}

	/**
	 * Перемешивает элементы массива случайным образом.
	 * @param {Array} array - Массив для перемешивания.
	 * @returns {Array} Новый массив с перемешанными элементами.
	 * @throws {TypeError} Если переданный аргумент не является массивом.
	 */

	shuffle(array) {
		if (!Array.isArray(array))
			throw new TypeError("Параметр должен быть массивом");

		const result = [...array];
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]]; // Обмен значениями
		}

		return result;
	}

	/**
	 * @returns {Object|null} Приватный объект или null, если объект не установлен.
	 */
	get() {
		return this.#object;
	}
}

/**
 * Сравнивает два значения по типу и, при необходимости, по значению.
 * @param {*} a - Первое значение.
 * @param {*} b - Второе значение.
 * @param {boolean} [strict=false] - Если true, выполняется строгое сравнение (по типу и значению).
 * @returns {boolean} true, если значения равны по указанным критериям, иначе false.
 */

function isEqualByType(a, b, strict = false, visited = new WeakMap()) {
	const typeA = typeof a;
	const typeB = typeof b;

	if (typeA !== typeB) return false;
	if (!strict) return true;
	if (typeA !== "object" || a === null || b === null) return a === b;

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	if (keysA.length !== keysB.length) return false;

	keysA.sort();
	keysB.sort();

	if (keysA.join("") !== keysB.join("")) return false;

	return keysA.every((key) => {
		return isEqualByType(a[key], b[key]);
	});
}

/**
 * Проверяет уникальность значений массива
 * @param {Array<Object>} array - Массив значение.
 * @param {string|number} item - Элемент массива значение.
 * @returns {boolean} true, если все значения уникальны.
 * @throws {Error} Если найдены дублирующиеся значения.
 */

function checkUnique(array, field) {
	if (!Array.isArray(array)) {
		throw new TypeError("Первый аргумент должен быть массивом");
	}

	const seen = new Set();

	for (const item of array) {
		if (seen.has(item[field])) {
			throw new Error(`Значение ${field}:${item[field]} не уникально`);
		}
		seen.add(item[field]);
	}

	return true;
}

module.exports = {
	Random: Random,
	isEqualByType: isEqualByType,
	checkUnique: checkUnique,
};
