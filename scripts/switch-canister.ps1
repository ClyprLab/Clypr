param(
  [Parameter(Mandatory=$true)]
  [ValidateSet('local','ic')]
  [string]$target
)

$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
node (Join-Path $here 'switch-canister.js') $target
