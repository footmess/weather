// 支持引入共同模块
/*<jdists import="../../inline/utils.js" />*/

// 这个云函数将传入的 a 和 b 相加返回
exports.main = async (e) => {
	const { a, b } = e;
	return new Promise((resolve, reject) => {
		resolve({ result: Number.parseInt(a) + Number.parseInt(b) });
	});
};
