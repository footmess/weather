//app.js
App({
	//小程序初始化完成只执行一次
	onLaunch: function() {
		// 展示本地存储能力
		var logs = wx.getStorageSync('logs') || [];
		logs.unshift(Date.now());
		wx.setStorageSync('logs', logs);
		// 获取用户信息
		wx.getSetting({
			success: (res) => {
				if (res.authSetting['scope.userInfo']) {
					console.log('auth');
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: (res) => {
							console.log('auth1');
							// 可以将 res 发送给后台解码出 unionId
							this.globalData.userInfo = res.userInfo;

							// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
							// 所以此处加入 callback 以防止这种情况
							if (this.userInfoReadyCallback) {
								this.userInfoReadyCallback(res);
							}
						}
					});
				}
			}
		}),
			// 登录
			wx.login({
				success: (res) => {
					console.log('login');
					// 发送 res.code 到后台换取 openId, sessionKey, unionId
				}
			});
	},
	globalData: {
		userInfo: null
	}
});
