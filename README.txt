Installazione

•	Visual Studio Code
	o	Link per il download: https://code.visualstudio.com/download
•	Node.js
	o	Link per il download: https://nodejs.org/en/download/
•	MongoDB - Community Server
	o	Link per il download: https://www.mongodb.com/download-center?jmp=nav#community
	o	Assicurarsi che la path della cartella che contiene mongod.exe (es. "C:\Program Files\MongoDB\Server\4.0\bin\mongod.exe") sia presente nella variabile di ambiente Path (utente o sistema)
•	JDK
	o	Link per il download: https://www.oracle.com/technetwork/java/javase/downloads/index.html
•	Android Studio
	o	Link per il download: https://developer.android.com/studio/
	o	Assicurarsi che le seguenti funzionalità siano installate e i relativi percorsi inseriti nella variabile di ambiente Path:
	o	Android SDK Emulator
	o	Android SDK Platform-Tools
	o	Android SDK Tools
	o	Android SDK Build Tools
			Almeno una versione di Android
•	CLI
	o	Angular: npm i -g @angular-cli
	o	Ionic: npm i -g ionic
	o	Cordova: npm i -g cordova
	o	gulp: npm i -g gulp-cli
•	Packages
	o	Eseguire nella shell di VSCode di ogni progetto: npm i

Avvio

Avvio web service

•	Aprire la cartella UniVe.TAW.WebService
•	Eseguire: mongod.cmd
•	Aprire la cartella UniVe.TAW.WebService in Visual Studio Code
•	Per generare dati fittizi di utenti e partite, decommentare le righe [88, 114] del file “src/application/ApiService.ts”
•	Eseguire:
	o	Primo avvio: Export dependencies & launch WebService
	o	Riavvio: Launch WebService

Avvio web app

Importante: Prima di avviare il client, assicurarsi di che il task "Export dependencies" del progetto WebService sia stato eseguito almeno una volta, tramite il pannello dei task o tramite il debug launcher “Export dependencies & launch WebService“

Aprire la cartella UniVe.TAW.WebSite in Visual Studio Code
•	Eseguire il comando: npm start
•	Premere: F5

Avvio mobile app

Importante: Prima di avviare il client, assicurarsi di che il task "Export dependencies" del progetto WebService sia stato eseguito almeno una volta, tramite il pannello dei task o tramite il debug launcher “Export dependencies & launch WebService“

•	Aprire la cartella UniVe.TAW.Mobile in Visual Studio Code
•	Aprire il file "src\app\services\ServiceConstants.ts"
•	Web browser
	o	Impostare l'IP del servizio web a: 127.0.0.1
	o	Eseguire il task: ionic cordova run browser
•	Emulatore Android
	o	Impostare l'IP del servizio web a: 10.0.2.2
	o	Eseguire il task: ionic cordova run android

Avvio applicazione windows

Importante: Prima di avviare il client, assicurarsi di che il task "Export dependencies" del progetto WebService sia stato eseguito almeno una volta, tramite il pannello dei task o tramite il debug launcher “Export dependencies & launch WebService“

•	Aprire la cartella UniVe.TAW.Windows in Visual Studio Code
•	Eseguire il comando: npm start