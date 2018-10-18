"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gulp = require("gulp");
const gulpTs = require("gulp-typescript");
const path = require("path");
// import * as fs from 'fs';
const chalk_1 = require("chalk");
const fs = require('fs');
const gulpPrint = require('gulp-print').default;
const packageJson = JSON.parse(fs.readFileSync('./package.json'));
const tsProject = gulpTs.createProject('tsconfig.json');
const copyTs = true;
const copyDTs = false;
const copyJs = false;
const exportSourcePaths = [
    "./src/DTOs"
];
const exportDestinationPaths = [
    // D:\Dev\Repos\GitHub\snalesso\UniVe.TAW\UniVe.TAW.WebSite\src\assets\scripts
    ,
    '../UniVe.TAW.WebSite/src/assets/scripts'
]
    .map(dirPath => path.join(dirPath, packageJson.name));
gulp.task('export', function () {
    let missionName = "Copy of " + packageJson.name;
    exportDestinationPaths.forEach(dfp => {
        gulp.src(exportSourcePaths)
            .pipe(gulpPrint(path => chalk_1.default.yellow("Copying ") + path + " to ..."))
            .pipe(gulp.dest(sourceFile => {
            console.log(JSON.stringify(sourceFile));
            let p = path.join(dfp, sourceFile.base, sourceFile.basename);
            process.stdout.write(p + " ...");
            return p;
        }))
            .pipe(gulpPrint(path => chalk_1.default.green(" DONE")));
    });
});
//# sourceMappingURL=gulpfile.js.map