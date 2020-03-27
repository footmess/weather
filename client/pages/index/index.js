// 获取应用实例
const app = getApp();

Page({
	data: {
		// 动态修改背景色
		backgroundColor: '#62aadc',
		backgroundImage: '../../images/cloud.jpg',
		paddingTop: '',
		address: '',
		lat: '',
		lon: ''
	},
	// 事件处理函数
	bindViewTap: function() {
		wx.navigateTo({
			url: '../logs/logs'
		});
	},
	onLoad() {
		this.getLocation();
		if (app.globalData.userInfo) {
			this.setData({
				userInfo: app.globalData.userInfo,
				hasUserInfo: true
			});
		} else if (this.data.canIUse) {
			// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
			// 所以此处加入 callback 以防止这种情况
			app.userInfoReadyCallback = (res) => {
				this.setData({
					userInfo: res.userInfo,
					hasUserInfo: true
				});
			};
		} else {
			// 在没有 open-type=getUserInfo 版本的兼容处理
			wx.getUserInfo({
				success: (res) => {
					app.globalData.userInfo = res.userInfo;
					this.setData({
						userInfo: res.userInfo,
						hasUserInfo: true
					});
				}
			});
		}
		wx.getSystemInfo({
			success: (res) => {
				// 状态栏高度和屏幕宽度，单位都是px
				console.log(res.statusBarHeight, res.windowWidth);
				this.setData({
					paddingTop: res.statusBarHeight + 12
				});
			}
		});
	},
	getUserInfo: function(e) {
		console.log(e);
		app.globalData.userInfo = e.detail.userInfo;
		this.setData({
			userInfo: e.detail.userInfo,
			hasUserInfo: true
		});
	},

	// 处理逆地址
	getAddress(lat, lon, name) {
		wx.showLoading({
			title: '定位中',
			mask: true
		});
		let fail = (e) => {
			this.setData({
				address: name || '苏州市虎丘区竹园路'
			});
			wx.hideLoading();
			this.getWeatherData();
		};
		gencoder(
			lat,
			lon,
			(res) => {
				wx.hideLoading();
				let result = (res.data || {}).result;
				if (res.statusCode === 200 && result && result.address) {
					let { address, formatted_addresses, address_component } = result;
					if (formatted_addresses && (formatted_addresses.recommemd || formatted_addresses.rough)) {
						address = formatted_addresses.recommemd || formatted_addresses.rough;
					}
					let { province, city, district: county } = address_component;
					this.setData({
						province,
						city,
						county,
						address: name || address
					});
					this.getWeatherData();
				} else {
					fail();
				}
			},
			fail
		);
	},

	// 更新data数据 调用getAddress
	updateLocation(res) {
		let { latitude: lat, longitude: lon, name } = res;
		let data = {
			lat,
			lon
		};
		if (name) {
			data.address = name;
		}
		this.setData(data);
		this.getAddress(lat, lon, name);
	},

	// 调用wx api获取位置
	getLocation() {
		// 获取经纬度
		wx.getLocation({
			type: 'gcj02',
			success: this.updateLocation,
			fail: (e) => {
				this.openLocation();
			}
		});
	},

	// 调用wx.getLocation失败,提示用户打开位置权限
	openLocation() {
		wx.showToast({
			title: '检测到您未授权使用位置权限，请先开启',
			icon: 'none',
			duration: 3000
		});
	},

	// 点击地址栏重新选择位置
	chooseLocation() {
		wx.chooseLocation({
			success: (res) => {
				let { latitude, longitude } = res;
				let { lat, lon } = this.data;
				if (latitude === lat && longitude === lon) {
					this.getWeatherData();
				} else {
					this.updateLocation(res);
				}
			}
		});
	}
});
