## killed port 5173
- in win:
  -------
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force

- in linux:
  ---------
  fuser -k 5173/tcp