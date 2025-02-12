const http = require("http");
const path = require("path");

const {FileTime, FileArray} = require("./class.js")

const PORT = 5000;
const authorization = "admin:admin"; 

function timeStamp() {
	return new Intl.DateTimeFormat("ru", {
		timeZone: "Asia/Yekaterinburg",
		year: "2-digit",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).format(new Date());
}

const server = http.createServer(async (request, response) => {
	const url = new URL("http://" + request.headers.host + request.url);
	const pathFile = path.join("./json", `${url.pathname.match(/\/\w*/gi)[0]}.json`);
	
	if (
		request.headers.authorization !==
		"Basic " + Buffer.from(authorization).toString("base64")
	) {
		response.statusCode = 401;
		response.setHeader("Content-type", "text/plain");
		console.error(
			`${timeStamp()} WHO IS? !!Failed Authentication!! Family:${
				response.socket.remoteFamily
			}, IP${response.socket.remoteAddress}:${response.socket.remotePort}`
		);
		return response.end(`Not Authorization`);
	}

	console.log(
		`${timeStamp()} Success Authentication Family:${
			response.socket.remoteFamily
		}, IP${response.socket.remoteAddress}:${response.socket.remotePort}`
	);

	const file = new FileArray(pathFile)
	try{
		await file.load();
	}catch(err){
		console.error(`${timeStamp()} !!ERROR!! message: ${err.message}`)
	}

	if(request.method === "GET"){
		switch (url.searchParams.get("action")) {
			case null:
				response.setHeader("Content-Type", "text/json");

				response.statusCode = 200;
				break;

			case "sort":
				response.setHeader("Content-Type", "text/json");

				response.statusCode = 200;
				break;
			case "search":
				response.setHeader("Content-Type", "text/json");

				response.statusCode = 200;
				break;
		}
	}
});

server.listen(PORT, () => {
	console.log(`Server was launched on http://localhost:${PORT}`);
});