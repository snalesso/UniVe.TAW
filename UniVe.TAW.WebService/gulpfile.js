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
var exportSourcePaths = [
    "src/DTOs"
];
var exportDestinationPaths = [
    ,
    '../UniVe.TAW.WebSite/src/assets/scripts'
]
    .map(function (dirPath) { return path.join(dirPath, packageJson.name); });
gulp.task('compile-export', function () {
    var missionName = "Copy of " + packageJson.name;
    exportSourcePaths.forEach(function (exportSource) {
        try {
            exportDestinationPaths.map(function (dp) {
                return dp + exportSource.replace("src/", "");
            }).forEach(function (dest) {
                process.stdout.write('Copying'.yellow + ' to: ' + exportSource + ' ...');
            });
            console.log(" DONE".green);
        }
        catch (error) {
            console.log(" FAILED".red);
            console.log((missionName + " failed - reason: " + error).red);
        }
    });
    console.log((missionName + ' completed').green);
});
//# sourceMappingURL=gulpfile.js.map