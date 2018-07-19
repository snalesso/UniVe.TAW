"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gulp = require("gulp");
var gulpTs = require("gulp-typescript");
var path = require("path");
// import * as fs from 'fs';
var chalk_1 = require("chalk");
var fs = require('fs');
var gulpPrint = require('gulp-print').default;
var packageJson = JSON.parse(fs.readFileSync('./package.json'));
var tsProject = gulpTs.createProject('tsconfig.json');
var copyTs = true;
var copyDTs = false;
var copyJs = false;
var exportSourcePaths = [
    "./src/DTOs"
];
var exportDestinationPaths = [
    // D:\Dev\Repos\GitHub\snalesso\UniVe.TAW\UniVe.TAW.WebSite\src\assets\scripts
    ,
    '../UniVe.TAW.WebSite/src/assets/scripts'
]
    .map(function (dirPath) { return path.join(dirPath, packageJson.name); });
gulp.task('export', function () {
    var missionName = "Copy of " + packageJson.name;
    exportDestinationPaths.forEach(function (dfp) {
        gulp.src(exportSourcePaths)
            .pipe(gulpPrint(function (path) { return chalk_1.default.yellow("Copying ") + path + " to ..."; }))
            .pipe(gulp.dest(function (sourceFile) {
            console.log(JSON.stringify(sourceFile));
            var p = path.join(dfp, sourceFile.base, sourceFile.basename);
            process.stdout.write(p + " ...");
            return p;
        }))
            .pipe(gulpPrint(function (path) { return chalk_1.default.green(" DONE"); }));
    });
});
//# sourceMappingURL=gulpfile.js.map