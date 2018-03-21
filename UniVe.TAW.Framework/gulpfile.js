const gulp = require("gulp");
const ts = require("gulp-typescript");

const tsProject = ts.createProject("tsconfig.json");
const copyToDirs = [
    "../UniVe.TAW.Server/src/libs/UniVe.TAW.Framework",
    "../UniVe.TAW.Mobile/src/assets/scripts/UniVe.TAW.Framework"
    // ,"../UniVe.TAW.Server/src/web-site/public/scripts/UniVe.TAW.Framework"
    // ,"../UniVe.TAW.Server/src/web-service/api/libs/UniVe.TAW.Framework"
]

gulp.task("default", function () {

    tsProject.options.declaration = true;

    const compiledTs = tsProject
        .src()
        .pipe(tsProject());

    copyToDirs.forEach((dirPath) => {
        compiledTs.js.pipe(gulp.dest(dirPath));
        compiledTs.dts.pipe(gulp.dest(dirPath));
    });
});