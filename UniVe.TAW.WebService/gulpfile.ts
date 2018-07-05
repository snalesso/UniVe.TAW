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

const exportSourcePaths = [
    "src/DTOs"
];

const exportDestinationPaths = [
    , '../UniVe.TAW.WebSite/src/assets/scripts'
]
    .map(dirPath => path.join(dirPath, packageJson.name));

gulp.task('compile-export', function () {

    let missionName = "Copy of " + packageJson.name;
    exportSourcePaths.forEach((exportSource) => {
        try {
            exportDestinationPaths.map(dp => {
                return dp + exportSource.replace("src/", "");
            }).forEach(dest => {
                process.stdout.write('Copying'.yellow + ' to: ' + exportSource + ' ...');
            });
            console.log(" DONE".green);
        } catch (error) {
            console.log(" FAILED".red);
            console.log((missionName + " failed - reason: " + error).red);
        }
    });

    console.log((missionName + ' completed').green);
});