import * as gulp from 'gulp';
import * as gulpTs from 'gulp-typescript';
import * as path from 'path';
// import * as fs from 'fs';
import chalk from 'chalk';

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
    , '../UniVe.TAW.WebSite/src/assets/scripts'
]
    .map(dirPath => path.join(dirPath, packageJson.name));

gulp.task('export', function () {

    let missionName = "Copy of " + packageJson.name;

    exportDestinationPaths.forEach(dfp => {
        gulp.src(exportSourcePaths)
            .pipe(gulpPrint(path => chalk.yellow("Copying ") + path + " to ..."))
            .pipe(gulp.dest(sourceFile => {
                console.log(JSON.stringify(sourceFile));
                let p = path.join(dfp, sourceFile.base, sourceFile.basename);
                process.stdout.write(p + " ...");
                return p;
            }))
            .pipe(gulpPrint(path => chalk.green(" DONE")));
    });
});