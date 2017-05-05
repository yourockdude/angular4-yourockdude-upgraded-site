IF %1==ru GOTO No1
IF %1==com GOTO No2
GOTO End1

:No1
  powershell -Command "(gc "dist/index.html") -replace '<!--yandex metrika-->', (gc "deploy-ru/metrika-ru.txt") | Out-File -encoding ASCII "deploy-ru/index.html"
  ftp -i -s:"deploy-ru/ftp-ru.txt"
  dploy ru
:No2
  powershell -Command "(gc "dist/index.html") -replace '<!--yandex metrika-->', (gc "deploy-com/metrika-com.txt") | Out-File -encoding ASCII "deploy-com/index.html"
  ftp -i -s:"deploy-com/ftp-com.txt"
  dploy com
GOTO End1

:End1
  


