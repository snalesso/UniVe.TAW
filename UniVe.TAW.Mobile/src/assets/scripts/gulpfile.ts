const gulp = require('gulp');
const gulpTs = require('gulp-typescript');
const path = require('path');
const fs = require('fs');
const colors = require('colors');
//const del = require('del');

const packageJson = JSON.parse(fs.readFileSync('./package.json'));
const tsProject = gulpTs.createProject('tsconfig.json');

const copyTs = true;
const copyDTs = false;
const copyJs = false;

const copyToDirs = [
    , '../UniVe.TAW.WebService/libs'
    , '../UniVe.TAW.WebSite/src/assets/scripts'
    , '../UniVe.TAW.Mobile/src/assets/scripts'
]
    .map(dirPath => path.join(dirPath, packageJson.name));

// TODO: empty dest folder
// TODO: make dest copied files readonly
gulp.task('export', function () {

    tsProject.options.declaration = true;

    const rawTs = tsProject.src();
    const compiledTs = tsProject
        .src()
        .pipe(tsProject());

    let missionName = "Copy of " + packageJson.name;
    copyToDirs.forEach((dirPath) => {
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
        } catch (error) {
            console.log(" FAILED");
            console.log((missionName + " failed - reason: " + error));
        }
    });

    console.log((missionName + ' completed'));
});