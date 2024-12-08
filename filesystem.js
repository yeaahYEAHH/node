
const fs = require("fs");

class ObjectJSON {
	#cacheSearch = new Map();

	_validate(...parametr) {
		for(let item of parametr){
			if(item === undefined) throw new Error(`Args is undefind`);
		}
	};

	_validateField(field){
		if(!this._data.some(item => field in item)) throw new Error(`Field "${field}" is not exist`);

	};

	constructor(stringJSON) {
		this._data = stringJSON;
	};

	search(field, value) {

		this._validate(field, value);
		this._validateField(field);
	
		const regexp = new RegExp(value);
	
		const items = this._data.filter((item, index) => {
		  if(this.#cacheSearch.has(index)) return true;
	
		  const found = typeof value === 'string' || value instanceof String ? regexp.test(item[field]) : item[field] === value;
	
		  if(found) this.#cacheSearch.set(index, item);
	
		  return found
		})
	
		if(items.length == 0) throw new Error(`Item was not exist by ${field}:${value}`)
	
		return items;
	}

	sort(field, order = true) {

		this._validate(field, order);
		this._validateField(field);

		this._data.sort((a, b) => {
			if (a[field] > b[field]) return 1;
			if (a[field] < b[field]) return -1;
			return 0;
		});

		return order ? this._data : this._data.reverse();
	};

	delete(value, field = "ID") {
		this.#cacheSearch.clear();

		this.search(field , value);

		for(let index of this.#cacheSearch.keys()){		
			this._data.splice(index, 1);
		}

		return `Item was succesful delete by ${field}:${value}`;
	};

	add(object) {
		this.#cacheSearch.clear();
		this._validate(object);

		object.ID = this._data.length;
		this._data.push(object);
	};

	edit(oldValue, newValue, field) {
		this.#cacheSearch.clear();

		this._validate(oldValue, newValue, field)	
		this.search(oldValue, field);

		for(let keys of this.#cacheSearch.keys()){		
			this._data[keys][field] = newValue;
		}

		return `Item was succesful edit by ${field}:${value}`;
	};
}

class ObjectDate extends ObjectJSON {
	#formatter = new Intl.DateTimeFormat('ru', {
		month: '2-digit',
		day: "2-digit"
	});

	sort(field, order = true, byDate) {
		if ((byDate === undefined)) return super.sort(field, order);

		this._validate(field, order, byDate);
		this._validateField(field);

		this._data.sort((a, b) => {
			
			const [dayA, monthA, yearA] = a[field].split('.');
			const [dayB, monthB, yearB] = b[field].split('.');

			switch (byDate) {
				case 1:
					return dayA - dayB;
				case 0:
					return monthA - monthB;
				case -1:
					return yearA - yearB;
				default: 
					throw new Error(`Cannot sort something wrong with date`)
			}
		});

		return order ? this._data : this._data.reverse();
	};

	now(date = undefined) {
		return date ? super.search("Date", date) : 
		 super.search("Date", this.#formatter.format(new Date()));
	};
}

class ObjectTime extends ObjectJSON{
	#formatter = new Intl.DateTimeFormat('ru', {
		hour: 'numeric',
		minute: 'numeric',
	})

	now(time, [start, end]) {
		time = time ? time : this.#formatter.format(Date.now());

		this._validate(time,start,end);
		this._validateField(start, end);

		const found = this._data.find((item) => item[start] <= time && time <= item[end])

		if(!found) throw new Error(`Item was not found by fields [${start},${end}] with value ${time}`);

		return found;
	}

	near(time, start){
		this._validate(time,start);
		this._validateField(start);	
		this.sort(start)

		const found = this._data.find((item) => item[start] > time)

		if(!found) throw new Error(`Item was not near found by fields [${start}] with value ${time}`);

		return found;
	}
}
