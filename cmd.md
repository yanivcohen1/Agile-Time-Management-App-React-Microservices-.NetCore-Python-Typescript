## killed port 5173
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force