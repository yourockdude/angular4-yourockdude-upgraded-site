IF %1==ru GOTO No1
IF %1==com GOTO No2
GOTO End1

:No1
  ftp -i -s:ftp-ru.txt
  dploy ru
:No2
  ftp -i -s:ftp-com.txt
  dploy com
GOTO End1

:End1
  


