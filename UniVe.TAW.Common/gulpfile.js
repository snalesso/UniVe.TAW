var gulp = require('gulp');
var gulpTs = require('gulp-typescript');
var path = require('path');
var fs = require('fs');
var colors = require('colors');
//const del = require('del');
var packageJson = JSON.parse(fs.readFileSync('./package.json'));
var tsProject = gulpTs.createProject('tsconfig.json');
var copyTs = true;
var copyDTs = false;
var copyJs = false;
var copyToDirs = [
    ,
    '../UniVe.TAW.WebService/libs',
    '../UniVe.TAW.WebSite/src/assets/scripts',
    '../UniVe.TAW.Mobile/src/assets/scripts'
]
    .map(function (dirPath) { return path.join(dirPath, packageJson.name); });
// TODO: empty dest folder
// TODO: make dest copied files readonly
gulp.task('export', function () {
    tsProject.options.declaration = true;
    var rawTs = tsProject.src();
    var compiledTs = tsProject
        .src()
        .pipe(tsProject());
    var missionName = "Copy of " + packageJson.name;
    copyToDirs.forEach(function (dirPath) {
        try {
            //process.stdout.write('Cleaning'.yellow + ' ' + dirPath + ' ...');
            // del(dirPath);
            process.stdout.write('Copying' + ' to: ' + dirPath + ' ...');
            if (copyTs)
                rawTs.pipe(gulp.dest(dirPath));
            if (copyJs)
                compiledTs.js.pipe(gulp.dest(dirPath));
            if (copyDTs)
                compiledTs.dts.pipe(gulp.dest(dirPath));
            console.log(" DONE");
        }
        catch (error) {
            console.log(" FAILED");
            console.log((missionName + " failed - reason: " + error));
        }
    });
    console.log((missionName + ' completed'));
});
//# sourceMappingURL=gulpfile.js.map