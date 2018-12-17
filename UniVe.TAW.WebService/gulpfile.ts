import * as gulp from 'gulp';
import * as undertaker from 'undertaker';
import gulpPrint from 'gulp-print';
import chalk from 'chalk';
var del = require('del');
import * as path from 'path';

interface IExportBatch {
    projectName: string,
    sourceFolder: string,
    destFolderName: string,
    fileNames: string[]
}

const exportDestFolderName = "/src/assets/unive.taw.webservice";
const exportBatches: IExportBatch[] = [
    {
        projectName: "UniVe.TAW.WebSite",
        sourceFolder: "./src",
        fileNames: [
            "/infrastructure/net.ts",
            "/infrastructure/identity.ts",
            "/infrastructure/game.ts",
            "/infrastructure/game.client.ts",
            "/infrastructure/chat.ts",
            "/infrastructure/utils.ts",
            "/application/DTOs.ts",
            "/application/routing/RoutingParamKeys.ts",
            "/application/services/ServiceEventKeys.ts"
        ],
        destFolderName: exportDestFolderName
    },
    {
        projectName: "UniVe.TAW.Mobile",
        sourceFolder: "./src",
        fileNames: [
            "/infrastructure/net.ts",
            "/infrastructure/identity.ts",
            "/infrastructure/game.ts",
            "/infrastructure/game.client.ts",
            "/infrastructure/chat.ts",
            "/infrastructure/utils.ts",
            "/application/DTOs.ts",
            "/application/routing/RoutingParamKeys.ts",
            "/application/services/ServiceEventKeys.ts"
        ],
        destFolderName: exportDestFolderName
    },
    {
        projectName: "UniVe.TAW.Windows",
        sourceFolder: "./src",
        fileNames: [
            "/infrastructure/net.ts",
            "/infrastructure/identity.ts",
            "/infrastructure/game.ts",
            "/infrastructure/game.client.ts",
            "/infrastructure/chat.ts",
            "/infrastructure/utils.ts",
            "/application/DTOs.ts",
            "/application/routing/RoutingParamKeys.ts",
            "/application/services/ServiceEventKeys.ts"
        ],
        destFolderName: exportDestFolderName
    }
];

const cleanFuncs: undertaker.Task[] = exportBatches.map(
    eb => {
        const func: undertaker.Task = (cb) => {
            const dests = eb.fileNames.map(ed => path.join("..", eb.projectName, eb.destFolderName));
            console.log(chalk.yellow("Cleaning") + " " + chalk.blueBright(eb.projectName) + "'s dependencies ... ");
            return del(dests, { force: true });
        };
        func["displayName"] = "clean:" + eb.projectName;
        return func;
    });

const cleanAllTask = gulp.series(...cleanFuncs);

const exportFuncs: undertaker.Task[] = exportBatches.map(
    eb => {
        const func: undertaker.Task = (cb) => {

            console.log(chalk.green("Exporting to ") + eb.projectName + ":");

            //const sourceFilePaths = exportDestination.fileNames.map(fileName => path.join(exportDestination.sourceFolder, fileName));

            return gulp
                .src(eb.fileNames, { root: eb.sourceFolder })
                .pipe(gulpPrint(fileName => chalk.blue("- ") + fileName + " ..."))
                .pipe(gulp.dest(file => {
                    const destFilePath = file.base.substr(path.join(file.cwd, eb.sourceFolder).length);
                    //console.log(destFilePath);
                    //console.log(file.base);
                    return path.join("..", eb.projectName, eb.destFolderName, destFilePath);
                }))
                //.pipe(gulpPrint(chalk.green("DONE")))
                ;
        };
        func["displayName"] = "export-to:" + eb.projectName;
        return func;
    });

const exportAllTask = gulp.series(...exportFuncs);

gulp.task("export-dependencies", gulp.series(cleanAllTask, exportAllTask));