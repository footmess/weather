const QQ_MAP_KEY = 'ZVDBZ-VGL64-HKQU7-DESIF-5AFFF-Z2FKV';
// 填写 env
wx.cloud.init({
	env: ''
});

/**
 *  逆地址查询
 * @param {*} lat
 * @param {*} lon
 */
export const gencoder = (lat, lon, success = () => {}, fail = () => {}) => {
	return wx.request({
		url: 'https://apis.map.qq.com/ws/geocoder/v1/',
		data: {
			//参数 location：维度，经度；key:秘钥
			location: `${lat},${lon}`,
			key: QQ_MAP_KEY
		},
		success,
		fail
	});
};

export const test = () => {
	return wx.cloud.callFunction({
		name: 'test',
		data: {
			a: 1,
			b: 3
		}
	});
};

export const test2 = () => {
	return wx.cloud.callFunction({
		name: 'test2'
	});
};
