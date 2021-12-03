
export const errorHandler = async function(message, source, lineno, colno, error) {
	var errorInfo = {
		message, source, lineno, colno, error
	};
	console.log('message', message);
	console.log('source', source);
	console.log('lineno', lineno);
	console.log('colno', colno);
	console.log('error', error);

	await Moralis.Cloud.run("jsError", errorInfo);
}

window.onerror = function(message, source, lineno, colno, error) {
	errorHandler(message, source, lineno, colno, error);

	return true;
 };