for %%f in (.\*.mp3) do .\converter\bin\ffmpeg.exe -y -i %%f -ac 2 -codec:a libmp3lame -b:a 48k -ar 16000 ..\%%f

for %%f in (.\*.wav) do .\converter\bin\ffmpeg.exe -y -i %%f -ac 2 -codec:a libmp3lame  -b:a 48k -ar 16000 -f mp3 ..\%%~nf.mp3
