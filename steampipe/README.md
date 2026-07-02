# Meme Farm SteamPipe upload

This configuration uploads App `4906780`, Depot `4906781`, from `dist/win-unpacked`.

1. Build and upload it with your Steam login name:

   ```powershell
   npm run steam:upload -- -SteamUsername YOUR_STEAM_LOGIN
   ```

   This packages the current source first. SteamCMD may then prompt for your password and Steam Guard code. Neither is stored in this repository.

2. In Steamworks, open **SteamPipe > Builds**, select the uploaded build, and set it live on `default` or a private testing branch.

3. In Steam, install or update Meme Farm and launch it from the library.

Before the first test, configure the Windows launch option in Steamworks to run `Meme Farm.exe`.
