
export const errorHandler = async function(message : Event | string, source? : string, lineno? : number, colno? : number, error? : Error) {
	console.log('message', message);
	console.log('source', source);
	console.log('lineno', lineno);
	console.log('colno', colno);
	console.log('error', error);

}

window.onerror =  function(message : Event | string, source : string, lineno : number, colno : number, error : Error) {
	errorHandler(message, source, lineno, colno, error);
};