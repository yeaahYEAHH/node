const { FileArray, FileDate, FileTime } = require("./class.js");
const { Random, checkUnique, isEqualByType } = require("./module.js");

const random = new Random();

const src = [
	"json/birthday.json",
	"json/scheduleLDK.json",
	"json/scheduleMonday.json",
	"json/scheduleUAK.json",
	"json/scheduleUPK.json",
];

describe("FileArray", () => {
	const newFileObj = new FileArray(src[random.number(src.length - 1)]);
	const dataCor = [];
	let item, data;

	beforeAll(async () => {
		await newFileObj.load();

		let i = 0;
		for (;;) {
			if (i === 10) break;
			dataCor.push(newFileObj.data[i]);
			i++;
		}
	});

	beforeEach(() => {
		item = random.item(dataCor, true);
		data = random.get();
	});

	test(`FileArray all ID is unique`, () => {
		const result = checkUnique(newFileObj.data, "ID");

		expect(result).toBeTruthy();
	});

	test(`FileArray.search() is correct work`, () => {
		// Проверка на вызов без параметр(ов) !Error
		expect(() => newFileObj.search()).toThrowError(
			"parametr(s) is undefind"
		);
		expect(() => newFileObj.search(random.field(data.keys))).toThrowError(
			"parametr(s) is undefind"
		);

		// Отлов ошибки при несуществующем поле !Error
		expect(() =>
			newFileObj.search(random.string(), item.value)
		).toThrowError(/field .* does not exist/);

		// Отлов ошибки при несущеструющем значение !Null
		for (let i = 0; i > 3; ) {
			const result = newFileObj.search(
				data.keys[random.number(data.keys.length)],
				random.string()
			);

			expect(result).toBeNull();

			i++;
		}

		// Проверка на нахождение случайного элементе из массива найденных значений !Item
		const items = newFileObj.search(item.field, item.value);

		expect(items).toContainEqual(data.item);
	});

	test(`FileArray.add() is correct work`, () => {
		const length = newFileObj.data.length;

		// Проверка на вызов без параметр(ов) !Error
		expect(() => newFileObj.add()).toThrowError("parametr(s) is undefind");

		// Ошибка при несоотвествии типу !Item шаблону
		expect(() => newFileObj.add(random.boolean())).toThrowError(
			"type is incorrect"
		);

		// Ошибка при несоотвествии структуре !Item, существующими шаблону
		expect(() =>
			newFileObj.add([random.number(), random.boolean()])
		).toThrowError("structure and exits item(s) is not a equal");

		// Проверка на успешное добавление !Item
		const add = {};
		for (let i in data.item) {
			if (i === "ID") continue;
			add[i] = data.item[i];
		}

		result = newFileObj.add(add);

		expect(result).toMatch(/item was succesful add ID:.*/);

		// Проверка на изменения FileArray.data
		expect(length < newFileObj.data.length).toBeTruthy();
	});

	test(`FileArray.delete() is correct work`, () => {
		const length = newFileObj.data.length;

		// Проверка на вызов без параметр(ов) !Error
		expect(() => newFileObj.delete()).toThrowError(
			"parametr(s) is undefind"
		);

		// Отлов ошибки при несуществующем поле !Error
		expect(() =>
			newFileObj.delete(random.string(), item.value)
		).toThrowError(/field .* does not exist/);

		// Отлов ошибки при несущеструющем значение !Error
		for (let i = 0; i > 3; ) {
			const result = newFileObj.delete(
				data.keys[random.number(data.keys.length)],
				random.string()
			);

			expect(result).toThrowError(
				/item with field ".*" and value ".*" not found/
			);

			i++;
		}

		// Проверка на успешное удаление !Item(s)
		const result = newFileObj.delete(item.field, item.value);
		expect(result).toMatch(/item with \w*: .* was successfully deleted/);

		// Проверка на изменения FileArray.data
		expect(length > newFileObj.data.length).toBeTruthy();
	});

	test(`FileArray.edit() is correct work`, () => {
		const edit = {};

		// Проверка на вызов без параметр(ов) !Error
		expect(() => newFileObj.edit()).toThrowError("parametr(s) is undefind");

		// Ошибка при несоотвествии типу !Item шаблону
		expect(() =>
			newFileObj.edit(random.number(), random.boolean())
		).toThrowError("type is incorrect");

		// Ошибка при несоотвествии структуре !Item, существующими шаблону
		expect(() =>
			newFileObj.edit(random.number(), [
				(random.number(), random.boolean()),
			])
		).toThrowError("structure and exits item(s) is not a equal");

		// Отлов ошибки при несущеструющем ID !Error
		expect(() =>
			newFileObj.edit(random.string(undefined, 4), data.item)
		).toThrowError(/item with field "ID" and value ".*" not found/);

		// Проверка на успешное редактирование !Item
		for (let i = 0; i < 3; i++) {
			for (let i in data.item) {
				if (i === "ID") {
					edit[i] = data.item[i];
					continue;
				}
				edit[i] = random.string(undefined, 10);
			}

			const result = newFileObj.edit(edit.ID, edit);
			expect(result).toMatch(/item with ID:.* was successfully edited/);
		}

		// Проверка на изменение !Item

		expect(
			Object.keys(edit).some((key) => edit[key] !== data.item[key])
		).toBeTruthy();
	});
});

