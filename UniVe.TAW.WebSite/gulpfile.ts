import * as gulp from 'gulp';
import gulpPrint from 'gulp-print';
import * as path from 'path';
const del = require('del');
import chalk from 'chalk';


const importDestPath = "./src/assets/imported";
const imports: { bundleName: string, filePaths: string[] }[] = [
    {
        bundleName: path.join("unive.taw.webservice", "infrastructure"),
        filePaths: [
            "../UniVe.TAW.WebService/src/infrastructure/net.ts",
            "../UniVe.TAW.WebService/src/infrastructure/identity.ts",
            "../UniVe.TAW.WebService/src/infrastructure/game.ts",
            "../UniVe.TAW.WebService/src/infrastructure/game.client.ts",
            "../UniVe.TAW.WebService/src/infrastructure/chat.ts"
        ]
    },
    {
        bundleName: path.join("unive.taw.webservice", "application"),
        filePaths: [
            "../UniVe.TAW.WebService/src/application/DTOs.ts"
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
});

gulp.task("test", ["import"]);