import * as gulp from 'gulp';
import * as gulpTs from 'gulp-typescript';
import * as path from 'path';
const del = require('del');
// import * as fs from 'fs';
const fs = require('fs');
//import 'colors';
import chalk from 'chalk';
import gulpPrint from 'gulp-print';

const packageJson = JSON.parse(fs.readFileSync('./package.json'));
const tsProject = gulpTs.createProject('tsconfig.json');

const copyTs = true;
const copyDTs = false;
const copyJs = false;

const importDestPath = "./src/assets/imported";
const imports: { bundleName: string, filePaths: string[] }[] = [
    {
        bundleName: "unive.taw.webservice",
        filePaths: [
            "../UniVe.TAW.WebService/src/core/net.ts",
            "../UniVe.TAW.WebService/src/core/identity.ts",
            "../UniVe.TAW.WebService/src/core/game.ts",
            "../UniVe.TAW.WebService/src/core/game.client.ts",
            "../UniVe.TAW.WebService/src/core/chat.ts"
        ]
    }
];

gulp.task("clean-imports", () => {
    console.log(chalk.yellow("Cleaning " + chalk.underline("imported") + " folder ... "));
    return del([path.join(importDestPath, "/**")], { force: true });
});

gulp.task("import", ["clean-imports"], () => {
    imports.forEach(imp => {

        console.log(chalk.yellow("Importing ") + imp.bundleName + " ...");

        gulp.src(imp.filePaths)
            .pipe(gulpPrint(filePathToImport => chalk.yellow("Importing ") + filePathToImport + " ..."))
            .pipe(gulp.dest(sourceFile => path.join(importDestPath, imp.bundleName)));
    });

    //console.log(chalk.green("DONE") + " importing " + imp.bundleName + " ...");
});

gulp.task("test", ["import"]);

// gulp.task('import', function () {

//     let missionName = "Copy of " + packageJson.name;

//     gulp.src(imports)
//         .pipe(gulpPrint(filePathToImport => chalk.yellow("Copying ") + filePathToImport + " to ..."))
//         .pipe(gulp.dest(sourceFile => {
//             console.log(JSON.stringify(sourceFile));
//             let p = path.join(importDestPath, sourceFile.base, sourceFile.basename);
//             process.stdout.write(p + " ...");
//             return p;
//         }))
//         .pipe(gulpPrint(path => chalk.green(" DONE")));
// });