describe("FileDate", () => {
	const newFileObj = new FileDate(src[0]);
	const dataCor = [];
	let item, data;

	beforeAll(async () => {
		await newFileObj.load();

		let i = 0;
		for (;;) {
			if (i === 10) break;
			dataCor.push(newFileObj.data[i]);
			i++;
		}
	});

	beforeEach(() => {
		item = random.item(dataCor);
		data = random.get();
	});

	test(`FileDate.date() is correct work`, () => {
		// Проверка на нахождение элемента по дата dd.mm.yyyy
		{
			const result = newFileObj.now(data.item["Date"]);
			expect(result).toContainEqual(data.item);
		}

		// Проверка на нахождение несуществующего элемента
		{
			const result = newFileObj.now("32.13.2099");
			expect(result).toBeNull();
		}
	});
});

describe("FileTime", () => {
	// const newFileObj = new FileTime(src[random.range(1, src.length - 1)]);
	const newFileObj = new FileTime(src[1]);
	const dataCor = [];
	let fieldStart, fieldEnd;
	let data;
	const time = new Intl.DateTimeFormat("ru", {
				timeZone: "Asia/Yekaterinburg",
				hour: "2-digit",
				minute: "2-digit",
			}).format(new Date());

	beforeAll(async () => {
		await newFileObj.load();

		let i = 0;
		for (;;) {
			if (i === 10) break;
			dataCor.push(newFileObj.data[i]);
			i++;
		}
	});

	beforeEach(() => {
		random.item(dataCor);
		data = random.get();
		[fieldStart, fieldEnd] = [data.keys[0], data.keys[1]];
	});

	test(`FileTime.now() is correct work`, () => {
		// Проверка на вызов без параметр(ов) !Error
		expect(() => newFileObj.now()).toThrowError("parametr(s) is undefind");

		// Отлов ошибки при несуществующем поле !Error
		expect(() =>
			newFileObj.now(
				random.string(undefined, 5),
				random.string(undefined, 5),
				random.string(undefined, 5)
			)
		).toThrowError();

		// Отлов ошибки при несоответствии time формату hh:mm !Error
		expect(() =>
			newFileObj.now(fieldStart, fieldEnd, random.string(undefined, 10))
		).toThrowError(`time does not match the time format hh:ii`);

		// Проверка на возвращаемый time !Item
		{
			const result = [
				newFileObj.now(fieldStart, fieldEnd, data.item[fieldEnd]),
			];
			expect(result).toContain(data.item);
		}

		// Проверка на возвращаемый time !Item
		{
			const result = newFileObj.now(fieldStart, fieldEnd, time);

			if (result !== null) {
				expect(result).toBeDefined();
			} else {
				expect(result).toBeNull();
			}
		}
	});

	test(`FileTime.near() is correct work`, () => {
		// Проверка на вызов без параметр(ов) !Error
		expect(() => newFileObj.near()).toThrowError("parametr(s) is undefind");

		// Отлов ошибки при несуществующем поле !Error
		expect(() =>
			newFileObj.near(
				random.string(undefined, 5),
				random.string(undefined, 5)
			)
		).toThrowError();

		// Отлов ошибки при несоответствии time формату hh:mm !Error
		expect(() =>
			newFileObj.near(fieldStart, random.string(undefined, 10))
		).toThrowError(`time does not match the time format hh:ii`);

		// Проверка на возвращаемый time !Item
		{
			const result = newFileObj.near(time, fieldStart);

			if (result !== null) {
				expect(result).toBeDefined();
			} else {
				expect(result).toBeNull();
			}
		}
	})
});
