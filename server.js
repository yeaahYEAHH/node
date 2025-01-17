const http = require("http");
const path = require("path");

const PORT = 5000;

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
	const [filename, action] = url.pathname.match(/\/\w*/gi);
	const pathObj = path.join("./json", `${filename}.json`);

	const token = "YWRtaW46YWRtaW4="; // admin : admin

	if (request.headers.authorization !== "Basic " + token) {
		response.statusCode = 401;
		response.setHeader("Content-type", "text/plain");
		console.error(
			`${timeStamp()} WHO IS? !!Failed Authentication!! Family:${
				response.socket.remoteFamily
			}, IP${response.socket.remoteAddress}:${
				response.socket.remotePort
			}`
		);
		return response.end(`Not Authorization`);
	}

	console.log(
		`${timeStamp()} Success Authentication Family:${
			response.socket.remoteFamily
		}, IP${response.socket.remoteAddress}:${response.socket.remotePort}`
	);

	response.end("end");
});

server.listen(PORT, () => {
	console.log(`Server was launched on http://localhost:${PORT}`);
});