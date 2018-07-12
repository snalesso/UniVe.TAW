import * as gulp from 'gulp';
import * as gulpTs from 'gulp-typescript';
import * as path from 'path';
const fs = require('fs');
import 'colors';
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
    , '../UniVe.TAW.WebSite/src/assets/scripts'
]
    .map(dirPath => path.join(dirPath, packageJson.name));

gulp.task('export', function () {

    let missionName = "Copy of " + packageJson.name;

    exportDestinationPaths.forEach(dfp => {
        gulp.src(exportSourcePaths)
            .pipe(gulpPrint(path => "Copying ".yellow + path + " to ..."))
            .pipe(gulp.dest(sourceFile => {
                console.log(JSON.stringify(sourceFile));
                let p = path.join(dfp, sourceFile.base, sourceFile.basename);
                process.stdout.write(p + " ...");
                return p;
            }))
            .pipe(gulpPrint(path => " DONE".green));
    });
});