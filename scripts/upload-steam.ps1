param(
  [Parameter(Mandatory = $true)]
  [string]$SteamUsername,

  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$steamCmd = Join-Path $root "steamworks_sdk\tools\ContentBuilder\builder\steamcmd.exe"
$appBuild = Join-Path $root "steampipe\app_build_4906780.vdf"
$gameExecutable = Join-Path $root "dist\win-unpacked\Meme Farm.exe"

if (-not (Test-Path -LiteralPath $steamCmd -PathType Leaf)) {
  throw "SteamCMD was not found at '$steamCmd'. Keep the Steamworks SDK in the repository's steamworks_sdk folder."
}

if (-not $SkipBuild) {
  Write-Host "Building the current Meme Farm source before upload..."
  Push-Location $root
  try {
    & npm.cmd run package:electron
    if ($LASTEXITCODE -ne 0) {
      throw "Electron packaging failed with exit code $LASTEXITCODE."
    }
  } finally {
    Pop-Location
  }
}

if (-not (Test-Path -LiteralPath $gameExecutable -PathType Leaf)) {
  throw "The packaged game was not found at '$gameExecutable'."
}

Write-Host "Uploading Meme Farm App 4906780 / Depot 4906781 from dist\win-unpacked..."
Write-Host "SteamCMD may request your password and Steam Guard code. They are not stored by this script."

& $steamCmd "+login" $SteamUsername "+run_app_build" $appBuild "+quit"

if ($LASTEXITCODE -ne 0) {
  throw "SteamPipe upload failed with exit code $LASTEXITCODE. Check steamworks_sdk\tools\ContentBuilder\output\meme-farm for logs."
}

Write-Host "Upload completed. Set the new build live from Steamworks > SteamPipe > Builds."
