// const gulp = require('gulp');
const { watch, task, src, dest } = require('gulp');
const rename = require('gulp-rename');
const del = require('del');

const through = require('through2');
const colors = require('ansi-colors');
const log = require('fancy-log');

const postcss = require('gulp-postcss');
const pxtorpx = require('postcss-px2rpx');
const base64 = require('postcss-font-base64');

const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const jsonminify = require('gulp-jsonminify');
const combiner = require('stream-combiner2');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const runSequence = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');
const filter = require('gulp-filter');
const jdists = require('gulp-jdists');

// const gulpLoadplugins = require('gulp-load-plugins');
// gulpLoadplugins是定义的变量名，可自行修改
// const _$ = gulpLoadplugins();

const src = './src';
const dist = './dist';
// 判断 gulp --type prod 命名 type 是否是生产打包
const isProd = process.env.Node_ENV === 'production' || false;

// Gulp 是以 task 为核心的打包工具，针对不同的文件类型（比如通过正则过滤）可以配置不同的流程控制 pipe 管道流
// 报错信息处理
const handleError = (err) => {
	console.log('\n');
	log(colors.red('Error!'));
	log('fileName: ' + colors.red(err.fileName));
	log('lineNumber: ' + colors.red(err.lineNumber));
	log('message: ' + err.message);
	log('plugin: ' + colors.yellow(err.plugin));
};

// gulp.task创建一个任务
// gulp.src表示创建的任务是针对文件目录中的那些位置
// gulp.dest表示目标文件被处理完毕之后会在哪个位置重新生成
// task start  基本就是格式转换+压缩
// 压缩json文件
gulp.task('json', () => {
	return gulp
		.src(`${src}/**/*.json`)
		.pipe(

				isProd ? jsonminify() :
				through.obj()
		)
		.pipe(gulp.dest(dist));
});

// 压缩wxml
gulp.task('wxml', () => {
	return gulp.src(`${src}/**/*.wxml`).pipe(

			isProd ? htmlmin({
				collapseWhitespace: true,
				removeComments: true,
				keepClosingSlash: true
			}) :
			through.obj().pipe(gulp.dest(dist))
	);
});

// 移动wxs文件
gulp.task('wxs', () => {
	return gulp.src(`${src}/**/*.wxs`).pipe(gulp.dest(dist));
});

// wxss task 把px转为rpx，把webfont转换为 base64格式
gulp.task('wxss', () => {
	const combined = combiner.obj([
		gulp.src(`${src}/**/*.{wxss,scss}`),
		sass().on('error', sass.logError),
		postcss([ pxtorpx(), base64() ]),


			isProd ? cssnano({ autoprefixer: false, discardComments: { removeAll: true } }) :
			through.obj(),
		rename((path) => {
			path.extname = '.wxss';
		}),
		gulp.dest(dist)
	]);
	combined.on('error', handleError);
});

// images移动
gulp.task('images', () => {
	return gulp.src(`${src}/images/**`).pipe(gulp.dest(`${dist}/images`));
});

// js task
gulp.task('js', () => {
	const f = filter((file) => !/(mock|bluebird)/.test(file.path));
	gulp
		.src(`${src}/**/*.js`)
		.pipe(

				isProd ? f :
				through.obj()
		)
		.pipe(

				isProd ? jdists({ trigger: 'prod' }) :
				jdists({ trigger: 'dev' })
		)
		.pipe(

				isProd ? through.obj() :
				sourcemaps.init()
		)
		.pipe(babel({ presets: [ 'env' ] }))
		.pipe(

				isProd ? uglify({ compress: true }) :
				through.obj()
		)
		.pipe(

				isProd ? through.obj() :
				sourcemaps.write('./')
		)
		.pipe(gulp.dest(dist));
});

// watch task
// gulp.watch表示监听那些位置文件的变化 参数（glob路径，options，task name）
gulp.task('watch', () => {
	[ 'wxml', 'wxss', 'js', 'json', 'wxs' ].forEach((v) => {
		gulp.watch(`${src}/**/*.${v}`, [ v ]);
	});
	gulp.watch(`${src}/images/**`, [ 'images' ]);
	gulp.watch(`${src}/**/*.scss`, [ 'wxss' ]);
});

gulp.task('clean', () => {
	return del([ './dist/**' ]);
});

gulp.task('dev', [ 'clean' ], () => {
	// gulp里的task都是异步并发执行的，有的时候我们需要一连串的task按顺序执行
	runSequence('json', 'images', 'wxml', 'wxss', 'js', 'wxs', 'cloud', 'watch');
});

gulp.task('build', [ 'clean' ], () => {
	runSequence('json', 'images', 'wxml', 'wxss', 'js', 'wxs', 'cloud');
});

// cloud-functions处理方法
const cloudPath = './server/cloud-functions';
gulp.task('cloud', () => {
	return gulp
		.src(`${cloudPath}/**`)
		.pipe(

				isProd ? jdists({ trigger: 'prod' }) :
				jdists({ trigger: 'dev' })
		)
		.pipe(gulp.dest(`${dist}/cloud-functions`));
});

gulp.task('watch:cloud', () => {
	gulp.watch(`${cloudPath}/**`, [ 'cloud' ]);
});

gulp.task('cloud:dev', () => {
	runSequence('cloud', 'watch:cloud');
});
